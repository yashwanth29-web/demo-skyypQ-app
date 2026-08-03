import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind is loaded via CDN in index.html — no plugin needed
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
})
