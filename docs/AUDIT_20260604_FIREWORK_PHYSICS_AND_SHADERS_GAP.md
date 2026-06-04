# 万华烟花 (KaleidoFire) — 烟火物理与渲染管线差距审计报告 (AUDIT_REPORT)
> **项目版本**: V1.1.0-STABLE  
> **报告类型**: 烟花物理动力学与着色器渲染审计  
> **对比参考**: Project Qianshu-Rhythm v6.0 (`js/VisualEngine.js`, `docs/SPEC_20260420_FIREWORK_PHYSICS_WHITEPAPER_V2.md`)  
> **生效日期**: 2026-06-04  
> **管理规范**: SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md  

---

## 📖 一、 审计概述与核心目的

本报告旨在深度对标 **「千树流律 (Project Qianshu-Rhythm)」** 的 `VisualEngine.js` 物理引擎与开发白皮书，对 **「万华烟火 (KaleidoFire)」** 的 GPU 粒子渲染、物理动力学、数学形态库及声音联动进行二次审查。

审计的基本原则是：**KaleidoFire 只做极致的烟花模拟，绝不展开任何其他模块，亦不增加任何外部功能。** 

通过对比，我们发现了 **3 项逻辑缺陷/BUG** 以及 **4 项深层的物理/着色器渲染差距**。以下是具体的诊断详情与修复优化方案。

---

## 🛠️ 二、 发现的 BUG 与逻辑错误 (Bugs Audited)

### BUG-1 🔴 `generateShape` 默认半径覆盖冲突（形态尺寸失真）
*   **文件**: [shapes.ts:421](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts#L421) 与 [FireworkPool.ts:230](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts#L230)
*   **代码证据**:
    ```typescript
    // src/lib/gpu-engine/shapes.ts
    export function generateShape(type: string, count: number, origin = [0, 0, 0], R = 5.2): Float32Array
    
    // src/lib/gpu-engine/FireworkPool.ts
    const targets = generateShape(config.type, count, [ox, oy, oz]); // 未传递 R
    ```
*   **根因分析**: 
    在 2026-05-14 校准中，虽然各形态（如 `shapePeony`）的默认物理半径均已规范为 `36`（对应 Qianshu 的 `BURST_RADIUS`），但在 `FireworkPool.ts` 调用 `generateShape` 分发时并未传入第四个参数 `R`。这导致 `generateShape` 内部的形参默认值 `5.2` 覆盖了具体形态的默认值。
*   **修复建议**: 
    修正 `generateShape` 中的形参，或者在 `FireworkPool.ts` 显式获取并传递当前形态所匹配的物理尺寸，防止尺寸被强制矮化。

### BUG-2 🟡 顶点着色器中的死代码（冗余大小计算）
*   **文件**: [FireworkPool.ts:49](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts#L49) 与 [L110](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts#L110)
*   **代码证据**:
    ```glsl
    // src/lib/gpu-engine/FireworkPool.ts
    // L49:
    gl_PointSize = mix(2.5, 6.0, aTiming.w) * (280.0 / max(-pos.z, 2.0));
    ...
    // L110 (覆盖重写):
    if (isRocket) {
        gl_PointSize = mix(1.2, 3.2, aTiming.w) * (110.0 / -mv.z);
    } else {
        gl_PointSize = baseSize * aStyle.x * tailBoost * (110.0 / -mv.z);
    }
    ```
*   **根因分析**:
    第 49 行的 `gl_PointSize` 赋值在 `main()` 结束前被底部的 `if-else` 分支完全覆盖，成为了死代码。且第 49 行使用未转化的世界坐标 `pos.z` 计算点大小是不正确的，应当采用相机空间坐标 `mv.z`。
*   **修复建议**:
    物理删除 `FireworkPool.ts` 第 49 行，保持 Shader 逻辑清爽。

### BUG-3 🟡 缺失发射筒空气冲击声（音效单调）
*   **文件**: [useFireworkSystem.ts:52-53](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/hooks/useFireworkSystem.ts#L52-L53)
*   **代码证据**:
    ```typescript
    const playLaunchSound = useCallback(() => {
    }, []); // 留空
    ```
*   **根因分析**:
    之前的重构虽然统一了音频引擎，但 `playLaunchSound` 被遗留为空函数。这导致烟花升空时只有画面，没有发射的音效反馈，降低了拟真度和节奏感。
*   **修复建议**:
    在 `instruments.ts` 中实现一个纯净、无噪声、低阻尼的正弦扫频（Sine sweep 90Hz -> 30Hz, 150ms 持续时间）作为发射声 `playLaunchThump(velocity)`，并在 `playLaunchSound` 中调用，以此还原 mortar 发射的机械回响。

---

## 🎨 三、 对标 Qianshu-Rhythm 的核心物理与渲染差距 (Core Gaps)

### GAP-1 🔴 粒子运动模型为“几何图案展开”而非“速度积分”
*   **根因分析**:
    *   **Qianshu 物理模型**: 使用真实的初始速度向量进行时间积分：`pos = origin + aVelocity * drift * burst`。粒子携带火药推送速度飞向四方，并在空气阻力 (`k_drag`) 作用下自然减速并下坠。
    *   **KaleidoFire 现状**: 缺失 `aVelocity` 属性，采用简单的插值展开：`pos = origin + dir * (R + extraR) * burst`。这导致烟花在爆炸瞬间膨胀到 `R` 的几何大小后，粒子在后续的生命周期中几乎呈静止态（仅能沿着 extraR 缓慢外拓 10%），缺乏烟花炸裂后持续膨胀减速的律动感。
*   **优化方案**:
    1. 在 `FireworkPool.ts` 引入 `aVelocity` 属性（3-float）。
    2. 在 CPU 侧的 `generateShape` 中，根据形态的初始方向向量和预设炸药威力（`shellRadius * rng(1.8, 2.5)`）为每颗粒子赋予真实的初速度 `aVelocity` 并上传。
    3. 重构着色器，使用速度积分公式计算位置，使粒子具备逼真的动能衰减过程。

### GAP-2 🔴 片元着色器粒子拖尾方向始终为竖直 Y 轴
*   **根因分析**:
    *   **KaleidoFire 现状**: [FireworkPool.ts:128](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts#L128) 采用 `vec2 oval = vec2(c.x, c.y * mix(1.0, 0.24, tail));` 压缩 Y 轴来制造拖尾。这意味着无论粒子朝哪个方向飞行，它的尾迹都永远保持绝对垂直，在横向飞行的粒子上显得极其违和。
    *   **Qianshu 渲染模型**: 顶点着色器计算粒子的速度切线向量并将 `vDir` 传给片元着色器，片元着色器通过点积和正交投影将粒子在屏幕空间沿其**实际运动方向**进行拉伸，呈现出极为逼真的动态流星火雨轨迹。
*   **优化方案**:
    1. 在顶点着色器中计算粒子的实际飞行方向 `vDir = length(aVelocity) > 0.001 ? normalize(aVelocity) : vec3(0, 1, 0)` 并传给 Varying。
    2. 在片元着色器中，利用速度的屏幕投影 `vDir.xy` 构建动态正交旋转矩阵，旋转 `gl_PointCoord` 后的拉伸坐标轴，从而实现切线拖尾。

### GAP-3 🟡 缺失燃烧材料属性 `aMaterial`（亮度衰减单一）
*   **根因分析**:
    *   **Qianshu 物理模型**: 引入了 `aMaterial` 控制燃速（`burnRate`）与闪烁（`sparkle`），例如闪光型形态（Strobe）的粒子在半空中会呈现周期性、不规则的闪烁（flicker），使得质感极为真实。
    *   **KaleidoFire 现状**: 缺失材料物理属性，所有形态粒子均经历统一的平滑光衰，无法实现亮度的断续跳动与火花碎裂感。
*   **优化方案**:
    1. 引入 `aMaterial` 属性（4-float：`x=burnRate, y=sparkle, z=crackle, w=smokeYield`）。
    2. 在顶点着色器中使用 `aMaterial.y` 与正弦 LFO、随机种子控制粒子的透明度，使閃烁型烟花产生一亮一暗、断续燃烧的高保真颗粒质感。

### GAP-4 🟡 缺失真实的二阶段母星裂变演化 (Crossette Split)
*   **根因分析**:
    *   **Qianshu 物理模型**: `Crossette` (爆裂型) 的母星飞到中途寿命（约 300ms），在空中真实的物理轨迹点 `splitPos` 触发二次爆炸，分裂成 4 颗沿局部十字高速放射的子星，且大丽花和牡丹也支持延迟演化。
    *   **KaleidoFire 现状**: 不支持半空裂变，仅通过 Shader 里的 `morphConfig` 进行形态的渐变插值，视觉感受非常生硬，缺乏火药爆裂的层次感。
*   **优化方案**:
    1. 在 CPU 侧（`FireworkCanvas` 或 `useFireworkSystem`）引入延迟演化队列。
    2. `Crossette` 点火后，在 300ms 后计算其当时的运动坐标 `splitPos`，延迟发射 4 朵微缩版的 `crossette_child` 子烟花，实现高保真的母星分裂。

---

## 📅 四、 推荐后续开发顺序 (Roadmap)

我们建议后续的开发和重构会话按以下步骤分步执行：

1. **P0 (Bug 修复)**: 修复 `generateShape` 默认半径覆盖（BUG-1）与 Shader 死代码清理（BUG-2）。
2. **P1 (物理积分)**: 在 `FireworkPool.ts` 引入 `aVelocity` 属性与积分位置公式，实现真实的动能扩散与制动（GAP-1）。
3. **P2 (切线拖尾)**: 在片元着色器中实现基于速度投影的动态切线拖尾（GAP-2）。
4. **P3 (材料系统与闪烁)**: 引入 `aMaterial` 属性与着色器闪烁（Sparkle/Strobe）燃烧表现（GAP-3）。
5. **P4 (发射声强化)**: 在 `instruments.ts` 部署 launch thump 发射冲击波，并在 `useFireworkSystem.ts` 联动（BUG-3）。
6. **P5 (二阶段分裂)**: 实现 CPU 侧基于物理点计算的 Crossette 二阶段母星空中裂变（GAP-4）。

---

> [!TIP]
> 严格对齐本审计报告的优化路线，将使万华烟花的物理仿真度达到千树流律 v6.0 的高保真水平，实现完美的视觉跃升。
