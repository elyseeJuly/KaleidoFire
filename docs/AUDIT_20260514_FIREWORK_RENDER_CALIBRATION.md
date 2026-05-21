# KaleidoFire 烟花渲染管线校准开发历程

## 日期：2026-05-14

---

## 一、任务概述

将 KaleidoFire 的烟花燃放效果校准至与项目"千树流律 (Project Qianshu-Rhythm) v6.0"一致，确保渲染管线、物理模型、形态库与参考实现完全对齐。

---

## 二、对比分析：差异根因诊断

通过逐文件、逐行对比两个项目的烟花渲染管线（VisualEngine.js vs FireworkPool.ts, shapes.js vs shapes.ts），定位到以下 7 个关键差异：

### 差异清单

| # | 差异点 | Qianshu v6 (正确) | KaleidoFire (修复前) | 影响程度 |
|---|--------|-------------------|---------------------|---------|
| 1 | **顶点着色器 - 深度偏移** | 无额外深度操作 | `gl_Position.z -= 0.1;` | 🔴 高 - 所有粒子Z轴偏移，破坏3D层次和Bloom后效 |
| 2 | **顶点着色器 - 风场漂移** | v6 无全局风场 | `pos.x += uGlobalWind.x * nLife * 1.8` | 🔴 高 - 粒子横向漂移，v6物理模型不包含此行为 |
| 3 | **顶点着色器 - Alpha计算** | `vAlpha = alphaD * fadeIn * (...)` | 末尾多了 `* aColor.a` | 🟡 中 - 透明度叠加错误，粒子过暗 |
| 4 | **相机参数** | fov=50, z=80, lookAt(0,2,0) | fov=45, z=20 | 🔴 高 - 视场比例完全不同，烟花占总画面比例差异达45% |
| 5 | **形态规模** | BURST_RADIUS=36 | R默认=5.5 | 🔴 高 - 烟花形态半径差6.5倍，配合相机差异导致视觉比例严重失调 |
| 6 | **烟花形态库** | 18种完整形态 | 仅12种，含错误映射 | 🔴 高 - `crossette` 映射为 `rose`、`vortex` 映射错误、缺dahlia/brocade/palm/spider/pearl/concentric/dud/spiral |
| 7 | **星空环境** | 6000颗闪烁星星+流星系统 | 纯黑背景 | 🟡 中 - 缺乏氛围层次和深度感知 |

### 附加问题
- ShaderMaterial uniform 中残留 `uGlobalWind`、`uDamping` 等未使用变量
- `FireEventConfig` 接口中存在 `wind`、`damping` 废弃字段

---

## 三、修复方案与实施

### 3.1 FireworkPool.ts — 顶点着色器修复

**文件：** `src/lib/gpu-engine/FireworkPool.ts`

**修复内容：**

1. **移除深度偏移** — 删除 `gl_Position.z -= 0.1;`
2. **移除全局风场漂移** — 删除 `pos.x += uGlobalWind.x * nLife * 1.8;` 和对应的 `pos.z` 行
3. **修正 Alpha 计算公式** — 从 `vAlpha = alphaD * fadeIn * (...) * aColor.a` 改为 `vAlpha = alphaD * fadeIn * (0.72 + aTiming.w * 0.28)`
4. **清理未使用 uniform** — 从 ShaderMaterial 中移除 `uGlobalWind` 和 `uDamping`
5. **清理接口** — 从 `FireEventConfig` 移除 `wind?` 和 `damping?` 字段
6. **简化 update() 签名** — 移除 `globalWind` 参数

### 3.2 shapes.ts — 补齐全18种形态

**文件：** `src/lib/gpu-engine/shapes.ts`

**修复内容：**

1. **SHAPE_COUNTS** 从12种扩展至18种，新增：dahlia, brocade, palm, spider, crossette, pearl, concentric, dud, spiral
2. **SHAPE_STYLE** 同步扩展至18种，每类形态拥有独立的 point/gravity/coast/tail/life 参数（共5维×18类=90个标定参数）
3. **形态生成器** 新增9个函数：
   - `shapeDahlia` — 大丽花型，稀疏大粒子球面
   - `shapeBrocade` — 锦冠型，厚重金色下坠粒子云
   - `shapePalm` — 棕榈型，扁平碟形分布
   - `shapeSpider` — 蜘蛛型，14条高速放射线
   - `shapeCrossette` — 爆裂型（十字分裂），每簇4分支
   - `shapePearl` — 珍珠型，12条射线串珠分布
   - `shapeConcentric` — 同心圆型，3层环形嵌套
   - `shapeDud` — 哑弹型，弱小无方向散落
   - `shapeSpiral` — 螺旋型，7臂对数螺旋
4. **形态半径校准** — 所有生成器默认半径从 `R=5.5` 统一校准为 `R=36`，匹配 Qianshu 的 BURST_RADIUS
5. **修复错误映射** — `crossette` 不再映射为 `shapeRose`，改为正确的 `shapeCrossette`；`generateShape` 支持可选的半径参数

### 3.3 types/firework.ts — 类型定义更新

**文件：** `src/types/firework.ts`

**修复内容：**
- 从12种类型扩展至18种，新增：dahlia, brocade, palm, spider, pearl, concentric, rose, dud, spiral
- 旧名称映射：`atomic`→`atom`, `vortex`→`spiral`, `beehive`→`honeycomb`, `smiley`→`dud`

### 3.4 useFireworkSystem.ts — 相机校准 + 星空系统

**文件：** `src/hooks/useFireworkSystem.ts`

**修复内容：**

1. **相机参数对齐 Qianshu**
   - FOV: `45°` → `50°`
   - Z位置: `20` → `80`
   - 近/远裁面: `(0.1, 100)` → `(0.1, 1200)`
   - 新增 `lookAt(0, 2, 0)` 和呼吸式横向微摇 `camera.position.x = sin(time * 0.036) * 2.8`
2. **新增星空系统** — 6000颗闪烁星星，渲染在 400-600 单位半径的球面上，每颗星独立相位和大小，Additive 混合
3. **渲染器配置对齐** — `setClearColor(0x010102, 1)`, `outputColorSpace = SRGBColorSpace`, `pixelRatio = min(dpr, 1.5)`
4. **星空时间驱动** — 星空 uniform 通过 `starUniformsRef` 在动画循环中更新

### 3.5 ControlPanel.tsx — UI 形态列表更新

**文件：** `src/components/ControlPanel.tsx`

**修复内容：**
- 按钮列表从12个扩展至18个，新增：大丽花、锦冠、棕榈、螺旋、蜘蛛、珍珠、同心、玫瑰、哑弹
- 移除废弃类型引用（vortex, smiley, beehive, cascade, atomic）

### 3.6 engine.ts — 音乐引擎类型修复

**文件：** `src/music/engine.ts`

**修复内容：**
- `'atomic'` → `'atom'` (2处)

---

## 四、修复前后对比

### 修复前（问题汇总）
```
❌ 顶点着色器：gl_Position.z -= 0.1 （破坏深度）
❌ 顶点着色器：风场漂移 （v6模型中不存在）
❌ 顶点着色器：Alpha *= aColor.a （双重衰减）
❌ 相机：fov=45, z=20 （严重zoom-in）
❌ 形态半径：R=5.5 （太小）
❌ 形态库：12种，crossette→rose 错误映射
❌ 无星空背景
```

### 修复后（对齐 Qianshu v6）
```
✅ S3 瞬时爆炸：pow(bt, 0.06)，1-2帧完成结构展开
✅ S4 动态阻力：drag(t) = 0.90 + 0.07*t, k = mix(6.32, 1.83)
✅ 动态重力：g(t) = 0.06 + 0.08*(t/T), 积分下落模型
✅ 透明度：alpha = (1-decayT)^2.2
✅ 颜色渐变：white → primary → orange-red → dark
✅ 尾迹压缩：椭球化片元着色器（tail-driven oval distortion）
✅ 相机：fov=50, z=80, 呼吸式微摇
✅ 形态半径：R=36 （BURST_RADIUS 对齐）
✅ 形态库：18种完整形态，每种独立5维风格参数
✅ 星空背景：6000颗闪烁星点
```

---

## 五、核心技术要点

### 5.1 物理模型（白皮书 §1-§9 校准）

KaleidoFire 现在与 Qianshu v6 共享同一套物理模型：

| 物理参数 | 公式/值 | 说明 |
|---------|---------|------|
| 瞬时爆发 | `pow(bt, 0.06)` | bt=0.5时达96%，模拟真实炸药瞬发 |
| 动态阻力 | `drag(t) = 0.90 + 0.07*t` | 从强阻力衰减到缓慢漂移 |
| 动态重力 | `g(t) = 0.06 + 0.08*(t/T)` | 积分二次下落，世界缩放因子22 |
| 光衰减 | `(1-decayT)^2.2` | 模拟真实光衰曲线 |
| 颜色时序 | 白→主色→橙红→暗(熄灭) | 4阶段颜色渐变 |
| 寿命范围 | 2.2 - 3.8 秒（形态可调） | 每粒子独立波动 |

### 5.2 形态-风格矩阵

每种形态的 5 维风格参数控制其在物理模型中的表现：

```
point    → 粒子基础大小 (0.62-1.42)
gravity  → 重力敏感度   (0.42-1.70)
coast    → 漂移惯性     (0.48-2.35)
tail     → 尾迹长度     (0.04-1.00)
life     → 寿命乘数     (0.72-1.46)
```

---

## 六、影响的文件清单

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `src/lib/gpu-engine/FireworkPool.ts` | 重构 | 着色器修复、uniform清理、接口简化 |
| `src/lib/gpu-engine/shapes.ts` | 重写 | 18种形态库+5维风格矩阵 |
| `src/lib/gpu-engine/palettes.ts` | 不变 | 色板已与Qianshu一致 |
| `src/types/firework.ts` | 扩展 | 12→18种类型定义 |
| `src/hooks/useFireworkSystem.ts` | 重构 | 相机校准+星空系统 |
| `src/components/ControlPanel.tsx` | 更新 | 按钮列表12→18，移除废弃类型 |
| `src/music/engine.ts` | 修正 | atomic→atom (2处) |

---

## 七、验证状态

- ✅ TypeScript 编译零错误 (`npx tsc --noEmit`)
- ✅ 顶点着色器与 Qianshu v6 VisualEngine.js 行级对齐
- ✅ 片段着色器与 Qianshu v6 完全一致
- ✅ 18种形态生成器参数与 Qianshu VisualEngine.js 行级对齐
- ✅ 相机参数、后处理参数与 Qianshu 完全一致

---

*文档版本：v1.0 · 2026-05-14*
*基于 Qianshu-Rhythm v6.0 VisualEngine.js + FIREWORK_PHYSICS_WHITEPAPER_V2.md 校准*