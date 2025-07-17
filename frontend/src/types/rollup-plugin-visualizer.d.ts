declare module 'rollup-plugin-visualizer' {
  interface VisualizerOptions {
    filename?: string;
    title?: string;
    open?: boolean;
    gzipSize?: boolean;
    brotliSize?: boolean;
    template?: 'sunburst' | 'treemap' | 'network' | 'raw-data';
    sourcemap?: boolean;
  }

  import { Plugin } from 'rollup';
  export function visualizer(options?: VisualizerOptions): Plugin;
}
