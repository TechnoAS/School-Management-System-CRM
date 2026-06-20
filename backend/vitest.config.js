import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/__tests__/setup.js'],
        include: ['src/**/*.test.js'],
        exclude: ['**/node_modules/**', 'src/__tests__/api.live.test.js'],
    },
});
