/**
 * 《千树流律》节奏生成系统
 * 提供 BPM、节拍结构和节拍事件
 */

// 节拍事件回调类型
export type BeatCallback = (beatIndex: number, measureIndex: number, time: number) => void;
export type MeasureCallback = (measureIndex: number, time: number) => void;

// 节奏配置
export interface RhythmConfig {
  bpm: number;
  beatsPerMeasure: number;
  noteValue: number; // 4 = 四分音符
}

// 盛典模式配置
export const FESTIVAL_RHYTHM: RhythmConfig = {
  bpm: 110,
  beatsPerMeasure: 4,
  noteValue: 4,
};

// 心流模式配置
export const FLOW_RHYTHM: RhythmConfig = {
  bpm: 72,
  beatsPerMeasure: 4,
  noteValue: 4,
};

// 节奏生成器类
export class RhythmGenerator {
  private config: RhythmConfig;
  private isRunning: boolean = false;
  private startTime: number = 0;
  private nextBeatTime: number = 0;
  private beatIndex: number = 0;
  private measureIndex: number = 0;
  private beatCallbacks: BeatCallback[] = [];
  private measureCallbacks: MeasureCallback[] = [];
  private lookahead: number = 0.1; // 提前量（秒）
  private scheduleAheadTime: number = 0.1;
  private timerID: number | null = null;

  constructor(config: RhythmConfig = FESTIVAL_RHYTHM) {
    this.config = config;
  }

  // 设置配置
  setConfig(config: RhythmConfig): void {
    this.config = config;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // 获取当前配置
  getConfig(): RhythmConfig {
    return { ...this.config };
  }

  // 计算每拍时长
  getBeatDuration(): number {
    return 60 / this.config.bpm;
  }

  // 计算每小节时长
  getMeasureDuration(): number {
    return this.getBeatDuration() * this.config.beatsPerMeasure;
  }

  // 注册节拍回调
  onBeat(callback: BeatCallback): () => void {
    this.beatCallbacks.push(callback);
    return () => {
      const index = this.beatCallbacks.indexOf(callback);
      if (index > -1) {
        this.beatCallbacks.splice(index, 1);
      }
    };
  }

  // 注册小节回调
  onMeasure(callback: MeasureCallback): () => void {
    this.measureCallbacks.push(callback);
    return () => {
      const index = this.measureCallbacks.indexOf(callback);
      if (index > -1) {
        this.measureCallbacks.splice(index, 1);
      }
    };
  }

  // 调度器
  private scheduler(): void {
    while (this.nextBeatTime < performance.now() / 1000 + this.scheduleAheadTime) {
      this.scheduleBeat(this.nextBeatTime);
      this.nextNote();
    }

    if (this.isRunning) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead * 1000);
    }
  }

  // 调度节拍事件
  private scheduleBeat(time: number): void {
    const beatInMeasure = this.beatIndex % this.config.beatsPerMeasure;
    
    // 触发节拍回调
    this.beatCallbacks.forEach(callback => {
      try {
        callback(beatInMeasure, this.measureIndex, time);
      } catch (e) {
        console.error('Beat callback error:', e);
      }
    });

    // 如果是小节第一拍，触发小节回调
    if (beatInMeasure === 0) {
      this.measureCallbacks.forEach(callback => {
        try {
          callback(this.measureIndex, time);
        } catch (e) {
          console.error('Measure callback error:', e);
        }
      });
    }
  }

  // 计算下一拍
  private nextNote(): void {
    const secondsPerBeat = this.getBeatDuration();
    this.nextBeatTime += secondsPerBeat;
    this.beatIndex++;

    if (this.beatIndex % this.config.beatsPerMeasure === 0) {
      this.measureIndex++;
    }
  }

  // 开始节奏
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = performance.now() / 1000;
    this.nextBeatTime = this.startTime;
    this.beatIndex = 0;
    this.measureIndex = 0;

    this.scheduler();
  }

  // 停止节奏
  stop(): void {
    this.isRunning = false;
    if (this.timerID !== null) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  // 是否正在运行
  isActive(): boolean {
    return this.isRunning;
  }

  // 获取当前节拍位置
  getCurrentPosition(): { beat: number; measure: number } {
    return {
      beat: this.beatIndex % this.config.beatsPerMeasure,
      measure: this.measureIndex,
    };
  }

  // 获取下一拍的时间
  getNextBeatTime(): number {
    return this.nextBeatTime;
  }

  // 设置 BPM
  setBPM(bpm: number): void {
    this.config.bpm = Math.max(40, Math.min(200, bpm));
  }

  // 获取 BPM
  getBPM(): number {
    return this.config.bpm;
  }
}

// 创建节奏生成器实例
export function createRhythmGenerator(mode: 'festival' | 'flow' = 'festival'): RhythmGenerator {
  const config = mode === 'festival' ? FESTIVAL_RHYTHM : FLOW_RHYTHM;
  return new RhythmGenerator(config);
}

// 全局节奏生成器实例
let globalRhythmGenerator: RhythmGenerator | null = null;

// 获取全局节奏生成器
export function getGlobalRhythmGenerator(): RhythmGenerator {
  if (!globalRhythmGenerator) {
    globalRhythmGenerator = createRhythmGenerator('festival');
  }
  return globalRhythmGenerator;
}

// 设置全局节奏生成器模式
export function setGlobalRhythmMode(mode: 'festival' | 'flow'): void {
  if (globalRhythmGenerator) {
    globalRhythmGenerator.stop();
  }
  globalRhythmGenerator = createRhythmGenerator(mode);
}
