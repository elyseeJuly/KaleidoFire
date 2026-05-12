# KaleidoFire | 万华烟火

<div align="center">

[![Version](https://img.shields.io/badge/VERSION-V1.1.0--STABLE-BD2C00?style=for-the-badge&labelColor=444)](https://github.com/your-username/KaleidoFire)
[![License](https://img.shields.io/badge/LICENSE-MIT-lightgrey?style=for-the-badge&labelColor=444)](./LICENSE)
[![Engine](https://img.shields.io/badge/ENGINE-QIANSHU--RHYTHM-8A2BE2?style=for-the-badge&labelColor=444)](https://github.com/your-username/KaleidoFire)
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

