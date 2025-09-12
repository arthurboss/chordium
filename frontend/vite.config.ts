import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import * as os from "os";
import { visualizer } from 'rollup-plugin-visualizer';
import stripTestAttributes from "./src/utils/vite-strip-test-attributes";
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isHttps = process.env.VITE_HTTPS_ENABLED === 'true';
  
  return {
    server: {
      host: "::",
      port: 8080,
      https: isHttps ? {
        key: path.resolve(__dirname, '../backend/localhost+2-key.pem'),
        cert: path.resolve(__dirname, '../backend/localhost+2.pem'),
      } : undefined,
      // Add historyApiFallback for SPA routing
      cors: true,
      proxy: isProduction ? undefined : {
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
      ...(isProduction ? [stripTestAttributes()] : []),
      ...(isProduction ? [visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html', // Output file
        template: 'treemap', // or 'sunburst', 'network'
      })] : []),
      ...(isProduction ? [viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // Only compress files larger than 10kb
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false,
      })] : []),
      // Optionally, keep Gzip for wider compatibility or if specific CDNs prefer it as a fallback
      // isProduction && viteCompression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 10240,
      //   algorithm: 'gzip',
      //   ext: '.gz',
      // }),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Chordium',
          short_name: 'Chordium',
          description: 'A modern, minimalist chord viewer app for guitar players.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#9b87f5',
          icons: [
            {
              src: 'https://arthurboss.github.io/chordium-static/favicon-16.png',
              sizes: '16x16',
              type: 'image/png'
            },
            {
              src: 'https://arthurboss.github.io/chordium-static/favicon-32.png',
              sizes: '32x32',
              type: 'image/png'
            },
            {
              src: 'https://arthurboss.github.io/chordium-static/favicon-48.png',
              sizes: '48x48',
              type: 'image/png'
            },
            {
              src: 'https://arthurboss.github.io/chordium-static/favicon-180.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'https://arthurboss.github.io/chordium-static/favicon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://arthurboss.github.io/chordium-static/favicon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'https://arthurboss.github.io/chordium-static/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Search',
              short_name: 'Search',
              description: 'Find guitar chords',
              url: '/search',
              icons: [
                {
                  src: 'https://arthurboss.github.io/chordium-static/favicon-192.png',
                  sizes: '192x192',
                  type: 'image/png'
                }
              ]
            },
            {
              name: 'Upload',
              short_name: 'Upload',
              description: 'Upload a new chord sheet',
              url: '/upload',
              icons: [
                {
                  src: 'https://arthurboss.github.io/chordium-static/favicon-192.png',
                  sizes: '192x192',
                  type: 'image/png'
                }
              ]
            },
            {
              name: 'My Chord Sheets',
              short_name: 'My Songs',
              description: 'View your saved chord sheets',
              url: '/my-chord-sheets',
              icons: [
                {
                  src: 'https://arthurboss.github.io/chordium-static/favicon-192.png',
                  sizes: '192x192',
                  type: 'image/png'
                }
              ]
            }
          ]
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
          // Re-enable navigateFallback but with better caching
          navigateFallback: '/index.html',
          navigateFallbackAllowlist: [/^(?!\/__).*/],
          runtimeCaching: [
            {
              // Cache the manifest file with CacheFirst strategy
              urlPattern: /manifest\.json$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'chordium-v1-manifest',
                expiration: {
                  maxEntries: 1,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache the main app files with CacheFirst strategy
              urlPattern: /\.(?:js|css|html)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'chordium-v1-app-assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\/api\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'chordium-v1-api-responses',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'chordium-v1-images',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true, // Enable PWA in development
          type: 'module', // Use ES modules for better development experience
          navigateFallback: '/index.html',
        },
      }),
    ] as any,
    preview: {
      port: 4173,
      host: "::",
      // Enable proxy in preview mode for local testing
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
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
        "@music": path.resolve(__dirname, "./src/music"),
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
        '**/_archive/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ],
      css: true,
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
          isolate: true,
        },
      },
      // Prevent memory leaks and timeouts
      testTimeout: 10000,
      hookTimeout: 10000,
      teardownTimeout: 5000,
      // Improve test isolation and memory management
      isolate: true,
      // Optimize concurrency based on available CPU cores
      maxConcurrency: Math.max(1, Math.floor(os.cpus().length / 2)),
      // Prevent hanging tests
      fileParallelism: true,
      // CPU-aware worker allocation for performance
      maxWorkers: Math.max(1, os.cpus().length - 1),
      // Silent console logs during tests to reduce memory usage
      silent: false,
      // Enable garbage collection between test files
      sequence: {
        shuffle: false,
        concurrent: false,
      },
      // Memory management for large test suites
      forceRerunTriggers: ['**/test-utils.tsx'],
      clearMocks: true,
      mockReset: true,
      restoreMocks: true,
    },
  };
});
