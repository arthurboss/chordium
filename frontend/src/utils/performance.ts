/**
 * Lightweight performance monitoring for development
 * 
 * Tracks hook performance without impacting production builds.
 * Helps identify performance bottlenecks during development.
 */

import type { HookPerformanceData } from "./performance.types";

class PerformanceTracker {
  private readonly hookMetrics = new Map<string, HookPerformanceData>();
  private readonly measures = new Map<string, number>();
  private readonly enabled = import.meta.env.DEV;

  /**
   * Start measuring performance
   * 
   * @param name - Unique identifier for the measurement
   */
  startMeasure(name: string): void {
    if (!this.enabled) return;
    this.measures.set(name, performance.now());
  }

  /**
   * End measuring performance
   * 
   * @param name - Measurement identifier to complete
   * @returns Duration in milliseconds or null if measurement not found
   */
  endMeasure(name: string): number | null {
    if (!this.enabled) return null;
    
    const startTime = this.measures.get(name);
    if (!startTime) return null;
    
    const duration = performance.now() - startTime;
    this.measures.delete(name);
    return duration;
  }

  /**
   * Track hook performance metrics
   * 
   * @param hookName - Name of the hook being tracked
   * @param renderTime - Total execution time in milliseconds
   * @param dataFetchTime - Optional data fetching time for analysis
   */
  trackHookPerformance(
    hookName: string,
    renderTime: number,
    dataFetchTime?: number
  ): void {
    if (!this.enabled) return;

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
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();
