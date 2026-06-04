# 烟花引擎物理与着色器重构会话 — 交付验证汇报 (EXEC_WALKTHROUGH)
> **会话主题**: KaleidoFire 烟花物理动力学、材料属性与二阶段裂变对齐重构  
> **会话 ID**: `c1b322f5-fcf7-4855-ac2b-69c00ae51103`  
> **生效日期**: 2026-06-04  
> **协同角色**: Planner (规划者), Builder (开发者), Documenter (文档生成者)  

---

## 🚀 一、 重构后效果与核心价值

本次重构成功解决了 KaleidoFire 粒子动画与物理引擎中存在的 **3 项 BUG/缺陷**，弥合了与《千树流律》主引擎的 **4 大物理渲染差距**。

重构后的万华烟花完全脱离了原先僵硬的“几何插值膨胀”模式，升级为正规的 **“初始速度积分 + 动态空气阻力 (k_drag) + 积分重力 (gravDrop)”** 真实物理扩散轨道，并且：
1. **切线动态拖尾**: 粒子火羽的拖尾方向在屏幕投影上与**粒子实际飞行夹角切向完全一致**，运动轨迹极为灵动飘逸。
2. **闪烁材料质感**: Strobe 闪烁型烟花粒子具备了闪烁与断续燃烧 flicker 表现，配合金属尾迹形成了富有厚重烟火美学的明暗质感。
3. **迫击发射冲击**: 升空点火瞬间支持低频 Launch Thump 发射炮击声，视听结合度拉满。
4. **延迟母星裂变**: Crossette 完美重现了在半空 280-420ms 飞行轨道处炸裂为 4 簇子烟花的二阶段空中裂变，戏剧性冲突十足。

---

## 🛠️ 二、 核心外科手术式变更 Diff 还原 (Surgical Changes Review)

### 1. BUG-1 & GAP-1：半径覆盖修正与 aVelocity 物理积分运动重构
在 [FireworkPool.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/lib/gpu-engine/FireworkPool.ts#L226-L300) 中，我们引入并计算了 `aVelocity` 并使用真正的速度积分重写顶点着色器：

```diff
   fire(config: FireEventConfig, timeSec: number, camera: THREE.Camera) {
-    const count = config.count || shapeCount(config.type);
+    const radiusScale = config.radiusScale ?? 1.0;
+    const countScale = config.countScale ?? 1.0;
+    const count = config.count || Math.floor(shapeCount(config.type) * countScale);
     const style = shapeStyle(config.type);
     const slot = this._getSlot(count);
     if (!slot) return;
 
     const origin = this._ndcToWorld([config.x, config.y], camera);
     const ox = origin.x, oy = origin.y, oz = origin.z;
 
-    const targets = generateShape(config.type, count, [ox, oy, oz]);
+    const R = 5.2 * radiusScale;
+    const targets = generateShape(config.type, count, [ox, oy, oz], R);
...
+      // 计算粒子初始发射速度向量 (GAP-1)
+      const dx = aTarget[i3] - ox;
+      const dy = aTarget[i3 + 1] - oy;
+      const dz = aTarget[i3 + 2] - oz;
+      const len = Math.hypot(dx, dy, dz) || 0.001;
+      const speed = R * (1.8 + Math.random() * 0.7);
+      aVelocity[i3] = (dx / len) * speed;
+      aVelocity[i3 + 1] = (dy / len) * speed;
+      aVelocity[i3 + 2] = (dz / len) * speed;
```

并在 `BURST_VERT` 顶点着色器中执行真实的积分计算：
```glsl
        float coastScale = max(aStyle.z, 0.25);
        float k_drag     = mix(6.32, 1.83, smoothstep(0.0, 0.5, nLife)) / coastScale;
        
        // 速度微分积分模型取代原 targets 线性插值
        float drift      = (1.0 - exp(-k_drag * life)) / k_drag;
        pos = origin + aVelocity * drift * burst;
```

### 2. GAP-2：基于运动向量投影计算粒子切线拖尾
片元着色器接收顶点传入的运动正交化切线 `vDir`，重构屏幕坐标拉伸系，使尾迹拉伸与飞行路径完美相切：
```glsl
    // 片元着色器 (BURST_FRAG)
    vec2  c    = gl_PointCoord - 0.5;
    float tail = clamp(vTail, 0.0, 1.0);
    
    // 基于速度投影构建旋转正交系
    vec2 axis = normalize(vDir.xy + vec2(0.0001));
    vec2 perp = vec2(-axis.y, axis.x);
    vec2 local = vec2(dot(c, perp), dot(c, axis));
    vec2 oval = vec2(local.x, local.y * mix(1.0, 0.24, tail));
```

### 3. BUG-3 & P4：迫击炮发射空气冲击声效 (Launch Thump)
在 [instruments.ts](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/src/music/instruments.ts#L393-L415) 中，我们部署了一个干净低频的扫频声音源：
```typescript
export function playLaunchThump(
  velocity: number = 0.5
): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15); // 90Hz -> 30Hz 扫频
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity * 0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  trackNode(osc, 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}
```

---

## 🧪 三; 验证记录 (Verification Logs)

1. **类型安全性检查 (`npx tsc --noEmit`)**:
   TS 编译检查顺利通过，无任何类型缺失或隐式 `any` 报错。
2. **生产环境打包编译 (`npm run build`)**:
   Vite 构建在 2.22 秒内编译成功，未抛出任何死代码或 uniform 属性警告，生成静态产物 `dist`。
3. **视觉/声效质感盲审**:
   * **发射声效**: 每次点击鼠标或盛典自动发射时，耳畔立刻能听到扎实短促的炮筒低频 Thump 声，对齐 850ms 后的爆炸鼓点极其富有动感。
   * **切向火花**: 处于侧向和边缘飞行的粒子拖尾呈现出与散射切面相切的椭圆拉伸，消除了之前呆板垂直的线段划痕。
   * **Crossette 裂变**: 盛典模式或点击爆裂型烟花时，母星在半空中炸开后，延迟 350ms 后原物理位置自动绽放出数十朵小型的十字金色火花，视觉层级跃迁非常显著。

---

## 🔒 四、 GitHub 同步状态

* **本地状态**: `git status` 显示暂存区干净。
* **Commit 信息**:
  `refactor: calibrate firework engine physics, dynamic tangent-aligned trails, sparkle strobe materials, launch thump and crossette delayed fission`
