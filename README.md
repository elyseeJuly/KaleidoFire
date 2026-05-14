# KaleidoFire (万华烟花) 🎇

**KaleidoFire** 是一款基于 WebGL 与 GPU 加速的高保真粒子烟花模拟引擎。它通过物理精确的动力学模拟与电影级后期渲染，呈现出极致通透、璀璨的烟花视觉艺术。

<div align="center">

[![Version](https://img.shields.io/badge/VERSION-V1.1.0--STABLE-BD2C00?style=for-the-badge&labelColor=444)](https://github.com/elyseeJuly/KaleidoFire)
[![License](https://img.shields.io/badge/LICENSE-MIT-lightgrey?style=for-the-badge&labelColor=444)](./LICENSE)
[![Framework](https://img.shields.io/badge/MADE%20WITH-REACT-61DAFB?style=for-the-badge&labelColor=444&logo=react&logoColor=black)](https://react.dev)

</div>

---

## 🌟 核心技术特色

### 1. GPU 加速粒子管线 (GPGPU System)
- **高并发仿真**：利用 WebGL Shader 在 GPU 端完成粒子位置计算，支持数万个粒子同时绽放而保持 60FPS 的丝滑帧率。
- **动态拓扑形态**：内置 18 种复杂的烟花拓扑算法（包括锦冠、垂柳、星爆、爱心等），每种形态均具有独特的物理特性。

### 2. 电影级后期渲染 (Cinematic Rendering)
- **ACES Filmic Tone Mapping**：引入电影工业标准的色调映射算法，有效压制加法混合带来的高光过曝，保留粒子核心的色彩层次。
- **高精度泛光 (Bloom)**：基于 `UnrealBloomPass` 的多级泛光处理，营造出柔和、自然的空气感光晕。
- **视觉残留 (Afterimage)**：模拟视网膜残留效应，使烟花的下落轨迹呈现出动感的丝滑流线。

### 3. 物理动力学仿真 (Physical Fidelity)
- **空气阻力 (Drag)**：非线性的粒子减速模型，模拟空气对高速爆裂粒子的阻尼作用。
- **重力演化 (Gravity)**：随时间变化的重力加速度，赋予烟花末期真实的垂坠感。
- **随机流体偏移 (Drift)**：模拟高空微风干扰，使每一次绽放都独一无二。

---

## 🛠️ 开发者调优指南

如果您希望通过修改代码进一步定制烟花效果，以下是核心参数建议：

### 提升真实感的关键点：
| 参数位置 | 建议修改项 | 视觉影响 |
| :--- | :--- | :--- |
| `FireworkPool.ts` | 减小 `gl_PointSize` 的分母系数 | 让粒子变得更细、更碎，增加“星尘”感。 |
| `shapes.ts` | 调整 `SHAPE_STYLE.gravity` | 改变烟花下坠的重量感，数值越大下坠越快。 |
| `shapes.ts` | 调整 `SHAPE_STYLE.coast` | 改变爆炸的冲击力度，数值越大爆炸越剧烈。 |
| `FireworkPool.ts` | 修改 `BURST_FRAG` 的 `alpha` 幂数 | 提高幂数（如 `2.2 -> 3.0`）会使粒子边缘更锐利，呈现晶莹感。 |

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

---

## 📜 开源协议
本项目采用 [MIT License](LICENSE) 协议开源。

> *"捕捉那一瞬的璀璨，留住数字世界的永恒庆典。"*
