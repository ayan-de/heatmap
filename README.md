# terminal-heatmap

A premium, highly customizable, and interactive GitHub-like contribution heatmap generator for your terminal.

Visualize activity, habits, tokens, or any daily metrics beautifully in standard shells with mouse hover coordinates, dynamic data keys, custom color themes, and emoji support.

---

## Features

- 🎨 **Harmonious Color Themes**: Sleek predefined palettes (`github-green`, `github-dark`, `github-light`, `halloween`, `flame`, `ocean`, `cool`, `purple`, etc.).
- 🕹️ **Interactive Hover TUI (`--interactive`)**: Turn the static text output into an alternate screen buffer console where moving your mouse over cell boxes displays live date and count info.
- 📦 **Cell Style Presets**: Choose between `classic` (`■`), `double-block` (`██`), or plant-growth `emoji` presets (`⚪🌱🌿🌳🌴`).
- 🎭 **Custom Emojis**: Supply your own 4-emoji or 5-emoji array to represent intensity levels.
- 🔍 **Dynamic Key Auto-Detection**: Supports any daily data out of the box (e.g. tracks `"TokenCount"`, `"commitCount"`, or `"count"` automatically based on your JSON format).
- 📱 **Responsive Rendering**: Dynamic column trimming that automatically fits the heatmap perfectly into your terminal width.

---

## Installation

Install globally via npm to use the CLI tool anywhere:
```bash
npm install -g @thisisayande/terminal-heatmap
```

Or install locally in your project for programmatic API usage:
```bash
npm install @thisisayande/terminal-heatmap
```

---

## CLI Usage

The CLI requires daily contribution counts stored in a JSON file.

### Input JSON Format
The input JSON must be an array of objects containing a `"date"` (YYYY-MM-DD) and a numerical count/value field (e.g. `"count"`, `"TokenCount"`, etc.):
```json
[
  { "date": "2026-06-01", "count": 2 },
  { "date": "2026-06-02", "count": 12 },
  { "date": "2026-06-03", "TokenCount": 350 }
]
```

### Basic Commands
```bash
# Render a basic static heatmap
terminal-heatmap --json data.json

# Read JSON directly from stdin
cat data.json | terminal-heatmap --json -
```

### Interactive Hover Mode
Launch a premium console where mouse movement reveals coordinates, date, and counts:
```bash
terminal-heatmap --json data.json --interactive
```
*Press `q`, `Esc`, or `Ctrl+C` to cleanly exit and restore your terminal screen.*

### Preset Styles & Custom Emojis
```bash
# Double solid block style
terminal-heatmap --json data.json --preset double-block

# Plant growth emoji style
terminal-heatmap --json data.json --preset emoji

# Custom 4-emoji list (level 0 defaults to ⚪)
terminal-heatmap --json data.json --emojis "🔴,🟡,🔵,🟢"

# Custom 5-emoji list (level 0 custom emoji)
terminal-heatmap --json data.json --emojis "❌,🔴,🟡,🔵,🟢"
```

### Options List

| Option | Shorthand | Description | Default |
| :--- | :---: | :--- | :--- |
| `--json <file>` | | **Required**. Load JSON data (or `-` for stdin) | |
| `--interactive` | `-i` | Enable mouse-hover TUI mode | `false` |
| `--preset <style>`| | Select cell preset: `classic`, `double-block`, `emoji` | `classic` |
| `--emojis <list>` | | Comma-separated list of 4 or 5 emojis | |
| `--theme <name>` | | Theme: `github-green`, `github-dark`, `github-light`, `halloween`, `flame`, `ocean`, `cool`, `purple`, `mono` | `github-green` |
| `--char <char>` | | Explicitly override the cell character symbol | `■` |
| `--title <text>` | | Add a title above the heatmap | `Contribution Heatmap`|
| `--start <date>` | | Start date (YYYY-MM-DD) | `1 year ago` |
| `--end <date>` | | End date (YYYY-MM-DD) | `today` |
| `--monday` | | Start weeks on Monday instead of Sunday | `false` |
| `--all-days` | | Print labels for all days of the week | `Mon/Wed/Fri` |
| `--no-legend` | | Hide the intensity color legend | `false` |
| `--no-month` | | Hide month headers | `false` |
| `--no-day` | | Hide weekday labels | `false` |

---

## Programmatic API Usage

You can import and integrate the heatmap engine directly in Node.js/TypeScript code.

### 1. Render a Static Heatmap String
```javascript
import { renderHeatmap } from '@thisisayande/terminal-heatmap';

const data = [
  { date: '2026-06-01', count: 3 },
  { date: '2026-06-02', count: 15 }
];

const heatmapString = renderHeatmap(data, {
  theme: 'ocean',
  title: 'My Project Metrics',
  preset: 'double-block',
  startDate: '2026-05-01',
  endDate: '2026-06-15'
});

console.log(heatmapString);
```

### 2. Run the Interactive Hover Mode
```javascript
import { startInteractiveHeatmap } from '@thisisayande/terminal-heatmap';

const data = [
  { date: '2026-06-01', TokenCount: 50 },
  { date: '2026-06-02', TokenCount: 200 }
];

// This enters the TUI alternate buffer and listens to mouse hover movements
startInteractiveHeatmap(data, {
  theme: 'cool',
  title: 'Habit Tracker',
  emojis: ['🔴', '🟡', '🔵', '🟢'] // Custom 4-emoji intensity
});
```

---

## Development

If you'd like to work on this package locally:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Build code:
   ```bash
   npm run build
   ```
3. Run the test suite:
   ```bash
   npm run test
   ```

---

## License

MIT © [ayande](https://github.com/thisisayande)
