/**
 * Performance monitoring utilities for benchmarking React 19 optimizations
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface HookPerformanceData {
  hookName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  dataFetchTime?: number;
  uiUpdateTime?: number;
}

class PerformanceMonitor {
  private readonly metrics: Map<string, PerformanceMetric> = new Map();
  private readonly hookMetrics: Map<string, HookPerformanceData> = new Map();
  private readonly renderCounts: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  /**
   * End measuring a performance metric and return duration
   */
  endMeasure(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    console.log(`⏱️ [${name}] ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Track hook performance data
   */
  trackHookPerformance(hookName: string, renderTime: number, dataFetchTime?: number): void {
    const existing = this.hookMetrics.get(hookName) || {
      hookName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0
    };

    existing.renderCount++;
    existing.totalRenderTime += renderTime;
    existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
    existing.lastRenderTime = renderTime;
    
    if (dataFetchTime !== undefined) {
      existing.dataFetchTime = dataFetchTime;
    }

    this.hookMetrics.set(hookName, existing);
  }

  /**
   * Get performance comparison between two hooks
   */
  compareHooks(hookA: string, hookB: string): void {
    const metricsA = this.hookMetrics.get(hookA);
    const metricsB = this.hookMetrics.get(hookB);

    if (!metricsA || !metricsB) {
      console.warn('Cannot compare hooks - metrics not found');
      return;
    }

    console.group('🔍 Hook Performance Comparison');
    console.table({
      [hookA]: {
        'Render Count': metricsA.renderCount,
        'Avg Render Time (ms)': metricsA.averageRenderTime.toFixed(2),
        'Last Render Time (ms)': metricsA.lastRenderTime.toFixed(2),
        'Data Fetch Time (ms)': metricsA.dataFetchTime?.toFixed(2) || 'N/A'
      },
      [hookB]: {
        'Render Count': metricsB.renderCount,
        'Avg Render Time (ms)': metricsB.averageRenderTime.toFixed(2),
        'Last Render Time (ms)': metricsB.lastRenderTime.toFixed(2),
        'Data Fetch Time (ms)': metricsB.dataFetchTime?.toFixed(2) || 'N/A'
      }
    });

    const renderImprovement = ((metricsA.averageRenderTime - metricsB.averageRenderTime) / metricsA.averageRenderTime) * 100;
    const betterHook = renderImprovement > 0 ? hookB : hookA;
    const improvementPercent = Math.abs(renderImprovement);

    console.log(`📈 Performance Winner: ${betterHook} (${improvementPercent.toFixed(1)}% faster rendering)`);
    console.groupEnd();
  }

  /**
   * Get all performance metrics summary
   */
  getSummary(): void {
    console.group('📊 Performance Summary');
    
    // Timing metrics
    if (this.metrics.size > 0) {
      console.log('⏱️ Timing Metrics:');
      this.metrics.forEach((metric, name) => {
        if (metric.duration) {
          console.log(`  ${name}: ${metric.duration.toFixed(2)}ms`);
        }
      });
    }

    // Hook metrics
    if (this.hookMetrics.size > 0) {
      console.log('🎣 Hook Performance:');
      console.table(
        Array.from(this.hookMetrics.values()).reduce((acc, metric) => {
          acc[metric.hookName] = {
            'Renders': metric.renderCount,
            'Avg Time (ms)': metric.averageRenderTime.toFixed(2),
            'Last Time (ms)': metric.lastRenderTime.toFixed(2)
          };
          return acc;
        }, {} as Record<string, Record<string, string | number>>)
      );
    }

    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.hookMetrics.clear();
    this.renderCounts.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order function to measure hook performance
 */
export function withPerformanceTracking<T extends (...args: unknown[]) => unknown>(
  hookFn: T,
  hookName: string
): T {
  return ((...args: unknown[]) => {
    const startTime = performance.now();
    const result = hookFn(...args);
    const endTime = performance.now();
    
    performanceMonitor.trackHookPerformance(hookName, endTime - startTime);
    
    return result;
  }) as T;
}

/**
 * React DevTools Profiler integration
 */
export function logProfilerData(id: string, phase: 'mount' | 'update', actualDuration: number): void {
  console.log(`🔧 [React Profiler] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
  performanceMonitor.trackHookPerformance(`${id}-${phase}`, actualDuration);
}
