// @ts-check
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDE0VBRuaNIzuv5n5jDLFHOdon5JTRQV3Y",
  authDomain: "julesapp-35dd7.firebaseapp.com",
  projectId: "julesapp-35dd7",
  storageBucket: "julesapp-35dd7.firebasestorage.app",
  messagingSenderId: "635190140015",
  appId: "1:635190140015:web:8eec8cfb77a8084575819a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Verificar el estado de autenticación actual
console.log('Verificando estado de autenticación...');

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario ha iniciado sesión
    console.log('\n=== USUARIO ACTUAL ===');
    console.log(`• ID: ${user.uid}`);
    console.log(`• Email: ${user.email || 'No proporcionado'}`);
    console.log(`• Nombre: ${user.displayName || 'No proporcionado'}`);
    console.log(`• Email verificado: ${user.emailVerified ? 'Sí' : 'No'}`);
    console.log(`• Proveedores: ${user.providerData.map(p => p.providerId).join(', ')}`);
    console.log(`• Último inicio de sesión: ${user.metadata.lastSignInTime || 'Nunca'}`);
  } else {
    console.log('No hay usuario autenticado actualmente.');
  }
  
  // No salir inmediatamente para dar tiempo a la operación asíncrona
  setTimeout(() => process.exit(0), 1000);
});
