import { defineConfig } from 'vite';

export default defineConfig({
  base: '/HimeBirthday/',
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    environment: 'jsdom'
  }
});