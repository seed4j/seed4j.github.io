import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: '.vitest/coverage',
      include: ['scripts/**/*'],
      thresholds: {
        'scripts/**/*': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
      all: true,
      clean: true
    },
  },
});
