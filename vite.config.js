import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,   // Expose on local network (0.0.0.0)
    port: 5173,
  }
});