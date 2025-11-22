/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from "@nabla/vite-plugin-eslint";
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        eslintPlugin({
            eslintOptions: {
                cache: false,
                fix: false,
            },
            shouldLint: (path: string) => {
                return !!path.match(/\/src\/[^?]*\.(vue|svelte|m?[jt]sx?)$/);
            },
            formatter: "stylish"
        })
    ],
    preview: {
        host: true,
        port: 5000
    },
    build: {
        outDir: './build',
        emptyOutDir: true
    },
    server: {
        port: 3000,
        host: true,
        proxy: {
            '/api': {
                target: 'http://backend:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.config.*',
                '**/main.tsx',
                '**/*.d.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
