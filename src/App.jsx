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
  const isMobile = React.useMemo(() => window.innerWidth < 768, []);
  
  // Cerrar el menú al cambiar de ruta
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);
  
  // Efecto para manejar el scroll y el overlay cuando el menú está abierto
  React.useEffect(() => {
    if (!isMobile) return;
    
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isSidebarOpen, isMobile]);

  // Manejar el cierre con la tecla Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);
  
  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const closeSidebar = React.useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Botón de menú móvil */}
      <button 
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-2xl shadow-lg transform transition-transform duration-200 active:scale-95 md:hidden"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar-navigation"
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobile ? isSidebarOpen : true} 
        onClose={closeSidebar}
      />
      
      {/* Contenido principal */}
      <main 
        id="main-content"
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen && isMobile ? 'translate-x-72' : ''
        }`}
        onClick={closeSidebar}
      >
        <div className={`container mx-auto p-4 pt-20 transition-all duration-300 ${
          isMobile ? '' : 'md:ml-72 md:pt-6'
        }`}>
          {children}
        </div>
      </main>
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