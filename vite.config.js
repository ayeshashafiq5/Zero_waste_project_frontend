import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Explicit HMR config — `host:true` exposes Vite on 0.0.0.0 which can
    // confuse the browser's WebSocket auto-detection (it tries to upgrade
    // against whatever IP it loaded the page from). Forcing the client to
    // connect back to localhost:5173 fixes the "ws://… failed" warning.
    hmr: {
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      protocol: 'ws',
    },
  },
  preview: { port: 5173, host: true },
  build: { sourcemap: false, chunkSizeWarningLimit: 1000 },
});
