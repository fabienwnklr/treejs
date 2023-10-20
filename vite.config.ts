/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    cssMinify: true,
    minify: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/TreeJS.ts'),
      name: 'TreeJS', // for iife and umd
      // the proper extensions will be added
      fileName: 'treejs',
      formats: ['iife', 'cjs', 'es', 'umd'],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    //   rollupTypes: true // uncomment If you want to merge all declarations into one file
    }),
  ],
  resolve: {
    alias: {
      find: '~',
      replacement: resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    threads: false,
    // For this config, check https://github.com/vitest-dev/vitest/issues/740
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/e2e/**',
    ],
  },
});
