# 烟花引擎物理与着色器重构会话 — 任务进度清单 (EXEC_TASK)
> **会话主题**: KaleidoFire 烟花物理动力学、材料属性与二阶段裂变对齐重构  
> **会话 ID**: `c1b322f5-fcf7-4855-ac2b-69c00ae51103`  
> **会话时间**: 2026-06-04  
> **更新状态**: 已完成 (Completed)  

---

## 📋 一、 任务看板进度清单

- `[x]` **第一阶段：Bug 修复与基础重构 (P0)**
  - `[x]` BUG-1: 修复 `generateShape` 默认半径覆盖冲突（在 `shapes.ts` 中设定默认 `R = 36`，在 `FireworkPool.ts` 中统一控制相机尺度 `5.2 * radiusScale` 传参）
  - `[x]` BUG-2: 清理 `FireworkPool.ts` 顶点着色器中被覆盖的死代码 L49

- `[x]` **第二阶段：真实速度积分物理模型 (P1)**
  - `[x]` 在 `FireworkPool.ts` 引入 `aVelocity` (vec3) 属性并修改 `_createSlot` 初始化
  - `[x]` 修改 `fire()` 方法利用形态方向乘以初速系数计算并填充 `aVelocity` 属性
  - `[x]` 重构 `BURST_VERT` 顶点着色器位置公式为速度积分公式 `pos = origin + aVelocity * drift * burst`，完成动能制动扩散物理仿真

- `[x]` **第三阶段：动态方向切线拖尾 (P2)**
  - `[x]` 在顶点着色器中计算切线速度方向 `vDir` 并传递 Varying
  - `[x]` 在片元着色器中基于 `vDir.xy` 动态旋转拉伸粒子点拖尾，实现随粒子飞行切向而动的切线拖尾，消除僵硬绝对竖直拖尾

- `[x]` **第四阶段：燃烧材料系统与闪烁表现 (P3)**
  - `[x]` 在 `FireworkPool.ts` 引入 `aMaterial` 属性，并在 `fire()` 依据形态填充材料属性 (burnRate, sparkle, crackle, smokeYield)
  - `[x]` 在 Shader 中引入 `aMaterial` 的燃速衰减，结合 `sparkle`、正弦波 LFO 与随机截断产生高频闪烁 Strobe 视觉效果，告别单一光衰

- `[x]` **第五阶段：发射筒冲击音效 (P4)**
  - `[x]` 在 [instruments.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/instruments.ts) 实现低频正弦扫频迫击炮发射声 `playLaunchThump` (90Hz -> 30Hz, 150ms)
  - `[x]` 在 [useFireworkSystem.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/hooks/useFireworkSystem.ts) 的 `playLaunchSound` 调用发射声音，补充 Launch Thump 声学表现

- `[x]` **第六阶段：延迟二阶段 Crossette 母星裂变 (P5)**
  - `[x]` 在 `useFireworkSystem.ts` 拦截 `crossette`，根据物理积分计算 280-420ms 飞行时的中途物理坐标 `splitPos` 并投影回 NDC，延迟发射 `crossette_child` 粒子，实现高保真母星裂变

- `[x]` **第七阶段：构建检查与主目录索引同步**
  - `[x]` 本地运行 `npx tsc --noEmit` 通过，无任何 TS 语法与类型警告
  - `[x]` 本地运行 `npm run build` 打包构建成功，包体 745 kB，加载性能优良
  - `[x]` 在 Document Index 注册本次会话的 Plan, Task 与 Walkthrough 文档，完成归档
