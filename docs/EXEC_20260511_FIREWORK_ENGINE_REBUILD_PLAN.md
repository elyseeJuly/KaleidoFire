# 烟花引擎审计与重构会话 — 实施方案书 (EXEC_PLAN)
> **会话主题**: KaleidoFire 烟花渲染引擎审计、BUG 修复与物理对齐校准  
> **会话 ID**: `c1b322f5-fcf7-4855-ac2b-69c00ae51103`  
> **执行依据**: SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md & SPEC_20260520_AI_DEVELOPMENT_SOP.md  
> **会话时间**: 2026-05-11 09:30:36 至 09:53:51 (北京时间 UTC+8)  
> **协同角色**: Planner (规划者), Builder (开发者), Documenter (文档生成者)  

---

## 📖 一、 设计痛点与重构背景

根据项目定位，**「万华烟火 (KaleidoFire)」** 是一个专注于高保真粒子与声学引擎模拟的 3D GPU 加速烟花模拟器，其核心渲染引擎从 **「千树流律 (Project Qianshu-Rhythm)」** 的 `VisualEngine.js` 移植而来。

然而，在最初的移植过程中，引擎被大幅度简化，丢失了多项关键的物理保真度和视觉效果，并且在交互、旋律映射和音频资源释放方面遗留了数个致命与功能性 BUG。

> [!IMPORTANT]
> **开发定位强红线限制**：
> 本次会话所有审计、修复与优化均**严格限于烟花引擎本身**，不展开任何其他功能，不增加烟花以外的任何模块。

---

## 🔍 二、 审计发现的 BUG 与缺陷 (Bugs Audited)

本次静态代码审计共找出 **7 个核心 BUG**，覆盖功能性阻塞、音频泄漏和竞态冲突：

### 1. BUG-3 🔴 音乐引擎关闭后烟花仍被音乐驱动（功能阻塞）
*   **根因**：[FireworkCanvas.tsx](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/components/FireworkCanvas.tsx#L75-L84) 中注册音乐同步回调的 `useEffect` 依赖数组遗漏了 `musicEnabled`。在关闭音乐时，旧的回调函数仍然处于活跃状态，导致静音后烟花依然不受控地自主燃放。
*   **影响**：音乐状态切换失效。

### 2. BUG-7 🔴 `melody.ts` 中 `NOTE_FIREWORK_MAP` 映射至不存在的类型（运行时静默失败）
*   **根因**：[melody.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/melody.ts#L60-L66) 将音符度数映射到了 `palm` 和 `twinkle`，但 `FireworkType` 联合类型中并不包含这两类形态，导致运行时静默抛出类型或方法不存在的异常。
*   **影响**：特定音符触发时烟花引擎崩溃。

### 3. BUG-2 🟡 `BreathRing` 组件点击与长按事件冲突（交互缺陷）
*   **根因**：[BreathRing.tsx](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/components/BreathRing.tsx#L108-L118) 同时监听了 `onClick` 与 `onMouseDown`，在 300ms 临界短按状态下会同时触发 tap 和 holdStart，存在交互竞态。
*   **影响**：长按涟漪手势响应不准确。

### 4. BUG-5 & BUG-6 🟡 音频引擎古筝反馈可能自激与 stopAllSounds 失效（音频隐患）
*   **根因**：
    *   [instruments.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/instruments.ts#L92-L98) 中的古筝 Karplus-Strong 算法缺乏衰减系数节点（`GainNode`），反馈延迟电路不收敛，极易在特定频段引起严重的自激尖啸。
    *   `activeNodes` 虽在 `stopAllSounds` 中被清理，但乐器节点生成时从未向其注册，导致此方法为空操作，存在严重的内存与音频通道泄漏风险。
*   **影响**：音频泄漏、极高并发下浏览器音频线程崩溃。

### 5. BUG-1 & BUG-4 🟡 遗留 2D Canvas 类型与死变量（代码冗余）
*   **根因**：
    *   `types/firework.ts` 残留大量 Canvas 2D 的 `Particle`, `Rocket` 等未使用接口。
    *   `useFireworkSystem.ts` 存在死变量 `prevTime` 写入但未被读取。
*   **影响**：代码纯净度下降。

---

## 🎨 三、 对标 Qianshu-Rhythm 的差距与优化方案 (Optimizations)

为了将渲染品质拉升至与「千树流律」一致的水准，本方案规划了 **4 项物理与渲染的跨越式优化**，并结合 **2 项架构极简化清理**：

### 1. OPT-1 & OPT-4 🔴 物理保真度 Shader 与 4 阶段颜色渐变移植
*   **设计**：重构 `FireworkPool.ts` 中的 `BURST_VERT` 与 `BURST_FRAG`。
*   **物理公式移植**：
    *   **瞬爆物理曲线**：`burst = pow(bt, 0.06)`（前 2 帧完成 96% 结构展开）。
    *   **动态阻力**：`drag(t) = 0.90 + 0.07*t`，粒子后期产生真实的空气漂移。
    *   **动态重力下坠**：基于抛物线与重力加速度的二次积分积分模型。
    *   **颜色演化**：引入 `white -> primary -> orange-red -> dark` 4阶段颜色渐变，对齐 Ember 熄灭规范。

### 2. OPT-2 🔴 `SHAPE_STYLE` 形态风格参数化矩阵
*   **设计**：不再使用硬编码 32000 个均分粒子，每种烟花形态应有独立的点大小、重力系数、拖尾长度、寿命乘数和粒子大小。
*   **方案**：在 `shapes.ts` 中引入 5 维风格矩阵与数量限制配置表，赋予 12 种形态专属的物理常数。

### 3. OPT-3 🔴 Bloom (泛光) + Afterimage (余辉) 后期处理管线部署
*   **设计**：当前为纯渲染器输出，没有余辉拖影和绽放发光。
*   **方案**：在 `useFireworkSystem.ts` 引入 `three/addons/postprocessing`，部署 `EffectComposer`、`RenderPass`、`UnrealBloomPass` (强度 1.2, 半径 0.4) 及 `AfterimagePass` (衰减 0.88)。

### 4. OPT-6 & OPT-7 🟡 清理 53 个未使用 Shadcn UI 组件与统一双音频系统
*   **设计**：
    *   项目存在多达 53 个从未引用的 Shadcn/Radix 组件，使代码极其臃肿。
    *   项目同时加载了 `Tone.js` 与原生 `Web Audio API` 两套音频，逻辑分裂。
*   **方案**：
    *   物理删除整个 `src/components/ui/`，在 `package.json` 中物理卸载 20+ 个Radix 依赖。
    *   彻底剥离 `Tone.js` 依赖，将发射与爆炸音效统一收口到 `instruments.ts` 原生 `Web Audio API` (`playDrum`) 中。

---

## 🛠️ 四、 物理文件修改映射表 (Surgical Changes Map)

本会话物理重构路径明确，严格限制在以下文件的外科手术式修改中：

| 变更类型 | 文件绝对路径 | 核心更改说明 |
| :--- | :--- | :--- |
| **[MODIFY]** | [FireworkCanvas.tsx](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/components/FireworkCanvas.tsx) | 补齐 `musicEnabled` 闭包与副作用清理 |
| **[MODIFY]** | [melody.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/melody.ts) | 修正音符烟花类型映射字典 |
| **[MODIFY]** | [useFireworkSystem.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/hooks/useFireworkSystem.ts) | 移除死变量、部署 Bloom/Afterimage 后处理、统一音频调用接口 |
| **[MODIFY]** | [BreathRing.tsx](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/components/BreathRing.tsx) | 合并鼠标短按与长按交互逻辑，防范 300ms 交互冲突 |
| **[MODIFY]** | [instruments.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/instruments.ts) | 填充 `activeNodes` 弱引用追踪，增加 Karplus-Strong 古筝滤波电路 0.96 衰减 |
| **[MODIFY]** | [shapes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts) | 增加 5 维 `SHAPE_STYLE` 形态风格字典与 `SHAPE_COUNTS` |
| **[MODIFY]** | [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts) | 移植物理顶点/片元 Shader、引入多维度 `aStyle` 粒子渲染参数，重构物理插值 |
| **[DELETE]** | `src/components/ui/` | 物理删除 53 个完全未引用的 Shadcn 占位组件文件 |
| **[MODIFY]** | [package.json](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/package.json) | 物理卸载 `tone` 和 20+ 个 Radix UI 依赖包，减少项目体积 |
| **[MODIFY]** | [index.css](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/index.css) | 将 `@import` 字体代码移动到最顶部，解决 Vite 构建抛出的 CSS 警告 |

---

## 🎯 五、 验证方案 (Verification Plan)

重构完成后，通过三层立体防御验证项目质量：

1. **类型安全性验证**：运行 TypeScript 静态类型编译 `npx tsc --noEmit`，确保修改后的 API 契约无任何破损。
2. **生产构建验证**：运行 `npm run build`，核验打包状态及最终产物大小（在剔除 53 个 UI 占位组件与 Tone.js 后）。
3. **视觉与交互盲审验证**：
   * 验证烟花各形态的物理展开、阻力悬停与下落。
   * 验证关闭/开启音乐按钮时，烟花同步燃放回调的瞬时绑定与解除状态。
   * 验证长按与短按 BreathRing 圆环的精准手势识别。
