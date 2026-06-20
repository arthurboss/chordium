import React, { useState } from 'react';
import { performanceMonitor } from '../utils/performance-monitor';

/**
 * Developer Tools Panel - Only visible in development
 * Provides easy access to performance testing and hook switching
 */
export const DevToolsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const clearMetrics = () => {
    performanceMonitor.clear();
    console.clear();
    console.log('🧹 Performance metrics cleared');
  };

  const showPerformanceSummary = () => {
    performanceMonitor.getSummary();
  };

  const compareHooks = () => {
    performanceMonitor.compareHooks('useSavedChordSheets', 'useSavedChordSheetsOptimized');
  };

  const runMemoryTest = () => {
    const memoryInfo = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    console.log('💾 Memory usage before:', memoryInfo?.usedJSHeapSize || 'N/A');
    
    // Force garbage collection if available
    const windowWithGC = window as unknown as { gc?: () => void };
    if (windowWithGC.gc) {
      windowWithGC.gc();
      console.log('🗑️ Garbage collection triggered');
    }
    
    setTimeout(() => {
      const memoryInfoAfter = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      console.log('💾 Memory usage after:', memoryInfoAfter?.usedJSHeapSize || 'N/A');
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Developer Tools"
      >
        {isExpanded ? '✕' : '🔧'}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">
            🚀 React 19 Performance Tools
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={showPerformanceSummary}
              className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm transition-colors"
            >
              📊 Show Performance Summary
            </button>
            
            <button
              onClick={compareHooks}
              className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded text-sm transition-colors"
            >
              ⚖️ Compare Hook Performance
            </button>
            
            <button
              onClick={runMemoryTest}
              className="w-full text-left px-3 py-2 bg-orange-50 hover:bg-orange-100 rounded text-sm transition-colors"
            >
              💾 Check Memory Usage
            </button>
            
            <button
              onClick={clearMetrics}
              className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded text-sm transition-colors"
            >
              🧹 Clear All Metrics
            </button>
          </div>

          <div className="mt-4 pt-3 border-t text-xs text-gray-600">
            <div className="mb-2">
              <strong>Quick Tips:</strong>
            </div>
            <ul className="space-y-1 text-xs">
              <li>• Open DevTools Console for detailed logs</li>
              <li>• Switch between tabs to test re-renders</li>
              <li>• Check React DevTools Profiler</li>
              <li>• Monitor Network tab for data fetching</li>
            </ul>
          </div>

          <div className="mt-3 pt-2 border-t">
            <div className="text-xs text-gray-500">
              Current Hook: <span className="font-mono text-green-600">useSavedChordSheetsOptimized</span>
            </div>
            <div className="text-xs text-gray-500">
              Features: useOptimistic + startTransition
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
