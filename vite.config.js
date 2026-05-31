import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: [
      "50bc-150-129-132-115.ngrok-free.app"
    ]
  }
})