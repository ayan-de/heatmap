#!/usr/bin/env node

import { readFileSync } from 'fs';
import { basename } from 'path';
import { execSync } from 'child_process';
import { Command } from 'commander';
import { renderHeatmap } from './renderer.js';
import { getGitContributions, isGitRepository } from './git.js';
import { ThemeName } from './types.js';

function getGitRepoName(): string {
  try {
    const topLevel = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return basename(topLevel);
  } catch {
    return basename(process.cwd());
  }
}

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
    .option('--theme <name>', 'Theme to use', 'github-green')
    .option('--char <char>', 'Symbol to use for each cell', '■')
    .option('--start <date>', 'Start date (YYYY-MM-DD or standard Git date formats like \'1 year ago\')')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .option('--author <name>', 'Filter Git commits by author name/email (Git mode only)')
    .option('--title <text>', 'Add a title above the heatmap')
    .option('--monday', 'Start week on Monday instead of Sunday')
    .option('--no-legend', 'Hide the intensity legend')
    .option('--no-month', 'Hide month labels')
    .option('--no-day', 'Hide day labels')
    .option('--all-days', 'Show labels for all days of the week (defaults to Mon/Wed/Fri only)')
    .option('--json <file>', 'Load contribution data from a JSON file (format: [{"date":"YYYY-MM-DD","count":number}])');

  const opts = program.parse(process.argv).opts();

  let contributions: any[] = [];
  let defaultTitle = '';

  try {
    if (opts.json) {
      let content = '';
      if (opts.json === '-') {
        content = await readFromStdin();
      } else {
        content = readFileSync(opts.json, 'utf-8');
      }
      contributions = JSON.parse(content);
      defaultTitle = 'Contribution Heatmap 2025';
    } else {
      if (!isGitRepository()) {
        console.error('Error: Not in a Git repository and no --json file was specified.');
        console.error('Run this tool inside a Git repository or provide data with --json.');
        process.exit(1);
      }
      contributions = getGitContributions({
        author: opts.author,
        since: opts.start,
        until: opts.end,
      });
      defaultTitle = `Git Commit History in ${getGitRepoName()}`;
    }

    // Attempt to parse start/end dates for the renderer bounds, but only if they are standard dates.
    // Relative string values like '1 year ago' are parsed successfully by git but not JS Date.
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

    const output = renderHeatmap(contributions, {
      startDate: renderStart,
      endDate: renderEnd,
      theme: opts.theme as ThemeName,
      character: opts.char,
      legend: opts.legend,
      monthLabels: opts.month,
      dayLabels: opts.day,
      allDayLabels: opts.allDays,
      title: opts.title ?? defaultTitle,
      startDayOfWeek: opts.monday ? 1 : 0,
    });

    console.log('\n' + output + '\n');
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

run();