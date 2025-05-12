import React from "react";
import { testAttr, cyAttr, e2eAttr } from "@/utils/test-utils";

/**
 * Example component demonstrating the recommended way to add test attributes
 * These attributes will be automatically removed in production builds
 */
export function TestAttributeExample() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div {...testAttr("test-container")} className="p-4 border rounded">
      <h2 {...testAttr("test-title")} className="text-lg font-semibold">
        Test Attribute Example
      </h2>
      
      <div {...cyAttr("counter-section")} className="my-4">
        <span {...testAttr("count-display")}>Count: {count}</span>
        <div className="flex gap-2 mt-2">
          <button
            {...testAttr("increment-button")}
            {...cyAttr("increment")}
            onClick={() => setCount(c => c + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Increment
          </button>
          
          <button
            {...testAttr("decrement-button")}
            {...cyAttr("decrement")}
            onClick={() => setCount(c => c - 1)}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Decrement
          </button>
          
          <button
            {...testAttr("reset-button")}
            {...e2eAttr("reset-counter")}
            onClick={() => setCount(0)}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Reset
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        This component demonstrates the recommended way to add test attributes
        that will be automatically removed in production builds.
      </p>
    </div>
  );
}

export default TestAttributeExample;
