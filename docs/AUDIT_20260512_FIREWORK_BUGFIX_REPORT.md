# 2026-05-12 烟花无法燃放问题修复报告

## 概述
本次排查发现并修复了4个Bug，其中1个为**致命性Bug**（直接导致烟花无法燃放），其余3个为功能性/视觉效果Bug。

---

## Bug 1（致命🔥）：React StrictMode 导致 Three.js 画布丢失

### 严重级别
**致命** — 烟花完全无法渲染

### 影响范围
所有模式（音乐模式/非音乐模式）下烟花均不可见

### 根因分析

在 `main.tsx` 中使用了 React 19 的 `<StrictMode>`：

```typescript
// src/main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

React 19 开发模式下 StrictMode 会执行**双重挂载**（mount → unmount → remount）以检测副作用。问题出现在 `useFireworkSystem.ts` 的 `initWebGL` 函数中：

| 步骤 | 操作 | 状态 |
|------|------|------|
| ① 首次挂载 | `initWebGL()` 创建渲染器、Scene、Camera、FireworkPool、EffectComposer，canvas 追加到 DOM | ✅ 正常 |
| ② StrictMode 卸载 | `useEffect` 清理函数执行：`renderer.setAnimationLoop(null)`、`container.removeChild(canvas)` | ✅ 清理 |
| ③ 二次挂载 | `initWebGL()` 执行，但 `rendererRef.current` 仍指向旧的渲染器对象（非null），函数直接 `return` | ❌ **失败** |

**结果**：页面上没有 Three.js 的 `<canvas>` 元素，所有粒子渲染不可见。

### 修复方案

在 `src/hooks/useFireworkSystem.ts` 的 `initWebGL` 清理函数中，重置所有 ref 引用并释放 Three.js 资源：

```typescript
return () => {
    window.removeEventListener('resize', handleResize);
    renderer.setAnimationLoop(null);
    container.removeChild(renderer.domElement);
    renderer.dispose();
    rendererRef.current = null;
    sceneRef.current = null;
    cameraRef.current = null;
    fireworkPoolRef.current = null;
    audioInitializedRef.current = false;
};
```

---

## Bug 2：shapeWaterfall Y轴坐标计算异常

### 严重级别
中等 — 影响"瀑布"烟花形态的视觉效果

### 根因分析

在 `src/lib/gpu-engine/shapes.ts` 中：

```typescript
// 修复前
a[i * 3 + 1] = 3 - 5 - Math.random() * 8;  // 范围 [-10, -2]
```

`3 - 5` 恒等于 `-2`，这个表达式可疑且瀑布粒子全部集中在Y轴负半轴，视觉效果偏离预期。

### 修复方案

调整为更自然的对称分布，使瀑布从原点附近向下倾泻：

```typescript
// 修复后
a[i * 3 + 1] = 4 - Math.random() * 10;  // 范围 [-6, 4]
```

---

## Bug 3：音乐引擎中烟花同步定时使用硬编码

### 严重级别
中等 — 音乐模式下烟花发射与节拍不同步

### 根因分析

在 `src/music/engine.ts` 中：

```typescript
// 修复前
phrase.events.forEach((event, index) => {
    setTimeout(() => {
        if (this.config.syncFireworks) {
            this.syncFirework(event);
        }
    }, index * 200); // ❌ 硬编码 200ms 间隔
});
```

使用固定的 `index * 200` 毫秒代替了音乐事件的实际时间，导致烟花发射时机与旋律节拍脱节。

### 修复方案

使用音乐事件中预计算的实际时间：

```typescript
// 修复后
phrase.events.forEach((event, index) => {
    setTimeout(() => {
        if (this.config.syncFireworks) {
            this.syncFirework(event);
        }
    }, event.time * 1000); // ✅ 使用音乐事件的实际时间
});
```

---

## Bug 4：`_getSlot` 回收活跃slot时缺少容量保护

### 严重级别
低 — 仅在极端并发场景下可能触发

### 根因分析

在 `src/lib/gpu-engine/FireworkPool.ts` 中，当所有 `MAX_BURSTS(10)` 个slot都处于活跃状态时，`_getSlot` 返回最老的活跃slot进行回收，但**未检查该slot的最大粒子容量是否满足当前烟花的需求**。

```typescript
// 修复前
if (s.active && s.birthSec < oldestBirth) {
    oldestBirth = s.birthSec;
    best = s;  // ❌ 未检查 maxPtcl >= count
}
```

### 修复方案

在判断活跃slot时增加容量检查：

```typescript
// 修复后
if (s.active && s.maxPtcl >= count && s.birthSec < oldestBirth) {
    oldestBirth = s.birthSec;
    best = s;  // ✅ 确保容量足够
}
```

---

## 修复验证

- ✅ `npm run build` 构建成功（1728 modules transformed, 0 errors）
- ✅ TypeScript 编译零错误
- ✅ 构建产物正常生成（dist/ 目录）

## 受影响文件清单

| 文件 | 修复类型 |
|------|----------|
| `src/hooks/useFireworkSystem.ts` | Bug 1 - 致命 |
| `src/lib/gpu-engine/shapes.ts` | Bug 2 - 中等 |
| `src/music/engine.ts` | Bug 3 - 中等 |
| `src/lib/gpu-engine/FireworkPool.ts` | Bug 4 - 低 |

---

*报告日期: 2026-05-12*
*修复人: AI Code Assistant*