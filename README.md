# Jules App - Sistema CRM

Aplicación de gestión de clientes y tareas construida con React, Vite y Firebase, con un enfoque en la experiencia de usuario móvil y de escritorio.

## 🚀 Características Principales

### 🔐 Autenticación
- Inicio de sesión seguro con Firebase Auth
- Protección de rutas
- Recuperación de contraseña

### 👥 Gestión de Clientes
- Lista de clientes con búsqueda en tiempo real
- Perfiles detallados de clientes
- Historial de interacciones
- Filtrado avanzado

### ✅ Gestión de Tareas
- Crear, editar y eliminar tareas
- Marcar tareas como completadas
- Filtrado por estado (Todas/Pendientes/Completadas)
- Fechas de vencimiento con recordatorios
- Asignación de tareas

### 📊 Panel de Control
- Vista general de métricas
- Calendario de eventos
- Recordatorios y notificaciones

### 📱 Interfaz Moderna
- **Diseño completamente responsivo** que funciona en móviles, tablets y escritorio
- **Navegación intuitiva** con menú superior adaptativo
- **Tema claro/oscuro** basado en preferencias del sistema
- **Feedback visual** con notificaciones en tiempo real
- **Optimización de rendimiento** para una experiencia fluida
- **Accesibilidad** mejorada con ARIA y navegación por teclado

## 🔧 Requisitos Previos

- Node.js (v16 o superior)
- npm (v8 o superior) o yarn (v1.22 o superior)
- Cuenta de [Firebase](https://firebase.google.com/)
- Git (para control de versiones)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd julsapp
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configuración de Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Configura las reglas de seguridad
5. Crea una aplicación web en Firebase y obtén la configuración

### 4. Configuración de variables de entorno
Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🚀 Despliegue

### Desplegar en Vercel
1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en la configuración del proyecto en Vercel
3. Configura el comando de compilación como `npm run build`
4. El directorio de salida es `dist`
5. ¡Despliega!

## 🛠️ Dependencias Principales

### Dependencias de Producción
- React 19
- React Router DOM 7
- Firebase 10
- React Icons 5
- React Hot Toast 2
- date-fns 4
- Material-UI 7

### Dependencias de Desarrollo
- Vite 6
- ESLint 9
- Tailwind CSS 4
- PostCSS
- Autoprefixer

## 📱 Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Móviles y tablets (iOS y Android)
- Soporte para modo offline (próximamente)

## 🐛 Reportar problemas

Si encuentras algún problema, por favor [crea un issue](https://github.com/tu-usuario/tu-repositorio/issues) en el repositorio.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más información.

---

Desarrollado con ❤️ por [Tu Nombre]
   ```
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

## 🚀 Iniciar la Aplicación

```bash
# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Servidor de vista previa de producción
npm run preview
```

## 👤 Usuarios de Prueba

### Usuario Administrador
- **Email:** admin@example.com
- **Contraseña:** Admin123!

### Usuario de Prueba
- **Email:** test@example.com
- **Contraseña:** Password123!

## 🛠️ Scripts Útiles

- `createTestUser.js`: Crea un usuario de prueba en Firebase
- `listUsers.js`: Lista los usuarios registrados (requiere configuración de Admin SDK)

## 📝 Notas de Desarrollo

- La autenticación está configurada para usar Firebase Auth
- Los datos se almacenan en Firestore
- La interfaz está construida con Tailwind CSS

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
