/**
 * 《千树流律》旋律生成系统
 * 使用马尔可夫链生成五声音阶旋律
 */

import {
  type ScaleDegree,
  PENTATONIC_SCALE,
  MELODY_TRANSITIONS,
  generateMelody as generateMelodyNotes,
  getRandomDuration,
} from './scale';
import { type InstrumentType, playPentatonicNote, playDrum } from './instruments';

// 旋律事件
export interface MelodyEvent {
  note: ScaleDegree;
  noteIndex: number;
  octave: number;
  duration: number;
  time: number;
  instrument: InstrumentType;
  velocity: number;
}

// 旋律段落
export interface MelodyPhrase {
  events: MelodyEvent[];
  totalDuration: number;
}

// 旋律配置
export interface MelodyConfig {
  minPhraseLength: number;
  maxPhraseLength: number;
  octaveRange: [number, number];
  instruments: InstrumentType[];
  velocityRange: [number, number];
}

// 盛典模式旋律配置
export const FESTIVAL_MELODY: MelodyConfig = {
  minPhraseLength: 4,
  maxPhraseLength: 8,
  octaveRange: [3, 5],
  instruments: ['bianzhong', 'guzheng', 'dizi'],
  velocityRange: [0.6, 0.9],
};

// 心流模式旋律配置
export const FLOW_MELODY: MelodyConfig = {
  minPhraseLength: 3,
  maxPhraseLength: 6,
  octaveRange: [3, 4],
  instruments: ['xiao', 'dizi'],
  velocityRange: [0.4, 0.7],
};

// 音符与烟花形态映射
export const NOTE_FIREWORK_MAP: Record<ScaleDegree, string> = {
  0: 'peony',      // 宫 -> 牡丹
  2: 'chrysanthemum', // 商 -> 菊花
  4: 'willow',     // 角 -> 垂柳
  7: 'starburst',  // 徵 -> 星爆（替代棕榈）
  9: 'crossette',  // 羽 -> 十字（替代闪烁）
};

// 旋律生成器类
export class MelodyGenerator {
  private config: MelodyConfig;
  private currentNote: ScaleDegree = 0;

  constructor(config: MelodyConfig = FESTIVAL_MELODY) {
    this.config = config;
  }

  // 设置配置
  setConfig(config: MelodyConfig): void {
    this.config = config;
  }

  // 获取配置
  getConfig(): MelodyConfig {
    return { ...this.config };
  }

  // 生成单个旋律段落
  generatePhrase(startTime: number = 0): MelodyPhrase {
    const length = Math.floor(
      Math.random() * (this.config.maxPhraseLength - this.config.minPhraseLength + 1)
    ) + this.config.minPhraseLength;

    const events: MelodyEvent[] = [];
    let currentTime = startTime;

    // 生成音符序列
    const notes = generateMelodyNotes(length, this.currentNote);

    for (let i = 0; i < length; i++) {
      const note = notes[i];
      const duration = getRandomDuration();
      const octave = this.getRandomOctave();
      const instrument = this.getRandomInstrument();
      const velocity = this.getRandomVelocity();

      events.push({
        note,
        noteIndex: PENTATONIC_SCALE.indexOf(note),
        octave,
        duration,
        time: currentTime,
        instrument,
        velocity,
      });

      currentTime += duration * (60 / 110); // 转换为秒（假设110 BPM）
      this.currentNote = note;
    }

    const phrase: MelodyPhrase = {
      events,
      totalDuration: currentTime - startTime,
    };

    return phrase;
  }

  // 生成多个段落
  generatePhrases(count: number): MelodyPhrase[] {
    const phrases: MelodyPhrase[] = [];
    let startTime = 0;

    for (let i = 0; i < count; i++) {
      const phrase = this.generatePhrase(startTime);
      phrases.push(phrase);
      startTime += phrase.totalDuration;
    }

    return phrases;
  }

  // 获取随机音域
  private getRandomOctave(): number {
    const [min, max] = this.config.octaveRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 获取随机乐器
  private getRandomInstrument(): InstrumentType {
    const instruments = this.config.instruments;
    return instruments[Math.floor(Math.random() * instruments.length)];
  }

  // 获取随机力度
  private getRandomVelocity(): number {
    const [min, max] = this.config.velocityRange;
    return Math.random() * (max - min) + min;
  }

  // 播放旋律段落
  playPhrase(phrase: MelodyPhrase, onEvent?: (event: MelodyEvent) => void): void {
    phrase.events.forEach(event => {
      setTimeout(() => {
        // 播放音符
        playPentatonicNote(
          event.instrument,
          event.noteIndex,
          event.octave,
          event.duration,
          event.velocity
        );

        // 触发回调
        if (onEvent) {
          onEvent(event);
        }
      }, event.time * 1000);
    });
  }

  // 获取音符对应的烟花类型
  static getFireworkType(note: ScaleDegree): string {
    return NOTE_FIREWORK_MAP[note] || 'chrysanthemum';
  }

  // 生成并播放即兴旋律（用于交互）
  playImprovisation(
    baseNote: ScaleDegree = 0,
    count: number = 3,
    onEvent?: (event: MelodyEvent) => void
  ): void {
    const notes: ScaleDegree[] = [baseNote];
    let current = baseNote;

    for (let i = 1; i < count; i++) {
      const transitions = MELODY_TRANSITIONS[current];
      current = transitions[Math.floor(Math.random() * transitions.length)];
      notes.push(current);
    }

    let delay = 0;
    notes.forEach((note) => {
      const duration = getRandomDuration();
      const octave = this.getRandomOctave();
      const instrument = this.getRandomInstrument();
      const velocity = this.getRandomVelocity();

      setTimeout(() => {
        const noteIndex = PENTATONIC_SCALE.indexOf(note);
        playPentatonicNote(instrument, noteIndex, octave, duration, velocity);

        if (onEvent) {
          onEvent({
            note,
            noteIndex,
            octave,
            duration,
            time: delay,
            instrument,
            velocity,
          });
        }
      }, delay * 1000);

      delay += duration * (60 / 110);
    });
  }

  // 播放鼓点
  playDrumBeat(velocity: number = 0.7): void {
    playDrum(velocity);
  }

  // 生成连击旋律（天焰覆霄）
  playComboMelody(comboCount: number, onEvent?: (event: MelodyEvent) => void): void {
    // 快速上行音阶
    const baseIndex = Math.floor(Math.random() * 3); // 从宫、商、角开始
    
    for (let i = 0; i < Math.min(comboCount, 8); i++) {
      const noteIndex = (baseIndex + i) % 5;
      const octave = 4 + Math.floor((baseIndex + i) / 5);
      const delay = i * 0.1;

      setTimeout(() => {
        playPentatonicNote('bianzhong', noteIndex, octave, 0.5, 0.8);

        if (onEvent) {
          onEvent({
            note: PENTATONIC_SCALE[noteIndex],
            noteIndex,
            octave,
            duration: 0.5,
            time: delay,
            instrument: 'bianzhong',
            velocity: 0.8,
          });
        }
      }, delay * 1000);
    }

    // 最后一个大鼓
    setTimeout(() => {
      playDrum(1.0);
    }, Math.min(comboCount, 8) * 0.1 * 1000);
  }
}

// 创建旋律生成器
export function createMelodyGenerator(mode: 'festival' | 'flow' = 'festival'): MelodyGenerator {
  const config = mode === 'festival' ? FESTIVAL_MELODY : FLOW_MELODY;
  return new MelodyGenerator(config);
}

// 全局旋律生成器
let globalMelodyGenerator: MelodyGenerator | null = null;

// 获取全局旋律生成器
export function getGlobalMelodyGenerator(): MelodyGenerator {
  if (!globalMelodyGenerator) {
    globalMelodyGenerator = createMelodyGenerator('festival');
  }
  return globalMelodyGenerator;
}

// 设置全局旋律模式
export function setGlobalMelodyMode(mode: 'festival' | 'flow'): void {
  globalMelodyGenerator = createMelodyGenerator(mode);
}
