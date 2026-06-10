import { ThemeColors, ThemeName } from './types.js';

export const THEMES: Record<ThemeName, ThemeColors> = {
  'github-green': {
    colors: ['#2c3036', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
  'github-dark': {
    colors: ['#2c3036', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
  'github-light': {
    colors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  },
  halloween: {
    colors: ['#2c3036', '#630000', '#bd5604', '#fa7a18', '#fddf68'],
  },
  flame: {
    colors: ['#2c3036', '#800900', '#cc2900', '#ff6600', '#ffcc00'],
  },
  ocean: {
    colors: ['#2c3036', '#004466', '#007799', '#00aabb', '#00ddcc'],
  },
  purple: {
    colors: ['#2c3036', '#3b0066', '#6600cc', '#9933ff', '#cc99ff'],
  },
  cool: {
    colors: ['#2c3036', '#312e81', '#4f46e5', '#818cf8', '#a5b4fc'],
  },
  mono: {
    colors: ['#2c3036', '#333333', '#666666', '#999999', '#cccccc'],
  },
};

const ANSI16_RGBS = [
  { code: 30, r: 0, g: 0, b: 0 },       // black
  { code: 31, r: 128, g: 0, b: 0 },     // red
  { code: 32, r: 0, g: 128, b: 0 },     // green
  { code: 33, r: 128, g: 128, b: 0 },   // yellow
  { code: 34, r: 0, g: 0, b: 128 },     // blue
  { code: 35, r: 128, g: 0, b: 128 },   // magenta
  { code: 36, r: 0, g: 128, b: 128 },   // cyan
  { code: 37, r: 192, g: 192, b: 192 }, // white
  { code: 90, r: 128, g: 128, b: 128 }, // bright black (gray)
  { code: 91, r: 255, g: 0, b: 0 },     // bright red
  { code: 92, r: 0, g: 255, b: 0 },     // bright green
  { code: 93, r: 255, g: 255, b: 0 },   // bright yellow
  { code: 94, r: 0, g: 0, b: 255 },     // bright blue
  { code: 95, r: 255, g: 0, b: 255 },   // bright magenta
  { code: 96, r: 0, g: 255, b: 255 },   // bright cyan
  { code: 97, r: 255, g: 255, b: 255 }, // bright white
];

/**
 * Parses hex color (e.g. '#216e39' or '216e39' or '#abc') to RGB values.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

/**
 * Maps RGB to the closest 256-color ANSI code.
 */
export function rgbToAnsi256(r: number, g: number, b: number): number {
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 23) + 232;
  }
  const rStep = Math.round((r / 255) * 5);
  const gStep = Math.round((g / 255) * 5);
  const bStep = Math.round((b / 255) * 5);
  return 16 + 36 * rStep + 6 * gStep + bStep;
}

/**
 * Maps RGB to the closest basic 16-color ANSI code.
 */
export function rgbToAnsi16(r: number, g: number, b: number): number {
  let minDistance = Infinity;
  let bestCode = 37; // Default white
  for (const ansi of ANSI16_RGBS) {
    const distance = Math.sqrt(
      Math.pow(r - ansi.r, 2) + Math.pow(g - ansi.g, 2) + Math.pow(b - ansi.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      bestCode = ansi.code;
    }
  }
  return bestCode;
}

/**
 * Detects terminal color support capability.
 */
export function detectColorMode(): 'truecolor' | 'ansi256' | 'ansi' {
  if (typeof process === 'undefined' || !process.env) {
    return 'ansi';
  }
  const { env } = process;
  if (env.COLORTERM === 'truecolor' || env.COLORTERM === '24bit') {
    return 'truecolor';
  }
  if (env.TERM && (env.TERM.includes('256color') || env.TERM.includes('256'))) {
    return 'ansi256';
  }
  return 'ansi';
}

/**
 * Colorizes a string using ANSI escape codes based on the requested mode.
 */
export function colorize(
  text: string,
  hexColor: string,
  mode?: 'truecolor' | 'ansi256' | 'ansi'
): string {
  const actualMode = mode || detectColorMode();
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return text; // Fallback if invalid hex
  }

  if (actualMode === 'truecolor') {
    return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`;
  } else if (actualMode === 'ansi256') {
    const ansiCode = rgbToAnsi256(rgb.r, rgb.g, rgb.b);
    return `\x1b[38;5;${ansiCode}m${text}\x1b[0m`;
  } else {
    const ansiCode = rgbToAnsi16(rgb.r, rgb.g, rgb.b);
    return `\x1b[${ansiCode}m${text}\x1b[0m`;
  }
}
