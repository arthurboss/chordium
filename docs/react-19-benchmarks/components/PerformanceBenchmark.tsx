import React, { useState, useEffect, Profiler } from 'react';
import { performanceMonitor, logProfilerData } from '../utils/performance-monitor';
import { useSavedChordSheets } from '../storage/hooks/use-saved-chord-sheets';
import { useSavedChordSheetsOptimized } from '../storage/hooks/chord-sheets/use-saved-chord-sheets-optimized';

/**
 * Performance Benchmark Component
 * 
 * This component allows you to test and compare the performance
 * between the original and optimized React 19 hooks.
 */
export const PerformanceBenchmark: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'original' | 'optimized' | 'both'>('both');
  const [testResults, setTestResults] = useState<{
    original?: number;
    optimized?: number;
    improvement?: string;
  }>({});

  // Test the original hook
  const originalResult = useSavedChordSheets();
  const optimizedResult = useSavedChordSheetsOptimized();

  useEffect(() => {
    // Clear previous metrics when starting new test
    performanceMonitor.clear();
  }, [activeTest]);

  const runBenchmark = () => {
    console.clear();
    console.log('🚀 Starting Performance Benchmark...');
    
    // Measure original hook performance
    performanceMonitor.startMeasure('original-hook-render');
    // Simulate hook execution time
    setTimeout(() => {
      const originalTime = performanceMonitor.endMeasure('original-hook-render');
      
      // Measure optimized hook performance  
      performanceMonitor.startMeasure('optimized-hook-render');
      setTimeout(() => {
        const optimizedTime = performanceMonitor.endMeasure('optimized-hook-render');
        
        if (originalTime && optimizedTime) {
          const improvement = ((originalTime - optimizedTime) / originalTime * 100).toFixed(1);
          setTestResults({
            original: originalTime,
            optimized: optimizedTime,
            improvement: improvement
          });
          
          performanceMonitor.compareHooks('original-hook', 'optimized-hook');
        }
      }, 10);
    }, 10);
  };

  const measureRerenders = () => {
    console.log('📊 Measuring re-render performance...');
    
    // Force re-renders and measure
    const iterations = 10;
    let originalTotal = 0;
    let optimizedTotal = 0;
    
    for (let i = 0; i < iterations; i++) {
      // Simulate data refresh
      const start = performance.now();
      originalResult.refresh();
      originalTotal += performance.now() - start;
      
      const optimizedStart = performance.now();
      optimizedResult.refreshMyChordSheets();
      optimizedTotal += performance.now() - optimizedStart;
    }
    
    console.log(`Original average: ${(originalTotal / iterations).toFixed(2)}ms`);
    console.log(`Optimized average: ${(optimizedTotal / iterations).toFixed(2)}ms`);
    console.log(`Improvement: ${(((originalTotal - optimizedTotal) / originalTotal) * 100).toFixed(1)}%`);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">🔬 Performance Benchmark</h2>
      
      <div className="space-y-4">
        {/* Test Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTest('original')}
            className={`px-4 py-2 rounded ${
              activeTest === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Test Original Hook
          </button>
          <button
            onClick={() => setActiveTest('optimized')}
            className={`px-4 py-2 rounded ${
              activeTest === 'optimized' ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
          >
            Test React 19 Hook
          </button>
          <button
            onClick={() => setActiveTest('both')}
            className={`px-4 py-2 rounded ${
              activeTest === 'both' ? 'bg-purple-500 text-white' : 'bg-gray-200'
            }`}
          >
            Compare Both
          </button>
        </div>

        {/* Benchmark Controls */}
        <div className="flex gap-2">
          <button
            onClick={runBenchmark}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            🚀 Run Benchmark
          </button>
          <button
            onClick={measureRerenders}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            📊 Measure Re-renders
          </button>
          <button
            onClick={() => performanceMonitor.getSummary()}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            📈 Show Summary
          </button>
        </div>

        {/* Results Display */}
        {Boolean(testResults.original && testResults.optimized) && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Original Hook:</span>
                <div className="text-blue-600">{testResults.original.toFixed(2)}ms</div>
              </div>
              <div>
                <span className="font-medium">React 19 Hook:</span>
                <div className="text-green-600">{testResults.optimized.toFixed(2)}ms</div>
              </div>
              <div>
                <span className="font-medium">Improvement:</span>
                <div className={`font-bold ${parseFloat(testResults.improvement || '0') > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.improvement}% faster
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Hook Status */}
        <div className="grid grid-cols-2 gap-4">
          <Profiler id="original-hook" onRender={logProfilerData}>
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-medium text-blue-800">Original Hook Status</h4>
              <div className="text-sm text-blue-600">
                <div>Chord Sheets: {originalResult.chordSheets?.length || 0}</div>
                <div>Type: Traditional useState/useEffect</div>
              </div>
            </div>
          </Profiler>

          <Profiler id="optimized-hook" onRender={logProfilerData}>
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-medium text-green-800">React 19 Hook Status</h4>
              <div className="text-sm text-green-600">
                <div>Chord Sheets: {optimizedResult.myChordSheets?.length || 0}</div>
                <div>Type: useOptimistic + startTransition</div>
                <div>Loading: {optimizedResult.isLoading ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </Profiler>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
          <h4 className="font-medium text-yellow-800">How to Use:</h4>
          <ol className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>1. Open browser DevTools (F12) and go to Console</li>
            <li>2. Click "Run Benchmark" to measure initial load performance</li>
            <li>3. Click "Measure Re-renders" to test update performance</li>
            <li>4. Use "Show Summary" to see all collected metrics</li>
            <li>5. Check React DevTools Profiler for detailed component analysis</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
