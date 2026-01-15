
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Vital para que Project IDX pueda mostrar la previsualización
    port: parseInt(process.env.PORT || '3000'),
  },
})
