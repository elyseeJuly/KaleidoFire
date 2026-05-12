/**
 * 《万华烟火》音乐引擎入口
 */

// 音阶系统
export {
  PENTATONIC_SCALE,
  NOTE_NAMES,
  getFrequency,
  getPentatonicFrequency,
  getNextNote,
  generateMelody,
  getRandomDuration,
  getOrnamentOffset,
} from './scale';

export type { NoteName, ScaleDegree } from './scale';

// 乐器系统
export {
  getAudioContext,
  resumeAudioContext,
  playGuzheng,
  playDizi,
  playXiao,
  playBianzhong,
  playDrum,
  playNote,
  playPentatonicNote,
  stopAllSounds,
} from './instruments';

export type { InstrumentType } from './instruments';

// 节奏系统
export {
  RhythmGenerator,
  createRhythmGenerator,
  getGlobalRhythmGenerator,
  setGlobalRhythmMode,
  FESTIVAL_RHYTHM,
  FLOW_RHYTHM,
} from './rhythm';

export type { RhythmConfig, BeatCallback, MeasureCallback } from './rhythm';

// 旋律系统
export {
  MelodyGenerator,
  createMelodyGenerator,
  getGlobalMelodyGenerator,
  setGlobalMelodyMode,
  FESTIVAL_MELODY,
  FLOW_MELODY,
  NOTE_FIREWORK_MAP,
} from './melody';

export type { MelodyEvent, MelodyPhrase, MelodyConfig } from './melody';

// 主引擎
export {
  MusicEngine,
  getGlobalMusicEngine,
  createMusicEngine,
} from './engine';

export type {
  GameMode,
  MusicEngineConfig,
  FireworkSyncEvent,
  InteractionType,
  InteractionEvent,
  MusicEngineState,
} from './engine';
