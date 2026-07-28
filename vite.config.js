import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// A lightweight Vite plugin to serve Vercel serverless /api/* endpoints locally
const apiServerlessPlugin = () => ({
  name: 'api-serverless-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Intercept any request pointing to /api/
      if (req.url.startsWith('/api/')) {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const apiRoute = parsedUrl.pathname.slice(5); // Remove the leading "/api/"
        const fileExts = ['.js', '.ts'];
        let filePath = null;

        for (const ext of fileExts) {
          const testPath = path.join(process.cwd(), 'api', `${apiRoute}${ext}`);
          if (fs.existsSync(testPath)) {
            filePath = testPath;
            break;
          }
        }

        if (filePath) {
          try {
            // Load and execute the api serverless function module dynamically via Vite SSR load
            const module = await server.ssrLoadModule(filePath);
            const handler = module.default;

            // Parse req.body for JSON payloads if it is a POST/PUT request
            let body = {};
            if (req.method === 'POST' || req.method === 'PUT') {
              body = await new Promise((resolve) => {
                let chunks = '';
                req.on('data', chunk => chunks += chunk);
                req.on('end', () => {
                  try {
                    resolve(JSON.parse(chunks));
                  } catch {
                    resolve({});
                  }
                });
              });
            }

            // Mock req and res with Vercel Serverless signatures
            const mockReq = {
              method: req.method,
              body,
              headers: req.headers,
              socket: req.socket,
              query: Object.fromEntries(parsedUrl.searchParams.entries())
            };

            const mockRes = {
              statusCode: 200,
              headers: {},
              status(code) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              setHeader(name, value) {
                this.headers[name] = value;
                res.setHeader(name, value);
                return this;
              },
              json(data) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = this.statusCode;
                res.end(JSON.stringify(data));
                return this;
              },
              send(data) {
                res.statusCode = this.statusCode;
                res.end(data);
                return this;
              }
            };

            // Run the serverless function handler
            await handler(mockReq, mockRes);
            return;
          } catch (err) {
            console.error(`[API Dev Error] Error executing /api/${apiRoute}:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Internal Server Error: ${err.message}` }));
            return;
          }
        }
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), apiServerlessPlugin()],

  server: {
    allowedHosts: [
      "50bc-150-129-132-115.ngrok-free.app"
    ]
  }
});