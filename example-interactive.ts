import { startInteractiveHeatmap } from './src/index.js';

// 1. Generate some mock activity data
// Notice we are using a custom key "TokenCount" instead of "count"
// The package will dynamically auto-detect and display it!
const mockData = [
  { date: '2026-06-01', TokenCount: 50 },
  { date: '2026-06-02', TokenCount: 150 },
  { date: '2026-06-03', TokenCount: 300 },
  { date: '2026-06-04', TokenCount: 0 },
  { date: '2026-06-05', TokenCount: 450 },
  { date: '2026-06-06', TokenCount: 600 },
];

console.log('--- Launching Interactive Hover TUI Example ---');
console.log('Move your mouse over the cell squares to see details.');
console.log('Press "q", "Esc", or "Ctrl+C" to exit.');

// 2. Launch the interactive hover TUI mode
startInteractiveHeatmap(mockData, {
  startDate: '2026-05-15',
  endDate: '2026-06-15',
  title: '🌱 Custom Emoji Daily Metrics',
  emojis: ['🔴', '🟡', '🔵', '🟢'], // Custom 4-emoji intensity (level 0 defaults to ⚪)
});
