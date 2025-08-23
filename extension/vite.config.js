import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),       // popup.html entry
        background: resolve(__dirname, 'src/background.js'), // background script
        content: resolve(__dirname, 'src/content.js')        // content script
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'background') return 'background.js';
          if (chunk.name === 'content') return 'content.js';
          if (chunk.name === 'popup') return 'popup.js';
          return 'assets/[name].js';
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: false, // disable default publicDir behavior
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: '.' // Copies files like manifest.json, icons into dist/
        }
      ]
    })
  ]
});
