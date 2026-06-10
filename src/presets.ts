import { CellPreset } from './types.js';

export const PRESETS: Record<string, CellPreset> = {
  classic: {
    getChar: () => '■',
    charWidth: 1,
  },
  'double-block': {
    getChar: () => '██',
    charWidth: 2,
  },
  emoji: {
    getChar: (level: number) => {
      switch (level) {
        case 0: return '⚪';
        case 1: return '🌱';
        case 2: return '🌿';
        case 3: return '🌳';
        case 4: return '🌴';
        default: return '⚪';
      }
    },
    isEmoji: true,
    charWidth: 2,
  }
};

export function resolvePreset(presetOpt?: string, charOpt?: string, emojisOpt?: string[]): CellPreset {
  if (emojisOpt && emojisOpt.length >= 4) {
    const hasZero = emojisOpt.length >= 5;
    const level0 = hasZero ? emojisOpt[0] : '⚪';
    const level1 = hasZero ? emojisOpt[1] : emojisOpt[0];
    const level2 = hasZero ? emojisOpt[2] : emojisOpt[1];
    const level3 = hasZero ? emojisOpt[3] : emojisOpt[2];
    const level4 = hasZero ? emojisOpt[4] : emojisOpt[3];

    return {
      getChar: (level: number) => {
        switch (level) {
          case 0: return level0;
          case 1: return level1;
          case 2: return level2;
          case 3: return level3;
          case 4: return level4;
          default: return level0;
        }
      },
      isEmoji: true,
      charWidth: 2,
    };
  }
  if (charOpt) {
    return {
      getChar: () => charOpt,
      charWidth: charOpt.length,
    };
  }
  if (presetOpt && PRESETS[presetOpt]) {
    return PRESETS[presetOpt];
  }
  return PRESETS.classic;
}
