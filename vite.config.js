import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { app } from './api/lambda.js';

// Serve local Express app routes through the Vite dev server
const expressBackendPlugin = () => ({
  name: 'express-backend-plugin',
  configureServer(server) {
    server.middlewares.use(app);
  }
});

export default defineConfig({
  plugins: [react(), expressBackendPlugin()],

  server: {
    allowedHosts: [
      "50bc-150-129-132-115.ngrok-free.app"
    ]
  }
});