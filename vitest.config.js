import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'], // Only include unit tests, exclude e2e
    exclude: ['e2e/**/*'], // Explicitly exclude e2e tests
  },
}); 