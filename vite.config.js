import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // Configuración de compilación
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth']
          }
        }
      }
    },
    // Hacer que las variables de entorno estén disponibles en el cliente
    define: {
      'process.env': {
        ...Object.keys(env).reduce((prev, key) => {
          if (key.startsWith('VITE_')) {
            prev[key] = JSON.stringify(env[key]);
          }
          return prev;
        }, {})
      }
    },
    // Configuración de servidor
    server: {
      port: 3000,
      open: true,
      strictPort: true
    },
    // Configuración de preview
    preview: {
      port: 3000,
      strictPort: true
    }
  };
});
