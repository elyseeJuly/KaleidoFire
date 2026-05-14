/**
 * 《万华烟火》主音乐引擎
 */

import { RhythmGenerator, createRhythmGenerator, setGlobalRhythmMode } from './rhythm';
import { MelodyGenerator, createMelodyGenerator, setGlobalMelodyMode, type MelodyEvent } from './melody';
import { type ScaleDegree, PENTATONIC_SCALE } from './scale';
import { resumeAudioContext } from './instruments';
import type { FireworkType } from '@/types/firework';

// 游戏模式
export type GameMode = 'festival' | 'flow';

// 音乐引擎配置
export interface MusicEngineConfig {
  mode: GameMode;
  autoPlay: boolean;
  syncFireworks: boolean;
}

// 烟花同步事件
export interface FireworkSyncEvent {
  type: 'launch' | 'explode';
  fireworkType: FireworkType;
  x: number;
  y: number;
  note: ScaleDegree;
  velocity: number;
  time: number;
}

// 交互事件类型
export type InteractionType = 'tap' | 'hold' | 'holdRelease' | 'combo';

// 交互事件
export interface InteractionEvent {
  type: InteractionType;
  x: number;
  y: number;
  duration?: number;
  comboCount?: number;
}

// 音乐引擎状态
export interface MusicEngineState {
  isPlaying: boolean;
  mode: GameMode;
  currentMeasure: number;
  currentBeat: number;
  bpm: number;
  comboCount: number;
}

// 音乐引擎类
export class MusicEngine {
  private rhythmGenerator: RhythmGenerator;
  private melodyGenerator: MelodyGenerator;
  private config: MusicEngineConfig;
  private isPlaying: boolean = false;
  private comboCount: number = 0;
  private holdStartTime: number = 0;
  private isHolding: boolean = false;
  private fireworkSyncCallbacks: ((event: FireworkSyncEvent) => void)[] = [];
  private stateChangeCallbacks: ((state: MusicEngineState) => void)[] = [];
  private autoPlayInterval: number | null = null;

  constructor(config: MusicEngineConfig = { mode: 'festival', autoPlay: true, syncFireworks: true }) {
    this.config = config;
    this.rhythmGenerator = createRhythmGenerator(config.mode);
    this.melodyGenerator = createMelodyGenerator(config.mode);
    this.setupRhythmCallbacks();
  }

  // 设置节奏回调
  private setupRhythmCallbacks(): void {
    // 每拍触发
    this.rhythmGenerator.onBeat((beatIndex, measureIndex, _time) => {
      this.broadcastStateChange();

      // 自动播放模式下，第一拍生成新旋律
      if (this.config.autoPlay && beatIndex === 0) {
        this.playMeasureMelody(measureIndex);
      }

      // 盛典模式下，偶尔添加鼓点
      if (this.config.mode === 'festival' && beatIndex % 2 === 0 && Math.random() < 0.3) {
        this.melodyGenerator.playDrumBeat(0.5);
      }
    });

    // 每小节触发
    this.rhythmGenerator.onMeasure((measureIndex, _time) => {
      // 小节开始时的特殊处理
      if (this.config.mode === 'festival' && measureIndex % 4 === 0) {
        // 每4小节重置连击
        this.resetCombo();
      }
    });
  }

  // 播放小节旋律
  private playMeasureMelody(_measureIndex: number): void {
    const phrase = this.melodyGenerator.generatePhrase();
    
    phrase.events.forEach((event, _index) => {
      setTimeout(() => {
        // 触发烟花同步
        if (this.config.syncFireworks) {
          this.syncFirework(event);
        }
      }, event.time * 1000);
    });
  }

  // 同步烟花
  private syncFirework(event: MelodyEvent): void {
    const fireworkType = this.getFireworkTypeForNote(event.note);
    
    // 计算屏幕位置（基于音符音高）
    const x = 0.2 + (event.noteIndex / 5) * 0.6; // 20% - 80% 屏幕宽度
    const y = 0.2 + (event.octave - 3) * 0.15;   // 基于音高的高度

    const syncEvent: FireworkSyncEvent = {
      type: 'launch',
      fireworkType,
      x,
      y,
      note: event.note,
      velocity: event.velocity,
      time: performance.now(),
    };

    this.broadcastFireworkSync(syncEvent);
  }

  // 获取音符对应的烟花类型
  private getFireworkTypeForNote(note: ScaleDegree): FireworkType {
    const map: Record<ScaleDegree, FireworkType> = {
      0: 'peony',        // 宫 - 牡丹
      2: 'chrysanthemum', // 商 - 菊花
      4: 'willow',       // 角 - 垂柳
      7: 'starburst',    // 徵 - 星爆（替代棕榈）
      9: 'crossette',    // 羽 - 十字（替代闪烁）
    };
    return map[note] || 'chrysanthemum';
  }

  // 注册烟花同步回调
  onFireworkSync(callback: (event: FireworkSyncEvent) => void): () => void {
    this.fireworkSyncCallbacks.push(callback);
    return () => {
      const index = this.fireworkSyncCallbacks.indexOf(callback);
      if (index > -1) {
        this.fireworkSyncCallbacks.splice(index, 1);
      }
    };
  }

  // 广播烟花同步事件
  private broadcastFireworkSync(event: FireworkSyncEvent): void {
    this.fireworkSyncCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (e) {
        console.error('Firework sync callback error:', e);
      }
    });
  }

  // 注册状态变化回调
  onStateChange(callback: (state: MusicEngineState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  // 广播状态变化
  private broadcastStateChange(): void {
    const state = this.getState();
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (e) {
        console.error('State change callback error:', e);
      }
    });
  }

  // 启动引擎
  async start(): Promise<void> {
    if (this.isPlaying) return;

    await resumeAudioContext();
    this.isPlaying = true;
    this.rhythmGenerator.start();
    this.broadcastStateChange();
  }

  // 停止引擎
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.rhythmGenerator.stop();
    
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }

    this.broadcastStateChange();
  }

  // 切换模式
  setMode(mode: GameMode): void {
    if (this.config.mode === mode) return;

    this.config.mode = mode;
    setGlobalRhythmMode(mode);
    setGlobalMelodyMode(mode);
    
    this.rhythmGenerator = createRhythmGenerator(mode);
    this.melodyGenerator = createMelodyGenerator(mode);
    this.setupRhythmCallbacks();

    // 如果正在播放，重新启动
    if (this.isPlaying) {
      this.rhythmGenerator.start();
    }

    this.broadcastStateChange();
  }

  // 获取当前模式
  getMode(): GameMode {
    return this.config.mode;
  }

  // 获取状态
  getState(): MusicEngineState {
    const position = this.rhythmGenerator.getCurrentPosition();
    return {
      isPlaying: this.isPlaying,
      mode: this.config.mode,
      currentMeasure: position.measure,
      currentBeat: position.beat,
      bpm: this.rhythmGenerator.getBPM(),
      comboCount: this.comboCount,
    };
  }

  // 处理交互事件
  handleInteraction(event: InteractionEvent): void {
    switch (event.type) {
      case 'tap':
        this.handleTap(event);
        break;
      case 'hold':
        this.handleHoldStart(event);
        break;
      case 'holdRelease':
        this.handleHoldEnd(event);
        break;
      case 'combo':
        this.handleCombo(event);
        break;
    }

    // 记录最后交互时间（用于未来扩展）
    // this.lastInteractionTime = now;
  }

  // 处理点击
  private handleTap(event: InteractionEvent): void {
    // 增加连击
    this.comboCount++;

    // 播放单音
    const randomNote = PENTATONIC_SCALE[Math.floor(Math.random() * 5)];
    
    this.melodyGenerator.playImprovisation(randomNote, 1, (_melodyEvent) => {
      if (this.config.syncFireworks) {
        const fireworkEvent: FireworkSyncEvent = {
          type: 'launch',
          fireworkType: this.getFireworkTypeForNote(randomNote),
          x: event.x / window.innerWidth,
          y: event.y / window.innerHeight,
          note: randomNote,
          velocity: 0.6,
          time: performance.now(),
        };
        this.broadcastFireworkSync(fireworkEvent);
      }
    });

    this.broadcastStateChange();
  }

  // 处理长按开始
  private handleHoldStart(_event: InteractionEvent): void {
    this.isHolding = true;
    this.holdStartTime = performance.now();

    // 播放持续音（宫音）
    // const note = PENTATONIC_SCALE[0];
    // 这里可以添加持续音逻辑
  }

  // 处理长按结束
  private handleHoldEnd(event: InteractionEvent): void {
    if (!this.isHolding) return;

    const holdDuration = (performance.now() - this.holdStartTime) / 1000;
    this.isHolding = false;

    // 根据按住时长决定烟花大小
    const isLarge = holdDuration > 1.0;
    const note = isLarge ? PENTATONIC_SCALE[4] : PENTATONIC_SCALE[0]; // 角或宫

    this.melodyGenerator.playImprovisation(note, isLarge ? 4 : 2, (_melodyEvent) => {
      if (this.config.syncFireworks) {
        const fireworkEvent: FireworkSyncEvent = {
          type: 'launch',
          fireworkType: isLarge ? 'atom' : 'peony',
          x: event.x / window.innerWidth,
          y: event.y / window.innerHeight,
          note,
          velocity: isLarge ? 1.0 : 0.7,
          time: performance.now(),
        };
        this.broadcastFireworkSync(fireworkEvent);
      }
    });
  }

  // 处理连击
  private handleCombo(event: InteractionEvent): void {
    const combo = event.comboCount || this.comboCount;

    if (combo >= 8) {
      // 触发万华绽放
      this.triggerWanhuaBloom();
    } else {
      // 普通连击旋律
      this.melodyGenerator.playComboMelody(combo, (melodyEvent) => {
        if (this.config.syncFireworks) {
          const fireworkEvent: FireworkSyncEvent = {
            type: 'launch',
            fireworkType: 'chrysanthemum',
            x: 0.1 + Math.random() * 0.8,
            y: 0.1 + Math.random() * 0.4,
            note: melodyEvent.note,
            velocity: melodyEvent.velocity,
            time: performance.now(),
          };
          this.broadcastFireworkSync(fireworkEvent);
        }
      });
    }

    this.broadcastStateChange();
  }

  // 万华绽放 - 终极效果
  private triggerWanhuaBloom(): void {
    // 播放盛大旋律
    this.melodyGenerator.playComboMelody(16);

    // 触发连续大规模烟花
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const fireworkEvent: FireworkSyncEvent = {
          type: 'launch',
          fireworkType: i % 2 === 0 ? 'atom' : 'chrysanthemum',
          x: 0.1 + (i / 10) * 0.8,
          y: 0.1 + Math.random() * 0.3,
          note: PENTATONIC_SCALE[i % 5],
          velocity: 1.0,
          time: performance.now(),
        };
        this.broadcastFireworkSync(fireworkEvent);
      }, i * 150);
    }

    // 重置连击
    this.comboCount = 0;
  }

  // 重置连击
  resetCombo(): void {
    this.comboCount = 0;
    this.broadcastStateChange();
  }

  // 设置 BPM
  setBPM(bpm: number): void {
    this.rhythmGenerator.setBPM(bpm);
    this.broadcastStateChange();
  }

  // 获取 BPM
  getBPM(): number {
    return this.rhythmGenerator.getBPM();
  }
}

// 全局音乐引擎实例
let globalMusicEngine: MusicEngine | null = null;

// 获取全局音乐引擎
export function getGlobalMusicEngine(): MusicEngine {
  if (!globalMusicEngine) {
    globalMusicEngine = new MusicEngine();
  }
  return globalMusicEngine;
}

// 创建新的音乐引擎
export function createMusicEngine(config?: MusicEngineConfig): MusicEngine {
  return new MusicEngine(config);
}
