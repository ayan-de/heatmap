import { execSync } from 'child_process';
import { ContributionData } from './types.js';

export interface GitContributionsOptions {
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
export function isGitRepository(cwd: string = process.cwd()): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Executes a Git command to collect the number of commits per day.
 * 
 * @param options Query filters for author, date range, and directory
 * @returns Array of daily contribution structures
 */
export function getGitContributions(options: GitContributionsOptions = {}): ContributionData[] {
  const cwd = options.cwd || process.cwd();

  if (!isGitRepository(cwd)) {
    throw new Error('Directory is not a Git repository (or Git is not installed).');
  }

  const args = ['log', '--date=short', '--pretty=format:%ad'];

  if (options.author) {
    // Escape double quotes to prevent command injection
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

  const cmd = `git ${args.join(' ')}`;
  
  try {
    // Run git log.
    // Use maxBuffer options to handle large repos (default is 1MB, we set to 10MB just in case)
    const output = execSync(cmd, { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const lines = output.split('\n').map(l => l.trim()).filter(Boolean);

    const counts: Record<string, number> = {};
    for (const dateStr of lines) {
      // Validate that it looks like YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    }

    return Object.entries(counts).map(([date, count]) => ({
      date,
      count,
    }));
  } catch (error: any) {
    throw new Error(`Failed to retrieve git contributions: ${error.message}`);
  }
}
