import type { Plugin } from 'vite';

/**
 * Vite plugin to remove data-testid attributes from production builds.
 * This helps reduce bundle size and prevents exposing test selectors in production.
 */
export default function stripTestAttributes(): Plugin {
  let totalAttributesRemovedCount = 0;
  const processedFiles = new Set<string>();

  return {
    name: 'vite:strip-data-testid', // More specific name
    enforce: 'pre',
    transform(code: string, id: string) {
      // Only process TSX/JSX files. HTML files might be too broad if not careful.
      // If you have .html files where you use data-testid and want them stripped,
      // you can add \\.html back, but ensure the regex is very specific.
      if (!/\.[jt]sx$/.test(id)) {
        return null;
      }

      let fileAttributeCount = 0;
      const originalCode = code;

      // Regex to specifically target data-testid attributes
      // It handles:
      // - data-testid="value" (double quotes)
      // - data-testid='value' (single quotes)
      // - data-testid={expression} (JSX expression)
      const testIdRegex = /\s+data-testid=(["'])(?:(?!\1).)*?\1|\s+data-testid=\{[^}]*\}/g;
      
      code = code.replace(testIdRegex, (match) => {
        fileAttributeCount++;
        return ''; // Remove the attribute
      });

      if (fileAttributeCount > 0) {
        totalAttributesRemovedCount += fileAttributeCount;
        processedFiles.add(id);
        // Optional: More detailed logging during build if needed for debugging
        // console.log(`[strip-data-testid] Removed ${fileAttributeCount} data-testid attributes from ${id}`);
      }

      // Return null if no changes were made to allow other plugins to process the original code
      if (code === originalCode) {
        return null;
      }

      return {
        code,
        map: null, // Sourcemaps are not strictly necessary for this transformation
      };
    },
    buildEnd() {
      if (totalAttributesRemovedCount > 0) {
        console.log(`[strip-data-testid] Successfully removed a total of ${totalAttributesRemovedCount} data-testid attributes from ${processedFiles.size} files.`);
        // Optional: List processed files
        // console.log('[strip-data-testid] Processed files:', Array.from(processedFiles));
      } else {
        console.log('[strip-data-testid] No data-testid attributes found or removed during the build.');
      }
    },
  };
}
