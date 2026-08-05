import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this project from /Political-Compass/; keep local
  // development at the root path for a normal Vite experience.
  base: process.env.GITHUB_ACTIONS ? '/Political-Compass/' : '/',
});
