import { ContributionData, HeatmapOptions } from './types.js';
import { computeHeatmapGrid, renderHeatmap } from './renderer.js';
import { colorize } from './color.js';

export function startInteractiveHeatmap(data: ContributionData[], options: HeatmapOptions = {}) {
  const char = options.character || '■';
  const showDayLabels = options.dayLabels !== false;
  const colWidth = char.length + 1;
  const leftPaddingWidth = showDayLabels ? 4 : 0;

  let grid = computeHeatmapGrid(data, options);
  let displayColumns = grid.displayColumns;
  let themeColors = grid.themeColors;

  const heatmapStr = renderHeatmap(data, options);
  const linesCount = heatmapStr.split('\n').length;
  let statusRow = linesCount + 3;

  // Enter alternate screen, hide cursor, enable mouse tracking (motion + SGR coordinates)
  process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[?1003h\x1b[?1006h');
  
  // Render initial screen
  process.stdout.write('\x1b[H\x1b[2J' + heatmapStr + '\n');
  process.stdout.write(`\x1b[${statusRow};1H\x1b[K\x1b[90m💡 Move mouse over squares to see details | Press 'q', Esc, or Ctrl+C to exit\x1b[0m`);

  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  let stdinBuffer = '';

  function cleanup() {
    process.stdout.off('resize', onResize);
    process.stdout.write('\x1b[?1003l\x1b[?1006l\x1b[?25h\x1b[?1049l');
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  }

  function onResize() {
    grid = computeHeatmapGrid(data, options);
    displayColumns = grid.displayColumns;
    themeColors = grid.themeColors;

    const currentHeatmapStr = renderHeatmap(data, options);
    const currentLinesCount = currentHeatmapStr.split('\n').length;
    statusRow = currentLinesCount + 3;

    process.stdout.write('\x1b[H\x1b[2J' + currentHeatmapStr + '\n');
    process.stdout.write(`\x1b[${statusRow};1H\x1b[K\x1b[90m💡 Move mouse over squares to see details | Press 'q', Esc, or Ctrl+C to exit\x1b[0m`);
  }

  process.stdout.on('resize', onResize);

  function handleHover(x: number, y: number) {
    // Determine the start row of the day rows
    let startRow = 1;
    if (options.title) {
      startRow += 2;
    }
    if (options.monthLabels !== false) {
      startRow += 1;
    }

    const r = y - startRow;
    const relativeX = x - leftPaddingWidth - 1;
    const c = Math.floor(relativeX / colWidth);
    const remainder = relativeX % colWidth;
    const insideCell = remainder >= 0 && remainder < char.length;

    let hoveredCell = null;
    if (r >= 0 && r < 7 && insideCell && c >= 0 && c < displayColumns.length) {
      const cell = displayColumns[c][r];
      if (cell && cell.level !== -1) {
        hoveredCell = cell;
      }
    }

    if (hoveredCell) {
      const d = hoveredCell.date;
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      const formattedDate = d.toLocaleDateString('en-US', optionsDate);
      const countText = `${grid.countKey}: ${hoveredCell.count}`;
      const cellColor = themeColors.colors[hoveredCell.level];
      const coloredSquare = colorize(char, cellColor, options.colorMode);

      const infoStr = `\x1b[32m📅 ${formattedDate}\x1b[0m  |  ${coloredSquare} \x1b[1m${countText}\x1b[0m`;
      process.stdout.write(`\x1b[${statusRow};1H\x1b[K${infoStr}`);
    } else {
      process.stdout.write(`\x1b[${statusRow};1H\x1b[K\x1b[90m💡 Move mouse over squares to see details | Press 'q', Esc, or Ctrl+C to exit\x1b[0m`);
    }
  }

  process.stdin.on('data', (chunk) => {
    const str = chunk.toString();

    // Check for exit keys: Ctrl+C (charCode 3), standalone Escape (charCode 27), 'q', 'Q'
    if (str === '\x1b' || str === 'q' || str === 'Q' || str.includes('\x03')) {
      cleanup();
      process.exit(0);
    }

    stdinBuffer += str;
    const mouseRegex = /\x1b\[<(\d+);(\d+);(\d+)([Mm])/g;
    let match;
    let lastMouse = null;

    while ((match = mouseRegex.exec(stdinBuffer)) !== null) {
      const x = parseInt(match[2]);
      const y = parseInt(match[3]);
      lastMouse = { x, y };
    }

    // Clean up parsed sequences from the buffer
    stdinBuffer = stdinBuffer.replace(/\x1b\[<(\d+);(\d+);(\d+)[Mm]/g, '');

    // Keep buffer bounded
    if (stdinBuffer.length > 1000) {
      stdinBuffer = '';
    }

    if (lastMouse) {
      handleHover(lastMouse.x, lastMouse.y);
    }
  });
}
