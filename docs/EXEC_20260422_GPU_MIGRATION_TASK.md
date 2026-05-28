# 万华烟花 (KaleidoFire) — GPU 烟花引擎迁移会话进度清单 (EXEC_TASK)
> **版本号**: Web 重构版 (V1.0.0-GPU)
> **当前状态**: 已交付并归档 (100% 完成)
> **会话日期**: 2026-04-22

---

## 📖 任务背景说明

本清单用于跟踪记录 2026-04-22 烟花引擎由 2D Canvas 向 3D GPU GPGPU 粒子引擎迁移的全部子任务执行状态。该会话涉及的所有依赖安装、模块编写、控制器联调及 Canvas 挂载适配均已 100% 通过验证。

---

## 🏷️ 任务进度清单 (Task Backlog)

### 1. 📂 开发环境与基座配置
- [x] 创建 `dev-docs` 目录并写入首版迁移规格说明书
- [x] 执行 `npm install three` 及 `npm install -D @types/three`
- [x] 验证 `package.json` 中的依赖项，确保 TypeScript 能够正常解析 `three` 命名空间

### 2. 🎛️ 核心 GPU 渲染引擎下沉与开发 (TS 物理重构)
- [x] 开发粒子拓扑几何模块 [shapes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts)
  - [x] 移植并适配 `chrysanthemum` (菊花), `peony` (牡丹), `willow` (垂柳) 等 12 种经典烟花点阵拓扑
  - [x] 保证点阵生成逻辑仅执行数据计算，无 Three.js 实例耦合，便于单元测试
- [x] 开发调色盘配置模块 [palettes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/palettes.ts)
  - [x] 抽离核心的色彩氛围预设库
  - [x] 实现 85/15 主次色彩概率派发公式
- [x] 编写核心 GPU 特效池 [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts)
  - [x] 编写 `BURST_VERT` 和 `BURST_FRAG` GPU 着色器代码
  - [x] 实现基于 `InstancedMesh` 或点云的粒子缓冲更新与炭化衰减逻辑
  - [x] 预留扩展配置接口（支持配置风向 `wind` 和重力阻尼 `damping` 等）

### 3. 🔌 控制层降维适配与桥接 (Hooks 重写)
- [x] 完全重写核心控制器钩子 [useFireworkSystem.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/hooks/useFireworkSystem.ts)
  - [x] 在组件生命周期内初始化 WebGLRenderer, PerspectiveCamera 和 Scene
  - [x] 引入并集成 `FireworkPool` 实例
  - [x] 实现 2D 点击屏幕 NDC 投影映射至 3D 深度平面的发射定位算法
  - [x] 桥接 React UI 配置（发射类别、自动燃放间隔等）与 Tone.js 的 `onFireworkSync` 联动节奏

### 4. 🖼️ Canvas 宿主升级
- [x] 升级画布容器组件 [FireworkCanvas.tsx](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/components/FireworkCanvas.tsx)
  - [x] 变更为 WebGL WebGLRenderer 挂载节点，处理生命周期中的 Resize 监听
  - [x] 优化宿主挂载与销毁时的上下文清理，严防 WebGL 内存泄露

### 5. 🔍 编译与功能跑测
- [x] 执行 `npx tsc -b` 进行类型检查，保证 TypeScript 零编译报错
- [x] 本地运行 `npm run dev` 运行测试，验证鼠标点击、自动燃放及音轨联动性能
