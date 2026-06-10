import { describe, it, expect } from 'vitest';
import { renderHeatmap, formatDateKey } from '../src/renderer.js';
import { ContributionData } from '../src/types.js';

describe('Renderer Core', () => {
  it('should format dates as YYYY-MM-DD correctly', () => {
    const d = new Date(2023, 5, 15); // June 15, 2023 (0-indexed month)
    expect(formatDateKey(d)).toBe('2023-06-15');
  });

  it('should render a basic heatmap with title and defaults', () => {
    const data: ContributionData[] = [
      { date: '2023-06-10', count: 5 },
      { date: '2023-06-11', count: 12 },
    ];
    
    const output = renderHeatmap(data, {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      legend: false,
      title: 'My Project Contributions',
    });
    
    expect(output).toContain('My Project Contributions');
    expect(output).toContain('Mon');
    expect(output).toContain('Wed');
    expect(output).toContain('Fri');
    expect(output).toContain('■'); // Default square block
  });

  it('should support custom symbols', () => {
    const data: ContributionData[] = [{ date: '2023-06-10', count: 5 }];
    const output = renderHeatmap(data, {
      startDate: '2023-06-01',
      endDate: '2023-06-10',
      character: '●',
      legend: false,
      dayLabels: false,
    });
    expect(output).toContain('●');
    expect(output).not.toContain('■');
  });

  it('should support disabling day and month labels', () => {
    const output = renderHeatmap([], {
      startDate: '2023-01-01',
      endDate: '2023-01-20',
      dayLabels: false,
      monthLabels: false,
      legend: false,
    });
    
    expect(output).not.toContain('Mon');
    expect(output).not.toContain('Wed');
    expect(output).not.toContain('Fri');
    expect(output).not.toContain('Jan');
  });

  it('should support starting weeks on Monday', () => {
    const output = renderHeatmap([], {
      startDate: '2023-01-01',
      endDate: '2023-01-20',
      dayLabels: true,
      startDayOfWeek: 1, // Monday start
    });
    // In Monday-start mode: row 1 is Tue, row 3 is Thu, row 5 is Sat
    expect(output).toContain('Tue');
    expect(output).toContain('Thu');
    expect(output).toContain('Sat');
    expect(output).not.toContain('Mon');
    expect(output).not.toContain('Wed');
    expect(output).not.toContain('Fri');
  });

  it('should calculate legend alignment correctly', () => {
    const output = renderHeatmap([], {
      startDate: '2023-01-01',
      endDate: '2023-06-30',
      legend: true,
    });
    expect(output).toContain('Less');
    expect(output).toContain('More');
  });

  it('should support showing labels for all days of the week', () => {
    const output = renderHeatmap([], {
      startDate: '2023-01-01',
      endDate: '2023-01-20',
      dayLabels: true,
      allDayLabels: true,
      startDayOfWeek: 0,
    });
    expect(output).toContain('Sun');
    expect(output).toContain('Mon');
    expect(output).toContain('Tue');
    expect(output).toContain('Wed');
    expect(output).toContain('Thu');
    expect(output).toContain('Fri');
    expect(output).toContain('Sat');
  });
});

