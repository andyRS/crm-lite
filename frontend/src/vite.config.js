import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Configuración de desarrollo segura
    host: 'localhost',
    port: 5173,
    // No permitir host 0.0.0.0 en desarrollo para evitar exposiciones accidentales
    strictPort: true,
    // Configuración CORS para desarrollo
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  },
  build: {
    // Configuración de build segura
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.logs en producción
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Sanitizar nombres de archivos
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Variables de entorno
  envPrefix: 'VITE_',
  // No exponer variables de entorno sensibles
  define: {
    // Remover cualquier variable sensible que pueda estar expuesta
    'process.env': {}
  }
});
