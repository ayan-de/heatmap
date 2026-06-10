"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  THEMES: () => THEMES,
  colorize: () => colorize,
  getGitContributions: () => getGitContributions,
  isGitRepository: () => isGitRepository,
  renderHeatmap: () => renderHeatmap
});
module.exports = __toCommonJS(src_exports);

// src/color.ts
var THEMES = {
  "github-green": {
    colors: ["#2c3036", "#0e4429", "#006d32", "#26a641", "#39d353"]
  },
  "github-dark": {
    colors: ["#2c3036", "#0e4429", "#006d32", "#26a641", "#39d353"]
  },
  "github-light": {
    colors: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
  },
  halloween: {
    colors: ["#2c3036", "#630000", "#bd5604", "#fa7a18", "#fddf68"]
  },
  flame: {
    colors: ["#2c3036", "#800900", "#cc2900", "#ff6600", "#ffcc00"]
  },
  ocean: {
    colors: ["#2c3036", "#004466", "#007799", "#00aabb", "#00ddcc"]
  },
  purple: {
    colors: ["#2c3036", "#3b0066", "#6600cc", "#9933ff", "#cc99ff"]
  },
  cool: {
    colors: ["#2c3036", "#312e81", "#4f46e5", "#818cf8", "#a5b4fc"]
  },
  mono: {
    colors: ["#2c3036", "#333333", "#666666", "#999999", "#cccccc"]
  }
};
var ANSI16_RGBS = [
  { code: 30, r: 0, g: 0, b: 0 },
  // black
  { code: 31, r: 128, g: 0, b: 0 },
  // red
  { code: 32, r: 0, g: 128, b: 0 },
  // green
  { code: 33, r: 128, g: 128, b: 0 },
  // yellow
  { code: 34, r: 0, g: 0, b: 128 },
  // blue
  { code: 35, r: 128, g: 0, b: 128 },
  // magenta
  { code: 36, r: 0, g: 128, b: 128 },
  // cyan
  { code: 37, r: 192, g: 192, b: 192 },
  // white
  { code: 90, r: 128, g: 128, b: 128 },
  // bright black (gray)
  { code: 91, r: 255, g: 0, b: 0 },
  // bright red
  { code: 92, r: 0, g: 255, b: 0 },
  // bright green
  { code: 93, r: 255, g: 255, b: 0 },
  // bright yellow
  { code: 94, r: 0, g: 0, b: 255 },
  // bright blue
  { code: 95, r: 255, g: 0, b: 255 },
  // bright magenta
  { code: 96, r: 0, g: 255, b: 255 },
  // bright cyan
  { code: 97, r: 255, g: 255, b: 255 }
  // bright white
];
function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, "");
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
function rgbToAnsi256(r, g, b) {
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round((r - 8) / 247 * 23) + 232;
  }
  const rStep = Math.round(r / 255 * 5);
  const gStep = Math.round(g / 255 * 5);
  const bStep = Math.round(b / 255 * 5);
  return 16 + 36 * rStep + 6 * gStep + bStep;
}
function rgbToAnsi16(r, g, b) {
  let minDistance = Infinity;
  let bestCode = 37;
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
function detectColorMode() {
  if (typeof process === "undefined" || !process.env) {
    return "ansi";
  }
  const { env } = process;
  if (env.COLORTERM === "truecolor" || env.COLORTERM === "24bit") {
    return "truecolor";
  }
  if (env.TERM && (env.TERM.includes("256color") || env.TERM.includes("256"))) {
    return "ansi256";
  }
  return "ansi";
}
function colorize(text, hexColor, mode) {
  const actualMode = mode || detectColorMode();
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return text;
  }
  if (actualMode === "truecolor") {
    return `\x1B[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1B[0m`;
  } else if (actualMode === "ansi256") {
    const ansiCode = rgbToAnsi256(rgb.r, rgb.g, rgb.b);
    return `\x1B[38;5;${ansiCode}m${text}\x1B[0m`;
  } else {
    const ansiCode = rgbToAnsi16(rgb.r, rgb.g, rgb.b);
    return `\x1B[${ansiCode}m${text}\x1B[0m`;
  }
}

// src/renderer.ts
function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function resolveThemeColors(themeOpt) {
  if (!themeOpt) {
    return THEMES["github-green"];
  }
  if (typeof themeOpt === "string") {
    return THEMES[themeOpt] || THEMES["github-green"];
  }
  if (themeOpt && Array.isArray(themeOpt.colors) && themeOpt.colors.length === 5) {
    return themeOpt;
  }
  return THEMES["github-green"];
}
function renderHeatmap(data, options = {}) {
  const character = options.character || "\u25A0";
  const showLegend = options.legend !== false;
  const showMonthLabels = options.monthLabels !== false;
  const showDayLabels = options.dayLabels !== false;
  const startDayOfWeek = options.startDayOfWeek ?? 0;
  const themeColors = resolveThemeColors(options.theme);
  const colorMode = options.colorMode;
  const contributionMap = {};
  for (const item of data) {
    if (!item.date) continue;
    const d = typeof item.date === "string" ? new Date(item.date) : item.date;
    if (isNaN(d.getTime())) continue;
    const dateStr = formatDateKey(d);
    contributionMap[dateStr] = (contributionMap[dateStr] || 0) + item.count;
  }
  const end = options.endDate ? new Date(options.endDate) : /* @__PURE__ */ new Date();
  end.setHours(12, 0, 0, 0);
  let start;
  if (options.startDate) {
    start = new Date(options.startDate);
    start.setHours(12, 0, 0, 0);
  } else {
    start = new Date(end);
    start.setDate(end.getDate() - 364);
    start.setHours(12, 0, 0, 0);
  }
  const startWeekday = start.getDay();
  const startDayOfWeekIndex = (startWeekday - startDayOfWeek + 7) % 7;
  const gridStartDate = new Date(start);
  gridStartDate.setDate(start.getDate() - startDayOfWeekIndex);
  const endWeekday = end.getDay();
  const endDayOfWeekIndex = (endWeekday - startDayOfWeek + 7) % 7;
  const endOffset = 6 - endDayOfWeekIndex;
  const gridEndDate = new Date(end);
  gridEndDate.setDate(end.getDate() + endOffset);
  const columns = [];
  let currentColumn = [];
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
      level: 0
    });
    if (currentColumn.length === 7) {
      columns.push(currentColumn);
      currentColumn = [];
    }
    cur.setDate(cur.getDate() + 1);
  }
  if (currentColumn.length > 0) {
    while (currentColumn.length < 7) {
      currentColumn.push({
        date: new Date(cur),
        dateStr: formatDateKey(cur),
        inRange: false,
        count: 0,
        level: -1
      });
      cur.setDate(cur.getDate() + 1);
    }
    columns.push(currentColumn);
  }
  const flatCells = columns.flat();
  const activeCounts = flatCells.filter((c) => c.inRange && c.count > 0).map((c) => c.count).sort((a, b) => a - b);
  let q25 = 1;
  let q50 = 2;
  let q75 = 3;
  if (activeCounts.length > 0) {
    q25 = activeCounts[Math.floor(activeCounts.length * 0.25)] || 1;
    q50 = activeCounts[Math.floor(activeCounts.length * 0.5)] || 2;
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
  let displayColumns = columns;
  const colWidth = character.length + 1;
  const leftPaddingWidth = showDayLabels ? 4 : 0;
  const leftPaddingStr = " ".repeat(leftPaddingWidth);
  if (typeof process !== "undefined" && process.stdout && process.stdout.columns) {
    const termColumns = process.stdout.columns;
    const maxVisibleCols = Math.floor((termColumns - leftPaddingWidth - 2) / colWidth);
    if (maxVisibleCols > 0 && displayColumns.length > maxVisibleCols) {
      displayColumns = displayColumns.slice(displayColumns.length - maxVisibleCols);
    }
  }
  const lines = [];
  if (options.title) {
    lines.push(options.title);
    lines.push("");
  }
  if (showMonthLabels) {
    const monthLineChars = Array(displayColumns.length * colWidth).fill(" ");
    let lastMonthPrintCol = -10;
    for (let c = 0; c < displayColumns.length; c++) {
      const cell = displayColumns[c][0];
      const monthStr = cell.date.toLocaleString("en-US", { month: "short" });
      const prevCell = c > 0 ? displayColumns[c - 1][0] : null;
      const monthChanged = !prevCell || cell.date.getMonth() !== prevCell.date.getMonth();
      if (monthChanged && c - lastMonthPrintCol >= 4) {
        const startPos = c * colWidth;
        for (let i = 0; i < monthStr.length; i++) {
          monthLineChars[startPos + i] = monthStr[i];
        }
        lastMonthPrintCol = c;
      }
    }
    lines.push(leftPaddingStr + monthLineChars.join("").trimEnd());
  }
  for (let r = 0; r < 7; r++) {
    let rowStr = "";
    if (showDayLabels) {
      const showAllDayLabels = options.allDayLabels === true;
      if (showAllDayLabels || r === 1 || r === 3 || r === 5) {
        const weekday = (startDayOfWeek + r) % 7;
        const labelDate = new Date(2021, 0, 3 + weekday);
        const dayName = labelDate.toLocaleString("en-US", { weekday: "short" }).substring(0, 3);
        rowStr += `${dayName} `;
      } else {
        rowStr += "    ";
      }
    }
    for (let c = 0; c < displayColumns.length; c++) {
      const cell = displayColumns[c][r];
      if (cell.level === -1) {
        rowStr += " ".repeat(colWidth);
      } else {
        const color = themeColors.colors[cell.level];
        rowStr += colorize(character, color, colorMode) + " ";
      }
    }
    lines.push(rowStr.trimEnd());
  }
  if (showLegend) {
    const legendLabel = "Less ";
    const legendCells = [0, 1, 2, 3, 4].map((lvl) => colorize(character, themeColors.colors[lvl], colorMode)).join(" ");
    const legendText = `${legendLabel}${legendCells} More`;
    const totalGridWidth = displayColumns.length * colWidth;
    const rawLegendLen = legendLabel.length + (5 * character.length + 4) + 5;
    const padding = Math.max(0, totalGridWidth - rawLegendLen);
    lines.push("");
    lines.push(leftPaddingStr + " ".repeat(padding) + legendText);
  }
  return lines.join("\n");
}

// src/git.ts
var import_child_process = require("child_process");
function isGitRepository(cwd = process.cwd()) {
  try {
    (0, import_child_process.execSync)("git rev-parse --is-inside-work-tree", { cwd, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function getGitContributions(options = {}) {
  const cwd = options.cwd || process.cwd();
  if (!isGitRepository(cwd)) {
    throw new Error("Directory is not a Git repository (or Git is not installed).");
  }
  const args = ["log", "--date=short", "--pretty=format:%ad"];
  if (options.author) {
    const escapedAuthor = options.author.replace(/"/g, '\\"');
    args.push(`--author="${escapedAuthor}"`);
  }
  if (options.since) {
    const escapedSince = options.since.replace(/"/g, '\\"');
    args.push(`--since="${escapedSince}"`);
  }
  if (options.until) {
    const escapedUntil = options.until.replace(/"/g, '\\"');
    args.push(`--until="${escapedUntil}"`);
  }
  const cmd = `git ${args.join(" ")}`;
  try {
    const output = (0, import_child_process.execSync)(cmd, { cwd, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
    const lines = output.split("\n").map((l) => l.trim()).filter(Boolean);
    const counts = {};
    for (const dateStr of lines) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([date, count]) => ({
      date,
      count
    }));
  } catch (error) {
    throw new Error(`Failed to retrieve git contributions: ${error.message}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  THEMES,
  colorize,
  getGitContributions,
  isGitRepository,
  renderHeatmap
});
//# sourceMappingURL=index.cjs.map