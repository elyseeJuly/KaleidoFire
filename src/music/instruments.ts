/**
 * 《千树流律》传统乐器合成系统
 * 使用 Web Audio API 实现物理建模合成
 */

import { getFrequency, PENTATONIC_SCALE } from './scale';

// 音频上下文
let audioContext: AudioContext | null = null;

// 获取或创建音频上下文
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// 确保音频上下文处于运行状态
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

// 乐器类型
export type InstrumentType = 'guzheng' | 'dizi' | 'xiao' | 'bianzhong' | 'drum';

// 乐器配置
interface InstrumentConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const INSTRUMENT_CONFIGS: Record<InstrumentType, InstrumentConfig> = {
  guzheng: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.5 },
  dizi: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 },
  xiao: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 1.0 },
  bianzhong: { attack: 0.001, decay: 0.5, sustain: 0.3, release: 3.0 },
  drum: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
};

// 活跃音符节点（用于复用和停止）
const activeNodes = new Set<AudioScheduledSourceNode>();

function trackNode(node: AudioScheduledSourceNode, duration: number) {
  activeNodes.add(node);
  setTimeout(() => {
    activeNodes.delete(node);
  }, duration * 1000 + 500);
}

// ==================== 古筝（Karplus-Strong 算法）====================

export function playGuzheng(
  frequency: number,
  duration: number = 1.0,
  velocity: number = 0.7
): void {
  const ctx = getAudioContext();
  const config = INSTRUMENT_CONFIGS.guzheng;
  
  // 创建激励噪声（模拟拨弦初始冲击）
  const bufferSize = ctx.sampleRate * 0.1; // 100ms 噪声
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    // 使用衰减噪声
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  
  // 延迟线（模拟弦的共振）
  const delay = ctx.createDelay();
  delay.delayTime.value = 1 / frequency;
  
  // 滤波器（模拟弦的衰减特性）
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency * 4;
  filter.Q.value = 1;
  
  // 增益控制
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(velocity * 0.5, ctx.currentTime + config.attack);
  gain.gain.exponentialRampToValueAtTime(
    velocity * 0.5 * config.sustain,
    ctx.currentTime + config.attack + config.decay
  );
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  // 连接：噪声 -> 滤波 -> 延迟 -> 输出
  //       ^____________|
  noise.connect(filter);
  filter.connect(delay);
  
  // 增加衰减反馈回路防止自激 (BUG-6)
  const feedbackGain = ctx.createGain();
  feedbackGain.gain.value = 0.96;
  delay.connect(feedbackGain);
  feedbackGain.connect(filter);
  
  delay.connect(gain);
  gain.connect(ctx.destination);
  
  trackNode(noise, duration);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
  
  // 添加泛音（古筝的明亮感）
  addHarmonics(ctx, frequency, velocity * 0.3, duration, [2, 3, 4]);
}

// ==================== 笛子（FM 合成）====================

export function playDizi(
  frequency: number,
  duration: number = 1.0,
  velocity: number = 0.6
): void {
  const ctx = getAudioContext();
  const config = INSTRUMENT_CONFIGS.dizi;
  
  // 载波
  const carrier = ctx.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.value = frequency;
  
  // 调制器（气流感）
  const modulator = ctx.createOscillator();
  modulator.type = 'sine';
  modulator.frequency.value = frequency * 0.5; // 低频调制
  
  const modGain = ctx.createGain();
  modGain.gain.value = frequency * 0.3; // 调制深度
  
  // 颤音 LFO
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5; // 5Hz 颤音
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = frequency * 0.02;
  
  // 主增益
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(velocity * 0.4, ctx.currentTime + config.attack);
  gain.gain.setValueAtTime(velocity * 0.4 * config.sustain, ctx.currentTime + config.attack + config.decay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  // 滤波器（气流感）
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = 5;
  
  // 连接
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);
  vibrato.connect(vibratoGain);
  vibratoGain.connect(carrier.frequency);
  carrier.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  trackNode(carrier, duration);
  trackNode(modulator, duration);
  trackNode(vibrato, duration);
  carrier.start(ctx.currentTime);
  modulator.start(ctx.currentTime);
  vibrato.start(ctx.currentTime);
  
  carrier.stop(ctx.currentTime + duration);
  modulator.stop(ctx.currentTime + duration);
  vibrato.stop(ctx.currentTime + duration);
}

// ==================== 箫（带通滤波 + 噪声）====================

export function playXiao(
  frequency: number,
  duration: number = 1.5,
  velocity: number = 0.5
): void {
  const ctx = getAudioContext();
  const config = INSTRUMENT_CONFIGS.xiao;
  
  // 基音
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = frequency;
  
  // 呼吸噪声
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.3;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  
  // 噪声滤波（模拟呼吸）
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = frequency;
  noiseFilter.Q.value = 3;
  
  // 主滤波器
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency * 2;
  filter.Q.value = 2;
  
  // 增益包络
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(velocity * 0.5, ctx.currentTime + config.attack);
  gain.gain.setValueAtTime(velocity * 0.5 * config.sustain, ctx.currentTime + config.attack + config.decay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  // 噪声增益
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = velocity * 0.15;
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  // 连接
  osc.connect(filter);
  filter.connect(gain);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  gain.connect(ctx.destination);
  
  trackNode(osc, duration);
  trackNode(noise, duration);
  osc.start(ctx.currentTime);
  noise.start(ctx.currentTime);
  
  osc.stop(ctx.currentTime + duration);
  noise.stop(ctx.currentTime + duration);
}

// ==================== 编钟（加法合成）====================

export function playBianzhong(
  frequency: number,
  duration: number = 3.0,
  velocity: number = 0.8
): void {
  const ctx = getAudioContext();
  const config = INSTRUMENT_CONFIGS.bianzhong;
  
  // 编钟的泛音结构
  const harmonics = [
    { ratio: 1, gain: 1.0 },      // 基音
    { ratio: 2.7, gain: 0.4 },    // 特殊泛音
    { ratio: 4.2, gain: 0.2 },    // 金属感
    { ratio: 6.5, gain: 0.1 },    // 高频泛音
  ];
  
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(velocity * 0.5, ctx.currentTime + config.attack);
  masterGain.gain.exponentialRampToValueAtTime(
    velocity * 0.5 * config.sustain,
    ctx.currentTime + config.attack + config.decay
  );
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  harmonics.forEach((harmonic, index) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency * harmonic.ratio;
    
    const gain = ctx.createGain();
    gain.gain.value = harmonic.gain;
    
    // 每个泛音不同的衰减
    const env = ctx.createGain();
    env.gain.setValueAtTime(1, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * (0.5 + index * 0.2));
    
    osc.connect(gain);
    gain.connect(env);
    env.connect(masterGain);
    
    trackNode(osc, duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  });
  
  // 金属共鸣滤波器
  const filter = ctx.createBiquadFilter();
  filter.type = 'peaking';
  filter.frequency.value = frequency * 2;
  filter.gain.value = 10;
  filter.Q.value = 10;
  
  masterGain.connect(filter);
  filter.connect(ctx.destination);
}

// ==================== 大鼓（打击乐）====================

export function playDrum(
  velocity: number = 0.8
): void {
  const ctx = getAudioContext();
  
  // 低频振荡（鼓身）
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
  
  // 噪声（鼓皮）
  const bufferSize = ctx.sampleRate * 0.1;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = (Math.random() * 2 - 1);
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  
  // 滤波器
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  
  // 增益
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity * 0.8, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(velocity * 0.4, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  
  // 连接
  osc.connect(filter);
  filter.connect(gain);
  noise.connect(noiseGain);
  
  gain.connect(ctx.destination);
  noiseGain.connect(ctx.destination);
  
  trackNode(osc, 0.3);
  trackNode(noise, 0.1);
  osc.start(ctx.currentTime);
  noise.start(ctx.currentTime);
  
  osc.stop(ctx.currentTime + 0.3);
  noise.stop(ctx.currentTime + 0.1);
}

// ==================== 辅助函数 ====================

// 添加泛音
function addHarmonics(
  ctx: AudioContext,
  baseFreq: number,
  velocity: number,
  duration: number,
  harmonics: number[]
): void {
  harmonics.forEach(harmonic => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = baseFreq * harmonic;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(velocity / harmonic, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    trackNode(osc, duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  });
}

// ==================== 发射筒冲击音（Launch Thump） ====================

export function playLaunchThump(
  velocity: number = 0.5
): void {
  const ctx = getAudioContext();
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity * 0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  trackNode(osc, 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

// 播放指定乐器的音符
export function playNote(
  instrument: InstrumentType,
  semitoneOffset: number,
  octave: number = 4,
  duration: number = 1.0,
  velocity: number = 0.7
): void {
  const frequency = getFrequency(semitoneOffset, octave);
  
  switch (instrument) {
    case 'guzheng':
      playGuzheng(frequency, duration, velocity);
      break;
    case 'dizi':
      playDizi(frequency, duration, velocity);
      break;
    case 'xiao':
      playXiao(frequency, duration, velocity);
      break;
    case 'bianzhong':
      playBianzhong(frequency, duration, velocity);
      break;
    case 'drum':
      playDrum(velocity);
      break;
  }
}

// 播放五声音阶音符
export function playPentatonicNote(
  instrument: InstrumentType,
  degreeIndex: number,
  octave: number = 4,
  duration: number = 1.0,
  velocity: number = 0.7
): void {
  const semitone = PENTATONIC_SCALE[degreeIndex % 5];
  const actualOctave = octave + Math.floor(degreeIndex / 5);
  playNote(instrument, semitone, actualOctave, duration, velocity);
}

// 停止所有声音
export function stopAllSounds(): void {
  activeNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) {
      // 忽略已停止的节点
    }
  });
  activeNodes.clear();
}
