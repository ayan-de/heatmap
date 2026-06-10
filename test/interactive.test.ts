import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startInteractiveHeatmap } from '../src/interactive.js';
import { ContributionData } from '../src/types.js';

describe('Interactive Mode', () => {
  let stdoutWriteSpy: any;
  let stdinOnSpy: any;
  let exitSpy: any;
  let rawModeSpy: any;
  let resumeSpy: any;
  let pauseSpy: any;
  let offSpy: any;
  let dataCallback: ((chunk: any) => void) | null = null;

  let originalSetRawMode: any;

  beforeEach(() => {
    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    originalSetRawMode = process.stdin.setRawMode;
    process.stdin.setRawMode = vi.fn().mockImplementation(() => process.stdin) as any;
    rawModeSpy = process.stdin.setRawMode;
    resumeSpy = vi.spyOn(process.stdin, 'resume').mockImplementation(() => process.stdin);
    pauseSpy = vi.spyOn(process.stdin, 'pause').mockImplementation(() => process.stdin);
    offSpy = vi.spyOn(process.stdout, 'off').mockImplementation(() => process.stdout);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('Exit called'); });
    
    stdinOnSpy = vi.spyOn(process.stdin, 'on').mockImplementation((event, callback) => {
      if (event === 'data') {
        dataCallback = callback as any;
      }
      return process.stdin;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalSetRawMode === undefined) {
      delete (process.stdin as any).setRawMode;
    } else {
      process.stdin.setRawMode = originalSetRawMode;
    }
    dataCallback = null;
  });

  it('should initialize alternate screen and render heatmap', () => {
    const data: ContributionData[] = [
      { date: '2023-06-10', count: 5 },
    ];
    
    startInteractiveHeatmap(data, {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      legend: false,
      title: 'Test Heatmap',
    });

    const calls = stdoutWriteSpy.mock.calls.map((c: any) => c[0]);
    expect(calls.some((c: string) => c.includes('\x1b[?1049h'))).toBe(true);
    expect(calls.some((c: string) => c.includes('Test Heatmap'))).toBe(true);
  });

  it('should handle mouse hover events and print details', () => {
    const data: ContributionData[] = [
      { date: '2023-06-10', count: 5 },
    ];
    
    startInteractiveHeatmap(data, {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      legend: false,
      title: 'Test Heatmap',
      dayLabels: true, // leftPadding = 4
    });

    stdoutWriteSpy.mockClear();

    expect(dataCallback).toBeDefined();
    if (dataCallback) {
      // 2023-06-10 is col c = 1, row r = 6.
      // Left padding = 4. Character = '■' (length 1). colWidth = 2.
      // relativeX = c * colWidth = 1 * 2 = 2.
      // x = leftPadding + relativeX + 1 = 4 + 2 + 1 = 7.
      // y = startRow + r = (1 (screen start) + 2 (title) + 1 (month)) + 6 = 4 + 6 = 10.
      // SGR move event code for column 7, row 10: \x1b[<35;7;10M
      dataCallback(Buffer.from('\x1b[<35;7;10M'));

      const calls = stdoutWriteSpy.mock.calls.map((c: any) => c[0]);
      expect(calls.some((c: string) => c.includes('Saturday') && c.includes('count: 5'))).toBe(true);
    }
  });

  it('should support dynamic keys like TokenCount', () => {
    const data: ContributionData[] = [
      { date: '2023-06-10', TokenCount: 15 },
    ];
    
    startInteractiveHeatmap(data, {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      legend: false,
      title: 'Test Heatmap',
      dayLabels: true,
    });

    stdoutWriteSpy.mockClear();

    expect(dataCallback).toBeDefined();
    if (dataCallback) {
      dataCallback(Buffer.from('\x1b[<35;7;10M'));

      const calls = stdoutWriteSpy.mock.calls.map((c: any) => c[0]);
      expect(calls.some((c: string) => c.includes('Saturday') && c.includes('TokenCount: 15'))).toBe(true);
    }
  });

  it('should clean up and exit when exit key is pressed', () => {
    const data: ContributionData[] = [];
    
    startInteractiveHeatmap(data, {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
    });

    expect(dataCallback).toBeDefined();
    if (dataCallback) {
      expect(() => {
        dataCallback!(Buffer.from('q'));
      }).toThrow('Exit called');

      const calls = stdoutWriteSpy.mock.calls.map((c: any) => c[0]);
      expect(calls.some((c: string) => c.includes('\x1b[?1049l'))).toBe(true);
    }
  });
});
