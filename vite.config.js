import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
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
    // Configuración de servidor (opcional)
    server: {
      port: 3000,
      open: true
    }
  };
});
