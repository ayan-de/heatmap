import { HeatmapOptions, ContributionData, ThemeColors, ContributionMap } from './types.js';
import { colorize, THEMES } from './color.js';

interface Cell {
  date: Date;
  dateStr: string;
  inRange: boolean;
  count: number;
  level: number; // -1 (out of range), 0 (none), 1-4 (intensity)
}

/**
 * Format a date object as a local YYYY-MM-DD string key.
 */
export function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Resolves the theme colors from user options.
 */
function resolveThemeColors(themeOpt?: HeatmapOptions['theme']): ThemeColors {
  if (!themeOpt) {
    return THEMES['github-green'];
  }
  if (typeof themeOpt === 'string') {
    return THEMES[themeOpt] || THEMES['github-green'];
  }
  if (themeOpt && Array.isArray(themeOpt.colors) && themeOpt.colors.length === 5) {
    return themeOpt;
  }
  return THEMES['github-green'];
}

/**
 * Renders a contribution heatmap in the terminal.
 * 
 * @param data Array of contributions containing dates and counts
 * @param options Styling and layout configurations
 */
export function renderHeatmap(data: ContributionData[], options: HeatmapOptions = {}): string {
  const character = options.character || '■';
  const showLegend = options.legend !== false;
  const showMonthLabels = options.monthLabels !== false;
  const showDayLabels = options.dayLabels !== false;
  const startDayOfWeek = options.startDayOfWeek ?? 0; // 0 = Sunday, 1 = Monday
  const themeColors = resolveThemeColors(options.theme);
  const colorMode = options.colorMode;

  // 1. Build a lookup map of contribution counts
  const contributionMap: ContributionMap = {};
  for (const item of data) {
    if (!item.date) continue;
    const d = typeof item.date === 'string' ? new Date(item.date) : item.date;
    if (isNaN(d.getTime())) continue;
    const dateStr = formatDateKey(d);
    contributionMap[dateStr] = (contributionMap[dateStr] || 0) + item.count;
  }

  // 2. Resolve start/end dates
  const end = options.endDate ? new Date(options.endDate) : new Date();
  end.setHours(12, 0, 0, 0); // Noon to prevent DST issues

  let start: Date;
  if (options.startDate) {
    start = new Date(options.startDate);
    start.setHours(12, 0, 0, 0);
  } else {
    start = new Date(end);
    start.setDate(end.getDate() - 364); // Default to 52 weeks (365 days)
    start.setHours(12, 0, 0, 0);
  }

  // 3. Align start/end dates to construct a full rectangular week grid
  const startWeekday = start.getDay();
  const startDayOfWeekIndex = (startWeekday - startDayOfWeek + 7) % 7;

  const gridStartDate = new Date(start);
  gridStartDate.setDate(start.getDate() - startDayOfWeekIndex);

  const endWeekday = end.getDay();
  const endDayOfWeekIndex = (endWeekday - startDayOfWeek + 7) % 7;
  const endOffset = 6 - endDayOfWeekIndex;

  const gridEndDate = new Date(end);
  gridEndDate.setDate(end.getDate() + endOffset);

  // 4. Construct flat cells and columns
  const columns: Cell[][] = [];
  let currentColumn: Cell[] = [];
  
  const cur = new Date(gridStartDate);
  while (cur <= gridEndDate) {
    const dateStr = formatDateKey(cur);
    const count = contributionMap[dateStr] || 0;
    const inRange = cur >= start && cur <= end;
    
    currentColumn.push({
      date: new Date(cur),
      dateStr,
      inRange,
      count,
      level: 0,
    });
    
    if (currentColumn.length === 7) {
      columns.push(currentColumn);
      currentColumn = [];
    }
    
    cur.setDate(cur.getDate() + 1);
  }

  // Handle any leftover days
  if (currentColumn.length > 0) {
    while (currentColumn.length < 7) {
      currentColumn.push({
        date: new Date(cur),
        dateStr: formatDateKey(cur),
        inRange: false,
        count: 0,
        level: -1,
      });
      cur.setDate(cur.getDate() + 1);
    }
    columns.push(currentColumn);
  }

  // 5. Calculate quantile thresholds dynamically for contribution levels
  const flatCells = columns.flat();
  const activeCounts = flatCells
    .filter(c => c.inRange && c.count > 0)
    .map(c => c.count)
    .sort((a, b) => a - b);

  let q25 = 1;
  let q50 = 2;
  let q75 = 3;

  if (activeCounts.length > 0) {
    q25 = activeCounts[Math.floor(activeCounts.length * 0.25)] || 1;
    q50 = activeCounts[Math.floor(activeCounts.length * 0.50)] || 2;
    q75 = activeCounts[Math.floor(activeCounts.length * 0.75)] || 3;
    
    if (q50 <= q25) q50 = q25 + 1;
    if (q75 <= q50) q75 = q50 + 1;
  }

  for (const cell of flatCells) {
    if (!cell.inRange) {
      cell.level = -1;
    } else if (cell.count === 0) {
      cell.level = 0;
    } else if (cell.count <= q25) {
      cell.level = 1;
    } else if (cell.count <= q50) {
      cell.level = 2;
    } else if (cell.count <= q75) {
      cell.level = 3;
    } else {
      cell.level = 4;
    }
  }

  // Responsive logic: slice older columns to fit terminal width
  let displayColumns = columns;
  const colWidth = character.length + 1; // Width of each cell + space
  const leftPaddingWidth = showDayLabels ? 4 : 0;
  const leftPaddingStr = ' '.repeat(leftPaddingWidth);

  if (typeof process !== 'undefined' && process.stdout && process.stdout.columns) {
    const termColumns = process.stdout.columns;
    const maxVisibleCols = Math.floor((termColumns - leftPaddingWidth - 2) / colWidth);
    if (maxVisibleCols > 0 && displayColumns.length > maxVisibleCols) {
      displayColumns = displayColumns.slice(displayColumns.length - maxVisibleCols);
    }
  }

  const lines: string[] = [];

  // Title rendering
  if (options.title) {
    lines.push(options.title);
    lines.push('');
  }

  // 6. Build month label row
  if (showMonthLabels) {
    const monthLineChars = Array(displayColumns.length * colWidth).fill(' ');
    let lastMonthPrintCol = -10;

    for (let c = 0; c < displayColumns.length; c++) {
      const cell = displayColumns[c][0];
      const monthStr = cell.date.toLocaleString('en-US', { month: 'short' });
      const prevCell = c > 0 ? displayColumns[c - 1][0] : null;
      const monthChanged = !prevCell || cell.date.getMonth() !== prevCell.date.getMonth();

      // Ensure spacing of at least 4 columns to avoid month overlapping
      if (monthChanged && (c - lastMonthPrintCol) >= 4) {
        const startPos = c * colWidth;
        for (let i = 0; i < monthStr.length; i++) {
          monthLineChars[startPos + i] = monthStr[i];
        }
        lastMonthPrintCol = c;
      }
    }
    lines.push(leftPaddingStr + monthLineChars.join('').trimEnd());
  }

  // 7. Render day rows
  for (let r = 0; r < 7; r++) {
    let rowStr = '';
    
    // Add weekday labels
    if (showDayLabels) {
      const showAllDayLabels = options.allDayLabels === true;
      if (showAllDayLabels || r === 1 || r === 3 || r === 5) {
        const weekday = (startDayOfWeek + r) % 7;
        const labelDate = new Date(2021, 0, 3 + weekday);
        const dayName = labelDate.toLocaleString('en-US', { weekday: 'short' }).substring(0, 3);
        rowStr += `${dayName} `;
      } else {
        rowStr += '    ';
      }
    }

    // Add cells
    for (let c = 0; c < displayColumns.length; c++) {
      const cell = displayColumns[c][r];
      if (cell.level === -1) {
        rowStr += ' '.repeat(colWidth);
      } else {
        const color = themeColors.colors[cell.level];
        rowStr += colorize(character, color, colorMode) + ' ';
      }
    }

    lines.push(rowStr.trimEnd());
  }

  // 8. Render Legend
  if (showLegend) {
    const legendLabel = 'Less ';
    const legendCells = [0, 1, 2, 3, 4]
      .map(lvl => colorize(character, themeColors.colors[lvl], colorMode))
      .join(' ');
    const legendText = `${legendLabel}${legendCells} More`;
    
    const totalGridWidth = displayColumns.length * colWidth;
    const rawLegendLen = legendLabel.length + (5 * character.length + 4) + 5;
    const padding = Math.max(0, totalGridWidth - rawLegendLen);
    
    lines.push('');
    lines.push(leftPaddingStr + ' '.repeat(padding) + legendText);
  }

  return lines.join('\n');
}
