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

export function resolvePreset(presetOpt?: string, charOpt?: string): CellPreset {
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
