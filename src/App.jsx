import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const Layout = ({ children }) => (
  <div className="dashboard-container">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

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