/**
 * 《千树流律》音阶生成系统
 * 五声音阶：宫、商、角、徵、羽
 */

// 五声音阶音程（以C为根音）
// 宫 = 0, 商 = 2, 角 = 4, 徵 = 7, 羽 = 9
export const PENTATONIC_SCALE = [0, 2, 4, 7, 9] as const;

// 音名映射
export const NOTE_NAMES = {
  0: '宫',   // C
  2: '商',   // D
  4: '角',   // E
  7: '徵',   // G
  9: '羽',   // A
} as const;

export type NoteName = typeof NOTE_NAMES[keyof typeof NOTE_NAMES];
export type ScaleDegree = 0 | 2 | 4 | 7 | 9;

// 频率计算（以A4=440Hz为基准）
export function getFrequency(semitoneOffset: number, octave: number = 4): number {
  const A4 = 440;
  const A4_INDEX = 69; // MIDI note number for A4
  const midiNote = A4_INDEX + (octave - 4) * 12 + semitoneOffset;
  return A4 * Math.pow(2, (midiNote - A4_INDEX) / 12);
}

// 获取五声音阶频率
export function getPentatonicFrequency(degreeIndex: number, octave: number = 4): number {
  const semitone = PENTATONIC_SCALE[degreeIndex % 5];
  const actualOctave = octave + Math.floor(degreeIndex / 5);
  return getFrequency(semitone, actualOctave);
}

// 马尔可夫链转移概率
// 定义旋律进行的规则
export const MELODY_TRANSITIONS: Record<ScaleDegree, ScaleDegree[]> = {
  0: [4, 7, 9, 2],      // 宫 -> 徵、羽、商（徵羽优先）
  2: [4, 0],            // 商 -> 角、宫
  4: [7, 0],            // 角 -> 徵、宫
  7: [9, 0, 4],         // 徵 -> 羽、宫、角
  9: [7, 2, 0],         // 羽 -> 徵、商、宫
};

// 获取下一个音符
export function getNextNote(currentNote: ScaleDegree): ScaleDegree {
  const possibleNotes = MELODY_TRANSITIONS[currentNote];
  return possibleNotes[Math.floor(Math.random() * possibleNotes.length)];
}

// 生成旋律序列
export function generateMelody(
  length: number = 8,
  startNote: ScaleDegree = 0
): ScaleDegree[] {
  const melody: ScaleDegree[] = [startNote];
  let current = startNote;

  for (let i = 1; i < length; i++) {
    current = getNextNote(current);
    melody.push(current);
  }

  return melody;
}

// 音符时值概率分布
export const NOTE_DURATIONS = [
  { value: 0.25, probability: 0.2, name: '1/8' },   // 八分音符
  { value: 0.5, probability: 0.5, name: '1/4' },    // 四分音符
  { value: 1, probability: 0.3, name: '1/2' },      // 二分音符
] as const;

// 随机选择音符时值
export function getRandomDuration(): number {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const duration of NOTE_DURATIONS) {
    cumulative += duration.probability;
    if (rand <= cumulative) {
      return duration.value;
    }
  }
  
  return 0.5; // 默认四分音符
}

// 音高变化范围（用于装饰音）
export const PITCH_BEND_RANGE = 200; // cents

// 生成装饰音偏移
export function getOrnamentOffset(): number {
  // 偶尔添加小幅度音高变化模拟传统演奏技巧
  return (Math.random() - 0.5) * 50; // ±25 cents
}
