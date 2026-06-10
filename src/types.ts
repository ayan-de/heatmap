export interface ContributionData {
  date: Date | string;
  count: number;
}

export type ContributionMap = Record<string, number>;

export interface ThemeColors {
  /** Array of exactly 5 colors: index 0 (empty) to 4 (highest intensity) */
  colors: string[];
}

export type ThemeName =
  | 'github-green'
  | 'github-dark'
  | 'github-light'
  | 'halloween'
  | 'flame'
  | 'ocean'
  | 'purple'
  | 'cool'
  | 'mono';

export interface HeatmapOptions {
  /** The starting date of the heatmap grid (defaults to 1 year ago today) */
  startDate?: Date | string;
  
  /** The ending date of the heatmap grid (defaults to today) */
  endDate?: Date | string;
  
  /** 
   * Predefined theme name ('github-green', 'github-dark', 'flame', etc.) 
   * or a custom ThemeColors object 
   */
  theme?: ThemeName | ThemeColors;
  
  /** 
   * Character symbol to render in the grid cells. 
   * e.g., '■', '●', ' ', '♥'. Defaults to '■'. 
   */
  character?: string;
  
  /** Whether to render the color legend at the bottom (defaults to true) */
  legend?: boolean;
  
  /** Whether to show month labels at the top (defaults to true) */
  monthLabels?: boolean;
  
  /** Whether to show day of the week labels on the left (defaults to true) */
  dayLabels?: boolean;

  /** Whether to show labels for all days of the week, not just Mon/Wed/Fri (defaults to false) */
  allDayLabels?: boolean;
  
  /** 
   * Color resolution mode:
   * - 'truecolor' (24-bit RGB, recommended for modern terminals)
   * - 'ansi256' (8-bit terminal colors)
   * - 'ansi' (basic 16 colors)
   * Defaults to auto-detect.
   */
  colorMode?: 'truecolor' | 'ansi256' | 'ansi';
  
  /** Optional title printed above the heatmap */
  title?: string;
  
  /** Start day of week: 0 for Sunday, 1 for Monday. Defaults to 0. */
  startDayOfWeek?: 0 | 1;
}
