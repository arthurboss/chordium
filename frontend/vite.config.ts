import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';
import stripTestAttributes from "./src/utils/vite-strip-test-attributes";
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  return {
    server: {
      host: "::",
      port: 8080,
      // Add historyApiFallback for SPA routing
      cors: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      // Only strip data-testid attributes in production mode
      isProduction && stripTestAttributes(),
      isProduction && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html', // Output file
        template: 'treemap', // or 'sunburst', 'network'
      }),
      isProduction && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // Only compress files larger than 10kb
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      // Optionally, keep Gzip for wider compatibility or if specific CDNs prefer it as a fallback
      // isProduction && viteCompression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 10240,
      //   algorithm: 'gzip',
      //   ext: '.gz',
      // }),
    ].filter(Boolean),
    build: {
      // Enable tree shaking
      minify: 'terser',
      terserOptions: {
        compress: {
          // Enable tree shaking optimizations
          passes: 2,
          pure_getters: true,
          drop_console: isProduction,
          drop_debugger: isProduction,
          unused: true,
          dead_code: true
        },
        mangle: {
          toplevel: true
        }
      },
      rollupOptions: {
        output: {
          // Remove empty chunks
          manualChunks: {
            // Group major libraries together
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-components': [
              // UI library components - adjust based on your actual imports
              '@radix-ui/react-dialog',
              '@radix-ui/react-popover',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-tabs'
            ],
            // Add more chunk definitions as needed
          },
          // Ensure no empty chunks are generated
          compact: true,
          // Improve code splitting
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js'
        },
        treeshake: {
          // Advanced tree shaking options
          moduleSideEffects: 'no-external', // More aggressive - assume no side effects except for external modules
          propertyReadSideEffects: false,  // Properties don't have side effects when read
          tryCatchDeoptimization: false,   // Don't preserve values inside try/catch blocks
          preset: 'recommended'            // Use recommended preset for best tree shaking
        },
        // Optimize dependencies too
        preserveEntrySignatures: 'strict',
      },
      // Increase warning threshold to 750KB (adjust as needed)
      chunkSizeWarningLimit: 750,
      sourcemap: mode !== 'production',
      // Don't emit assets that exceed the intended limit
      emptyOutDir: true
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Ensure environment variables are available at build time
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
      'process.env.VERCEL': JSON.stringify(process.env.VERCEL),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['vitest.setup.js', './src/test-setup.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/backend/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ],
      css: true,
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      // Prevent memory leaks and timeouts
      testTimeout: 10000,
      hookTimeout: 10000,
      teardownTimeout: 5000,
      // Improve test isolation
      isolate: true,
      // Limit memory usage
      maxConcurrency: 1,
      // Prevent hanging tests
      fileParallelism: false,
    },
  };
});
