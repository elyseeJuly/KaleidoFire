# 烟花引擎迭代与升级开发历史文档

**时间**: 2026-04-22
**目标**: 将 `fireworks-simulator` 的现有二维 Canvas 引擎剥离，替换为基于 Three.js + GPU Computing 的 3D 渲染引擎。该引擎源自对千树流律底层烟花体系的分析，但在集成至模拟器框架时，保留并拓宽通用接口，使本品成为独立的泛用“烟花模拟器”。

## 1. 原则与目标设定
- **剥离业务耦合**: 在移植 Qianshu-Rhythm 的 `FireworkPool`、`shapes` 和 `palettes` 机制时，去掉所有对音游判定的耦合 (如判定分数决定的粒子数)。
- **单一职责**: 仅保留纯粹的渲染与动画（风向、生命周期、拖尾变色计算）。
- **保留生态**: 原有的 `ControlPanel`（React组件）、Tone.js 独立集成（Game Mode状态）必须继续生效。
- **拓展接口**: `FireworkPool.fire()` 函数将预留额外的入参（如 config, flags），以便未来开发者可以通过传递多样的参数扩展其他模块。

## 2. 目录演进
```
fireworks-simulator/
  ├── dev-docs/           # 存储本文档及未来迭代记录
  ├── src/
  │   ├── lib/gpu-engine/ # 新的核心渲染层
  │   │     ├── fireworks.ts
  │   │     ├── shapes.ts
  │   │     └── palettes.ts
  │   ├── hooks/useFireworkSystem.ts # 升级至 Three.js
  │   └── components/FireworkCanvas.tsx # 变为 WebGL 载体
```

## 3. Shader 变更记录
为了适配任意扩展背景，我们在重写 `CustomShader` 时，将保留 `AdditiveBlending` 透明叠加机制，以保证无论是全黑背景还是图片背景都能呈现最佳的炭化粒子效果和绚丽色彩。
