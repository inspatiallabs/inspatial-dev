/**
 * Minimal implementation of the perf_hooks module.
 * This just provides a performance object compatible with the DOM implementation.
 */

interface PerformanceTiming {
  // Add more specific timing properties if needed
  [key: string]: number | undefined;
}

interface Performance {
  now(): number;
  mark(markName: string): void;
  measure(measureName: string, startMark?: string, endMark?: string): void;
  clearMarks(markName?: string): void;
  clearMeasures(measureName?: string): void;
  readonly timeOrigin: number;
  readonly timing: PerformanceTiming;
}

const performanceImpl: Performance = {
  now(): number {
    return Date.now();
  },
  mark(_markName: string): void {
    // No-op
  },
  measure(_measureName: string, _startMark?: string, _endMark?: string): void {
    // No-op
  },
  clearMarks(_markName?: string): void {
    // No-op
  },
  clearMeasures(_measureName?: string): void {
    // No-op
  },
  timeOrigin: Date.now(), // Or a fixed timestamp if timeOrigin should be static post-load
  timing: {},
};

export { performanceImpl as performance };
