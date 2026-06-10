#!/usr/bin/env node

import { readFileSync } from 'fs';
import { Command } from 'commander';
import { renderHeatmap } from './renderer.js';
import { startInteractiveHeatmap } from './interactive.js';
import { ThemeName } from './types.js';

function readFromStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', err => {
      reject(err);
    });
  });
}

async function run() {
  const program = new Command();

  program
    .name('terminal-heatmap')
    .description('Visualize activity and contributions as a beautiful GitHub-like heatmap in your terminal.')
    .option('--theme <name|colors>', 'Theme name or comma-separated list of 5 hex colors', 'github-green')
    .option('--char <char>', 'Symbol to use for each cell')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .option('--title <text>', 'Add a title above the heatmap')
    .option('--monday', 'Start week on Monday instead of Sunday')
    .option('--no-legend', 'Hide the intensity legend')
    .option('--no-month', 'Hide month labels')
    .option('--no-day', 'Hide day labels')
    .option('--all-days', 'Show labels for all days of the week (defaults to Mon/Wed/Fri only)')
    .option('-i, --interactive', 'Interactive mode with mouse hover support')
    .option('--preset <preset>', 'Cell preset style: classic, double-block, emoji')
    .option('--emojis <list>', 'Custom comma-separated list of 4 or 5 emojis (e.g. "⚪,🌱,🌿,🌳,🌴" or "🌱,🌿,🌳,🌴")')
    .requiredOption('--json <file>', 'Load contribution data from a JSON file (format: [{"date":"YYYY-MM-DD","count":number}]) — pass "-" to read from stdin');

  const opts = program.parse(process.argv).opts();

  let contributions: any[] = [];

  try {
    let content = '';
    if (opts.json === '-') {
      content = await readFromStdin();
    } else {
      content = readFileSync(opts.json, 'utf-8');
    }
    contributions = JSON.parse(content);

    let renderStart: Date | undefined = undefined;
    let renderEnd: Date | undefined = undefined;

    if (opts.start) {
      const parsed = new Date(opts.start);
      if (!isNaN(parsed.getTime())) {
        renderStart = parsed;
      }
    }
    if (opts.end) {
      const parsed = new Date(opts.end);
      if (!isNaN(parsed.getTime())) {
        renderEnd = parsed;
      }
    }

    let customEmojis: string[] | undefined = undefined;
    if (opts.emojis) {
      customEmojis = opts.emojis.split(',').map((s: string) => s.trim());
    }

    const heatmapOptions = {
      startDate: renderStart,
      endDate: renderEnd,
      theme: opts.theme as ThemeName,
      character: opts.char,
      legend: opts.legend,
      monthLabels: opts.month,
      dayLabels: opts.day,
      allDayLabels: opts.allDays,
      title: opts.title ?? 'Contribution Heatmap',
      startDayOfWeek: (opts.monday ? 1 : 0) as 0 | 1,
      preset: opts.preset,
      emojis: customEmojis,
    };

    if (opts.interactive) {
      await startInteractiveHeatmap(contributions, heatmapOptions);
    } else {
      const output = renderHeatmap(contributions, heatmapOptions);
      console.log('\n' + output + '\n');
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

run();