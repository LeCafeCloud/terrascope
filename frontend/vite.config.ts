import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
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
    }
})
