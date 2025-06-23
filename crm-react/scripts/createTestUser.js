// @ts-check
// Importaciones de Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
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
  password: 'password123',
  displayName: 'Test User'
};

// Crear usuario de prueba
const createTestUser = async () => {
  console.log('Intentando crear usuario de prueba...');
  console.log('Email:', TEST_USER.email);
  
  try {
    // Intentar crear el usuario
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      TEST_USER.email, 
      TEST_USER.password
    );
    
    console.log('✅ Usuario creado exitosamente!');
    console.log('User ID:', userCredential.user.uid);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  El usuario ya existe. Intentando iniciar sesión...');
      
      try {
        // Si el usuario ya existe, intentar iniciar sesión
        const signInResult = await signInWithEmailAndPassword(
          auth,
          TEST_USER.email,
          TEST_USER.password
        );
        
        console.log('✅ Inicio de sesión exitoso!');
        console.log('User ID:', signInResult.user.uid);
        
      } catch (signInError) {
        console.error('❌ Error al iniciar sesión:', signInError.message);
        if (signInError.code === 'auth/wrong-password') {
          console.error('La contraseña es incorrecta');
        }
      }
      
    } else {
      console.error('❌ Error al crear el usuario:', error.message);
      console.error('Código de error:', error.code);
    }
  } finally {
    console.log('\nPuedes usar estas credenciales para iniciar sesión en la aplicación:');
    console.log('📧 Email:', TEST_USER.email);
    console.log('🔑 Contraseña:', TEST_USER.password);
    process.exit(0);
  }
};

// Ejecutar la función principal
createTestUser().catch(console.error);
