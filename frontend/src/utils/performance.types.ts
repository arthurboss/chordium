/**
 * Types for lightweight performance monitoring
 */

/**
 * Performance tracking data for hooks
 */
export interface HookPerformanceData {
  hookName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  dataFetchTime?: number;
}
