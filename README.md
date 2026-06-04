# KaleidoFire (万华烟花) 🎇

**KaleidoFire** 是一款基于 React + WebGL + Web Audio API 与 GPU 加速的高保真粒子烟花模拟引擎。它通过物理精确的粒子速度动力学模拟与电影级后期渲染，呈现出极致通透、璀璨的烟花视觉艺术。

<div align="center">

[![Version](https://img.shields.io/badge/VERSION-V1.2.0--STABLE-BD2C00?style=for-the-badge&labelColor=444)](https://elyseejuly.github.io/KaleidoFire/)
[![License](https://img.shields.io/badge/LICENSE-MIT-lightgrey?style=for-the-badge&labelColor=444)](./LICENSE)
[![Framework](https://img.shields.io/badge/MADE%20WITH-REACT-61DAFB?style=for-the-badge&labelColor=444&logo=react&logoColor=black)](https://react.dev)

</div>

---

## 🌐 立即体验 (Live Preview)

🚀 **在线演示地址**：[https://elyseejuly.github.io/KaleidoFire/](https://elyseejuly.github.io/KaleidoFire/)

> [!TIP]
> 打开页面后，点击屏幕任意位置可引燃烟花。您也可以在底部面板中切换 17 种高保真形态，或者开启 **“盛典模式”** 体验漫天繁星的批量齐放。

---

## 🌟 最新技术特色 (Physics & Shaders Rebuild)

本项目现已全面对齐《千树流律》主渲染引擎 v6.0 的高保真物理模型与着色器：

### 1. 速度积分粒子动力学 (True Velocity Integration)
- **初始速度积分**：摒弃了几何位置插值拉伸方案。星体粒子在爆炸瞬间获得由炸药威力确定的初始速度向量（`aVelocity`），在 Shader 顶点计算中基于 `pos = origin + aVelocity * drift * burst` 持续积分。
- **空气阻力与重力**：粒子在飞行中受到随时间非线性变化的空气阻力 (`k_drag`) 平滑制动，并伴随二次积分重力 (`gravDrop`) 缓慢下垂，还原真实礼花弹火药推送的漂移感。

### 2. 屏幕空间动态切向拖尾 (Tangent-Aligned Particle Tails)
- **运动方向拉伸**：摒弃了硬编码垂直压缩（粒子拖尾一律垂直向下）的做法。
- **切线正交旋转**：顶点着色器计算粒子的实际速度方向 `vDir`，片元着色器接收其屏幕投影 `vDir.xy` 构建动态旋转正交坐标系，使每一颗火星的拖尾方向与**其真实的飞行弧向完全切合**，飞行轨迹极为飘逸。

### 3. 燃烧材料系统与 Strobe 高频闪烁 (Material System)
- **材料属性控制**：引入 `aMaterial` 属性控制燃速（`burnRate`）与闪烁度（`sparkle`）。
- **Strobe 闪光质感**：Strobe 等形态结合粒子随机种子与正弦 LFO，在空中呈现高频、断续截断的亮度闪烁（flicker），营造亮暗跳跃、星点碎裂的高保真炭化熄灭感。

### 4. Crossette 二阶段空中裂变 (Two-Stage Fission)
- **空中分裂**：爆裂型（`crossette`）烟花在发射后，CPU 侧实时跟踪并计算母星在 280-420ms 飞行轨道中的 3D 物理位置，并将其投影回 NDC，在半空中延迟裂变发射 4 发子烟花（`crossette_child`），呈现绝佳的二阶段绽放层次。

### 5. 迫击炮发射冲击声效 (Launch Thump Audio)
- **声学联动**：点火升空时利用 Web Audio API 构造纯净、低频的正弦扫频发生器（90Hz -> 30Hz，持续 150ms），模拟发射筒的空气震荡，与 850ms 后的爆炸声（`playDrum`）完美契合。

---

## 🛠️ 开发者调优指南

若您希望通过修改代码进一步定制烟花效果，以下是核心参数参数建议：

### 物理与渲染调试地图：
| 核心文件绝对路径 | 关键参数/行号 | 视觉与物理影响 (Tuning Effect) |
| :--- | :--- | :--- |
| [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts) | 粒子大小 `gl_PointSize` | 调整 baseSize 与分母系数可改变粒子是“漫天星尘”还是“硬直火花”。 |
| [shapes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts) | `SHAPE_STYLE.gravity` | 改变各形态下落的重质感（如 Willow/Brocade 大于普通 Peony）。 |
| [shapes.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/shapes.ts) | `SHAPE_STYLE.coast` | 调整星体横向惯性，数值越大，冲击越凌厉。 |
| [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts) | `BURST_FRAG` 边缘衰减指数 | 调整边缘 d 幂数（如 `2.2`）可以调整粒子星点边缘是柔和羽化还是晶莹锐利。 |

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动本地开发服务
```bash
npm run dev
```

### 生产构建与打包
```bash
npm run build
```

---

## 📜 开源协议
本项目采用 [MIT License](LICENSE) 协议开源。

> *"捕捉那一瞬的速度与光影，留住数字世界的永恒庆典。"*
