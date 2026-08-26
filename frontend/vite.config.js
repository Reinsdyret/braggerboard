import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
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
