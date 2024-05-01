import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/gaps",
    define: {
        __REPOSITORY_URL__: '"https://github.com/Quaffel/gaps"'
    }
})
