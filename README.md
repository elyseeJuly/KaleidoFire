# KaleidoFire (万华烟花) 🎇

**KaleidoFire** 是一款基于 WebGL 与 GPU 加速的高保真粒子烟花模拟引擎。它通过物理精确的动力学模拟与电影级后期渲染，呈现出极致通透、璀璨的烟花视觉艺术。

![KaleidoFire Demo](https://raw.githubusercontent.com/elyseeJuly/KaleidoFire/main/public/demo.png)

## 核心技术特色

### 1. GPU 加速粒子管线
- **高并发仿真**：利用 WebGL Shader 在 GPU 端完成粒子位置计算，支持数万个粒子同时绽放而保持 60FPS 的丝滑帧率。
- **动态拓扑形态**：内置 18 种复杂的烟花拓扑算法（包括锦冠、垂柳、星爆、爱心等），每种形态均具有独特的物理特性。

### 2. 电影级后期渲染
- **ACES Filmic Tone Mapping**：引入电影工业标准的色调映射算法，有效压制加法混合带来的高光过曝，保留粒子核心的色彩层次。
- **高精度泛光 (Bloom)**：基于 `UnrealBloomPass` 的多级泛光处理，营造出柔和、自然的空气感光晕。
- **视觉残留 (Afterimage)**：模拟视网膜残留效应，使烟花的下落轨迹呈现出动感的丝滑流线。

### 3. 物理动力学仿真
- **空气阻力 (Drag)**：非线性的粒子减速模型，模拟空气对高速爆裂粒子的阻尼作用。
- **重力演化 (Gravity)**：随时间变化的重力加速度，赋予烟花末期真实的垂坠感。
- **随机流体偏移 (Drift)**：模拟高空微风干扰，使每一次绽放都独一无二。

## 开发者调优指南 🛠️

如果您希望通过修改代码进一步定制烟花效果，以下是核心参数建议：

### 提升真实感的关键点：
| 参数位置 | 建议修改 | 视觉影响 |
| :--- | :--- | :--- |
| `FireworkPool.ts` | 减小 `gl_PointSize` 的分母系数 | 让粒子变得更细、更碎，增加“星尘”感。 |
| `shapes.ts` | 调整 `SHAPE_STYLE.gravity` | 改变烟花下坠的重量感，数值越大下坠越快。 |
| `shapes.ts` | 调整 `SHAPE_STYLE.coast` | 改变爆炸的冲击力度，数值越大爆炸越剧烈。 |
| `FireworkPool.ts` | 修改 `BURST_FRAG` 的 `alpha` 幂数 | 提高幂数（如 `2.2 -> 3.0`）会使粒子边缘更锐利，呈现晶莹感。 |

## 快速开始

### 安装
```bash
npm install
```

### 运行
```bash
npm run dev
```

## 开源协议
本项目基于 [MIT License](LICENSE) 开源。

<div align="center">

[![Version](https://img.shields.io/badge/VERSION-V1.1.0--STABLE-BD2C00?style=for-the-badge&labelColor=444)](https://github.com/your-username/KaleidoFire)
[![License](https://img.shields.io/badge/LICENSE-MIT-lightgrey?style=for-the-badge&labelColor=444)](./LICENSE)
[![Framework](https://img.shields.io/badge/MADE%20WITH-REACT-61DAFB?style=for-the-badge&labelColor=444&logo=react&logoColor=black)](https://react.dev)

</div>

**KaleidoFire (万华烟火)** 是一款基于 GPGPU 加速的高性能工业级烟花引擎。它深度对标 **Qianshu-Rhythm (千树流律)** 的物理白皮书，将瞬时爆裂的艺术感与严谨的运动学模拟完美结合。

---

## ✨ 核心特性 (Core Features)

### 🚀 工业级物理模拟 (Physical Fidelity)
- **Qianshu 对标引擎**：全面移植了 Qianshu-Rhythm 的物理状态机，包含动态空气阻力、动态重力衰减及 2 帧瞬爆曲线 (`pow(bt, 0.06)`)。
- **形态参数化**：12 种以上经典烟花形态（牡丹、菊花、垂柳等）均拥有独立的物理参数（阻力、寿命、重力系数）。
- **GPGPU 加速**：基于 WebGL/Three.js 的 GPU 粒子系统，支持数万粒子在 60FPS 下流畅运行。

### 🎨 高级视觉表现 (Visual Aesthetics)
- **四阶段颜色演化**：粒子遵循「白闪 → 主色 → 橙红 → 熄灭」的真实燃烧逻辑（Ember Protocol）。
- **后处理管线**：内置 UnrealBloom (发光泛光) 与 Afterimage (视觉残留/余辉拖影) 效果，还原极佳的视觉表现。
- **形态多样性**：支持二阶段演化形态（Morphing）与复杂的拓扑分布。

### 🔊 纯净音频引擎 (Audio Optimization)
- **Web Audio 深度定制**：剥离了冗余的外部库，直接基于原生 Web Audio API 实现古筝、笛、鼓等乐器的实时合成。
- **视听对齐**：烟花爆裂点与音频包络严格同步。

---

## 🛠️ 技术栈 (Technology Stack)

- **核心框架**: React 19 / TypeScript
- **渲染引擎**: Three.js (GPGPU Particle System)
- **后处理**: EffectComposer / UnrealBloomPass
- **音频系统**: Native Web Audio API (已剥离 Tone.js)
- **样式方案**: Vanilla CSS / Tailwind CSS

---

## 🚀 快速开始 (Quick Start)

### 环境依赖
- Node.js 20+ / npm

### 本地运行
```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 生产环境构建
npm run build
```

## 📜 开源协议 (License)

本项目采用 [MIT License](LICENSE) 协议开源。

---

> *"捕捉那一瞬的璀璨，留住数字世界的永恒庆典。"*

