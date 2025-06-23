# Jules App - Sistema CRM

Aplicación de gestión de clientes y tareas construida con React, Vite y Firebase.

## 🚀 Características Principales

- **Autenticación de usuarios** con Firebase Auth
- **Gestión de Clientes**
  - Lista de clientes
  - Búsqueda y filtrado
  - Detalles del cliente
- **Gestión de Tareas**
  - Crear, editar y eliminar tareas
  - Marcar tareas como completadas
  - Filtrado por estado (Todas/Pendientes/Completadas)
  - Fechas de vencimiento con recordatorios
- **Interfaz Moderna**
  - Diseño responsivo
  - Interfaz intuitiva
  - Feedback visual en tiempo real

## 🔧 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Firebase

## 🛠️ Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd crm-react
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configura Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication (Email/Password)
   - Crea una base de datos Firestore
   - Configura las reglas de seguridad

4. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con:
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
