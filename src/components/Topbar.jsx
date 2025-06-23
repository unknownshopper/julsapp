import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiMenu, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiBell,
  FiSearch,
  FiHome,
  FiUsers,
  FiBriefcase,
  FiCheckSquare,
  FiFileText,
  FiCalendar,
  FiX,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import './TopBar.css';

const Topbar = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Manejar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        if (!isMobile) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navItems = [
    { to: '/', icon: <FiHome />, label: 'Resumen' },
    { to: '/clientes', icon: <FiUsers />, label: 'Clientes' },
    { to: '/proyectos', icon: <FiBriefcase />, label: 'Proyectos' },
    { to: '/tareas', icon: <FiCheckSquare />, label: 'Tareas' },
    { to: '/documentos', icon: <FiFileText />, label: 'Documentos' },
    { to: '/calendario', icon: <FiCalendar />, label: 'Calendario' },
    { to: '/configuracion', icon: <FiSettings />, label: 'Configuración' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Has cerrado sesión correctamente');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('No se pudo cerrar la sesión');
    }
  };

  // Obtener información del usuario
  const userInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U';
  const username = currentUser?.email?.split('@')[0] || 'Usuario';
  
  // Verificar si la ruta actual está activa
  const isActive = (path) => location.pathname === path;

  // Si no hay usuario logueado, mostramos los botones de autenticación
  if (!currentUser) {
    return (
      <header className="topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Jules App
            </Link>
          </div>
          <div className="topbar-right">
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div className="topbar-left">
          {/* Botón de menú móvil */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="Menú principal"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
          
          {/* Logo */}
          <Link to="/" className="hidden md:block text-xl font-bold text-gray-800 ml-2">
            Jules App
          </Link>
          
          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-1 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive(item.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="topbar-right" ref={menuRef}>
          {/* Barra de búsqueda móvil */}
          <div className="md:hidden flex items-center mr-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <FiSearch className="w-5 h-5" />
            </button>
          </div>
          
          {/* Notificaciones */}
          <button 
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            aria-label="Notificaciones"
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Menú de usuario */}
          <div className="relative ml-2">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                {userInitial}
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                {username}
              </span>
              {isDropdownOpen ? (
                <FiChevronUp className="hidden md:block w-4 h-4 text-gray-500" />
              ) : (
                <FiChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {/* Menú desplegable */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/perfil"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiUser className="mr-2" />
                  Mi perfil
                </Link>
                <Link
                  to="/configuracion"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiSettings className="mr-2" />
                  Configuración
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiLogOut className="mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      <div className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ top: '70px' }}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.to)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
