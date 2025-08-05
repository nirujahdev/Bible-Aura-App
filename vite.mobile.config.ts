import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";  
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['✦Bible Aura (2).png'],
      manifest: {
        name: 'Bible Aura - Mobile',
        short_name: 'Bible Aura',
        description: 'AI-powered biblical insight and study companion',
        theme_color: '#1e293b',
        background_color: '#1e293b',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '✦Bible Aura (2).png',
            sizes: '192x192 512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.bible\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openai-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600
              }
            }
          }
        ]
      }
    })
  ],
  root: "./mobile",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@mobile": resolve(__dirname, "mobile/src"),
    },
  },
  define: {
    global: "globalThis",
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  server: {
    port: 3000,
    host: true,
  },
  base: './'
}); 