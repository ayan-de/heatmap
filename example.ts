import { renderHeatmap } from './src/index.js';

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

console.log('--- Static Render Example: Double-Block Preset & Custom Purple Theme ---');

// 2. Render a static heatmap string
const staticHeatmap = renderHeatmap(mockData, {
  startDate: '2026-05-15',
  endDate: '2026-06-15',
  preset: 'double-block',
  theme: {
    // Custom purple/indigo intensity theme colors (from empty to max intensity)
    colors: ['#1e1b4b', '#3b0764', '#581c87', '#7e22ce', '#a855f7'],
  },
  title: '🚀 Token Consumption Tracker',
  legend: true,
});

console.log(staticHeatmap);

