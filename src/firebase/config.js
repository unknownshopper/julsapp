// Importa las funciones necesarias de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDE0VBRuaNIzuv5n5jDLFHOdon5JTRQV3Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "julesapp-35dd7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "julesapp-35dd7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "julesapp-35dd7.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "635190140015",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:635190140015:web:8eec8cfb77a8084575819a"
};

// Validar configuración
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

// Verificar que las variables de entorno requeridas estén definidas (solo en desarrollo)
if (import.meta.env.DEV) {
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      console.warn(`Advertencia: La variable de entorno ${envVar} no está definida. Usando valores por defecto.`);
    }
  }
}

// Inicializa Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  throw error;
}

// Obtiene instancias de autenticación y firestore
export const auth = getAuth(app);
let db;
try {
  db = getFirestore(app);
  console.log('Firestore inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firestore:', error);
  throw error;
}

export { db };
export default app;
