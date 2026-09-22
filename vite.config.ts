import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'server.hmr.overlay':'false',
      '@': path.resolve(__dirname, './src'),
    },
  },
});