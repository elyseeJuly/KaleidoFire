# 万华烟花 (KaleidoFire) — GPU 烟花引擎迁移会话实施方案 (EXEC_PLAN)
> **版本号**: Web 重构版 (V1.0.0-GPU)
> **基于**: 2D Canvas 到 Three.js GPGPU 3D 渲染引擎升级
> **会话日期**: 2026-04-22

---

## 📖 一、 核心架构比对

本会话旨在将原有 `fireworks-simulator` 的二维 (Canvas 2D) 引擎升级为源自 `Project Qianshu-Rhythm` 的高性能 3D GPGPU 粒子引擎。在整合物理级计算与渲染能力的同时，完全保留并兼容模拟器现有的 React 交互、Tailwind UI 及 Tone.js 联动生态，实现“引擎下沉，控制层保留”。

### 1. fireworks-simulator (重构前状态)
- **底层架构**：原生 HTML5 Canvas 2D。
- **渲染原理**：每帧在 CPU 中通过 JavaScript 遍历对象数组计算物理属性并在 2D Canvas 上绘制，粒子上限约为数千个，性能瓶颈极低。
- **UI生态**：基于 React (Vite + TypeScript) + Tailwind CSS 构建，UI 模块包含 `ControlPanel` 配置项、自动发射开关及音乐联动。
- **触发机制**：鼠标点击或 Tone.js 节奏事件驱动。

### 2. Project Qianshu-Rhythm (目标状态)
- **底层架构**：Three.js + GPU Computing (GPGPU)。
- **渲染原理**：利用自编顶点着色器（`BURST_VERT`）与片元着色器（`BURST_FRAG`）在显卡上完成粒子动画计算，包含二阶段形变、流体物理炭化及风偏计算，单屏可轻松承载 80,000+ 粒子。
- **粒子拓扑**：基于 `shapes.ts` 预计算目标点阵拓扑（MorphTarget），批量同步渲染。

---

## 🛠️ 二、 演进与整合策略 (需保留的设定)

在迁移过程中，为避免破坏原有的 React 组件数据流与独立模拟器定位，我们确立了以下原则：

> [!IMPORTANT]
> **开发红线与保留设定**
> 1. **控制面板与UI生态 (Control Panel)**：保留全部现有的 UI 组件、Tailwind 样式、响应式布局及配置。
> 2. **Music / 音轨联动**：保留 `musicEngine.onFireworkSync` 对 Tone.js 的监听，继续支持节奏联动。
> 3. **拓展接口解耦**：移除千树原有的音游判定、连击打分等业务耦合，`FireworkPool.fire()` 必须提供泛用的扩展接口（如 `wind` 漂移、`damping` 阻尼等配置），方便外部模块拓展。

---

## 📝 三、 具体实施步骤 (Proposed Changes)

我们将分四个阶段进行无缝改造：

### 阶段 1：依赖引入与环境准备
在项目根目录安装 `three` 及其 TS 类型声明：
```bash
npm install three
npm install -D @types/three
```

### 阶段 2：内核逻辑重构整合 (核心引擎层)
在 [src/lib/gpu-engine](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine) 下实现高性能 3D GPGPU 特效池：
- **[NEW] 粒子拓扑公式** [shapes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts)：提供 12 种粒子公式（如菊花、爱心、柳条等），在千树 `shapes` 计算上做扩充融合。
- **[NEW] 色彩调色盘** [palettes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/palettes.ts)：抽离硬编码的调色体系，提供 `EMERALD`、`GOLD`、`CRIMSON` 等预设，按 85/15 分派粒子主次色彩。
- **[NEW] 着色器特效池** [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts)：利用 Custom Shader + WebGL 粒子计算，支持 `additiveBlending` 混合并预留扩展参数。

### 阶段 3：控制器适配 (`useFireworkSystem` 降维替换)
- **[MODIFY] 适配钩子** [useFireworkSystem.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/hooks/useFireworkSystem.ts)：
  - 弃用 2D Canvas 循环擦除机制，组件挂载时初始化 Three.js Scene、WebGLRenderer 与 PerspectiveCamera。
  - 将 2D 鼠标点击坐标通过相机逆投影机制映射到 3D 深度平面，将其作为三维发射点传给 `FireworkPool.fire()`。
  - 将 React 控制面板的形态与自动燃放事件、音轨触发回调与 Three.js 动画循环完成对接。

### 阶段 4：画布组件升级与后处理优化
- **[MODIFY] 渲染载体** [FireworkCanvas.tsx](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/components/FireworkCanvas.tsx)：
  - 废弃 2D Canvas 绘制上下文，将 `<canvas>` 变为 Three.js WebGLRenderer 的挂载宿主容器。
  - 优化移动端适配及 WebGL 渲染上下文防泄露清理机制。

---

## ⚖️ 四、 决策与风险评估 (User Review Required)

> [!WARNING]
> **画面美学形态变化**
> 2D 体系下的透明涂层擦除拖尾（`rgba(0,0,0,0.15)`）在 Three.js 中将被 GPU 粒子生命周期与炭化暗红衰减 Shader 完全接管。这会使画面表现从“扁平发光拖尾”升级为立体通透的“物理级点云”美学，视觉深度更高。

> [!NOTE]
> **关于 GPGPU 流体与鼠标交互**
> 为保证纯粹的烟花拟真表现并优化核心性能，本次重构**优先移植核心 FireworkPool 粒子系统及形态拓扑**，GPGPU 风场与涟漪互动将作为预留接口，在后续迭代中根据性能表现增量引入。

---

## ❓ 五、 开放式决策点 (Open Questions)

1. **调色板配色偏好**：原模拟器包含亮金色系，千树则采用冷暖对比的色调采样。实施时将结合两者，对 palettes 进行融合。
2. **WebGL 特效扩展性**：是否允许在 `FireworkPool` 的 config 传参中预留如 `wind`（风力）、`damping`（阻尼）等外部控制变量以备后续扩展？（决定：**强制预留**，保证未来无需重构引擎就能增加环境特效面板）。
