import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import Sidebar from './components/Sidebar';
// Topbar ha sido eliminado para simplificar la interfaz
import Dashboard from './components/Dashboard';
import Clientes from './components/Clientes';
import Tareas from './components/Tareas';
import Documentos from './components/Documentos';
import Proyectos from './components/Proyectos/Proyectos';
import Calendario from './components/Calendario/Calendario';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Componente de ruta protegida
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Componente de diseño para las rutas autenticadas
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  
  // Cerrar el menú al cambiar de ruta
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);
  
  // Efecto para manejar el scroll y el overlay cuando el menú está abierto
  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isSidebarOpen]);
  
  return (
    <div className="dashboard-container">
      {/* Botón de menú móvil */}
      <button 
        className="fixed top-4 left-4 z-[1000] w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center text-2xl shadow-md border-2 border-white cursor-pointer transform hover:scale-105 transition-transform md:hidden"
        style={{
          // Asegurar que esté por encima de otros elementos
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          willChange: 'transform',
          pointerEvents: 'auto'
        }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Contenido principal */}
      <main 
        className={`main-content ${isSidebarOpen ? 'menu-open' : ''}`}
        onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
      >
        {children}
      </main>
      
      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/proyectos"
            element={
              <PrivateRoute>
                <Layout>
                  <Proyectos />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tareas"
            element={
              <PrivateRoute>
                <Layout>
                  <Tareas />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/documentos"
            element={
              <PrivateRoute>
                <Layout>
                  <Documentos />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/calendario"
            element={
              <PrivateRoute>
                <Layout>
                  <Calendario />
                </Layout>
              </PrivateRoute>
            }
          />
          
          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;