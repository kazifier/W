import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The cloud preview hostname is passed in at start-up so we can allow exactly
// that host (never a blanket wildcard).
const extraHosts = (process.env.PREVIEW_HOST ?? '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: extraHosts,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: extraHosts,
  },
});
