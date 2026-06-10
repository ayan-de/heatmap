interface ContributionData {
    date: Date | string;
    count: number;
}
type ContributionMap = Record<string, number>;
interface ThemeColors {
    /** Array of exactly 5 colors: index 0 (empty) to 4 (highest intensity) */
    colors: string[];
}
type ThemeName = 'github-green' | 'github-dark' | 'github-light' | 'halloween' | 'flame' | 'ocean' | 'purple' | 'cool' | 'mono';
interface HeatmapOptions {
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

/**
 * Renders a contribution heatmap in the terminal.
 *
 * @param data Array of contributions containing dates and counts
 * @param options Styling and layout configurations
 */
declare function renderHeatmap(data: ContributionData[], options?: HeatmapOptions): string;

interface GitContributionsOptions {
    /** Filter commits by author name or email (regex allowed) */
    author?: string;
    /** Filter commits since a date/time (e.g. '1 year ago' or '2023-01-01') */
    since?: string;
    /** Filter commits until a date/time (e.g. '2024-01-01') */
    until?: string;
    /** Current working directory to execute the Git command in */
    cwd?: string;
}
/**
 * Checks if the specified directory is inside a Git repository.
 */
declare function isGitRepository(cwd?: string): boolean;
/**
 * Executes a Git command to collect the number of commits per day.
 *
 * @param options Query filters for author, date range, and directory
 * @returns Array of daily contribution structures
 */
declare function getGitContributions(options?: GitContributionsOptions): ContributionData[];

declare const THEMES: Record<ThemeName, ThemeColors>;
/**
 * Colorizes a string using ANSI escape codes based on the requested mode.
 */
declare function colorize(text: string, hexColor: string, mode?: 'truecolor' | 'ansi256' | 'ansi'): string;

export { type ContributionData, type ContributionMap, type GitContributionsOptions, type HeatmapOptions, THEMES, type ThemeColors, type ThemeName, colorize, getGitContributions, isGitRepository, renderHeatmap };
