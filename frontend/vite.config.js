import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build',
        emptyOutDir: true
    },
    server: {
        port: 8080,
        proxy: {
            '/api': "http://localhost:8081/"
        }
    }
})
