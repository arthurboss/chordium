import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-expect-error - Import visualizer with type declaration in root d.ts file
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add historyApiFallback for SPA routing
    cors: true
  },
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html', // Output file
      template: 'treemap', // or 'sunburst', 'network'
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group major libraries together
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': [
            // UI library components - adjust based on your actual imports
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
          ],
          // Add more chunk definitions as needed
        }
      }
    },
    // Increase warning threshold to 750KB (adjust as needed)
    chunkSizeWarningLimit: 750,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
