// @ts-check
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

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

// Credenciales del usuario de prueba
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  displayName: 'Test User'
};

// Crear usuario de prueba
async function createTestUser() {
  console.log('Intentando crear usuario de prueba...');
  
  try {
    // Crear el usuario
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      TEST_USER.email, 
      TEST_USER.password
    );
    
    // Actualizar el perfil con el nombre
    await updateProfile(userCredential.user, {
      displayName: TEST_USER.displayName
    });
    
    console.log('✅ Usuario creado exitosamente!');
    console.log('User ID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    console.log('Nombre:', userCredential.user.displayName);
    
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error.message);
    console.error('Código de error:', error.code);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  El usuario ya existe. Puedes intentar iniciar sesión.');
    }
  }
}

// Ejecutar la función
createTestUser().then(() => process.exit(0));
