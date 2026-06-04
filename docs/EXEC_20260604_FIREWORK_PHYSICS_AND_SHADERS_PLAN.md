# 烟花引擎物理与着色器重构会话 — 实施方案书 (EXEC_PLAN)
> **会话主题**: KaleidoFire 烟花物理动力学、材料属性与二阶段裂变对齐重构  
> **会话 ID**: `c1b322f5-fcf7-4855-ac2b-69c00ae51103`  
> **执行依据**: SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md & SPEC_20260520_AI_DEVELOPMENT_SOP.md  
> **会话时间**: 2026-06-04  
> **协同角色**: Planner (规划者), Builder (开发者), Documenter (文档生成者)  

---

## 📖 一、 设计痛点与重构初衷

在之前的迭代中，万华烟花成功引入了基本物理状态机与 Bloom/Afterimage 后处理，但在核心的物理拟真度和燃烧表现上与《千树流律》主引擎仍存在显著差距：
1. **几何拉伸而非速度积分**: 粒子在爆炸瞬间利用 `mix` 与 `burst` 瞬间膨胀到几何极限后几乎处于静止状态，缺乏星体在重力与阻力下持续运动扩展的动感。
2. **绝对垂直拖尾**: 片元着色器硬编码垂直压缩拉伸，导致横向飞行的粒子尾迹依然垂直向下，极不物理。
3. **缺少闪烁与燃烧差异**: 粒子缺少材料属性控制，亮度单纯指数光衰，无法实现 Strobe (闪光) 烟花高频闪烁周期性熄灭/复燃的颗粒感。
4. **二阶段裂变缺失**: Crossette (爆裂型) 烟花缺少空中延迟子星二次爆裂，只作形态的线性插值。

为解决上述问题，本方案将对 `shapes.ts`、`FireworkPool.ts`、`instruments.ts`、`useFireworkSystem.ts` 实施外科手术式重构，引入速度积分、切线旋转、材料系统及延迟裂变，大幅跃升物理真实度。

---

## 🛠️ 二、 物理文件修改映射表 (Surgical Changes Map)

本次重构严格受限于以下文件的改动：

| 变更类型 | 文件绝对路径 | 核心更改说明 |
| :--- | :--- | :--- |
| **[MODIFY]** | [shapes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts) | 修正 `generateShape` 默认半径覆盖 BUG，使物理尺度统一对齐。 |
| **[MODIFY]** | [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts) | 1. 物理移除 L49 死代码。<br>2. 引入 `aVelocity` 和 `aMaterial` 属性并修改 `_createSlot` 初始化。<br>3. 重构着色器，顶点计算采用速度积分，并输出运动切向 `vDir`。<br>4. 片元着色器利用 `vDir.xy` 动态投影旋转拉伸实现切线拖尾，并引入材料闪烁 flicker。 |
| **[MODIFY]** | [instruments.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/instruments.ts) | 新增并导出 `playLaunchThump` 音频函数，实现低频迫击炮发射空气冲击声。 |
| **[MODIFY]** | [useFireworkSystem.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/hooks/useFireworkSystem.ts) | 1. 在 `playLaunchSound` 调用发射冲击音效。<br>2. 捕获 `crossette` 并在 320ms 后计算物理飞行坐标 `splitPos`，延迟发射 4 发 `crossette_child` 子烟花，完成二阶段裂变。 |

---

## 🎯 三、 交付与校验红线

1. **绝对零玩法入侵**: 绝不触碰或引入任何与烟花视觉表现/物理本身无关的 UI 或判定玩法逻辑。
2. **类型检查首关**: 任何代码改动均在本地运行 `npx tsc --noEmit` 通过类型校验，防止引入 TS 编译错误。
3. **构建测试**: 运行 `npm run build` 打包并核准包体大小，确保交付稳定。
