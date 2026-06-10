import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToAnsi256, rgbToAnsi16, colorize } from '../src/color.js';

describe('Color Utilities', () => {
  it('should parse hex to rgb correctly', () => {
    expect(hexToRgb('#161b22')).toEqual({ r: 22, g: 27, b: 34 });
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('invalid')).toBeNull();
  });

  it('should convert rgb to 256-color code', () => {
    expect(rgbToAnsi256(0, 0, 0)).toBe(16);
    expect(rgbToAnsi256(255, 255, 255)).toBe(231);
    // Grayscale
    expect(rgbToAnsi256(128, 128, 128)).toBe(243);
  });

  it('should map rgb to basic 16-color code based on distance', () => {
    expect(rgbToAnsi16(0, 128, 0)).toBe(32); // basic green
    expect(rgbToAnsi16(255, 0, 0)).toBe(91); // bright red
  });

  it('should colorize text correctly using truecolor', () => {
    const text = '■';
    const result = colorize(text, '#0e4429', 'truecolor');
    expect(result).toBe('\x1b[38;2;14;68;41m■\x1b[0m');
  });

  it('should colorize text correctly using ansi256 fallback', () => {
    const text = '■';
    const result = colorize(text, '#0e4429', 'ansi256');
    expect(result).toContain('\x1b[38;5;');
    expect(result).toContain('m■\x1b[0m');
  });
});
