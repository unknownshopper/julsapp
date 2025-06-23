import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiMenu, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiBell,
  FiSearch
} from 'react-icons/fi';
import './Topbar.css';

const Topbar = ({ onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Obtener la primera letra del email para el avatar
  const userInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U';
  // Obtener el nombre de usuario del email (parte antes del @)
  const username = currentUser?.email?.split('@')[0] || 'Usuario';

  // Si no hay usuario logueado, mostramos los botones de autenticación
  if (!currentUser) {
    return (
      <header className="topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            <button 
              onClick={onMenuClick}
              className="menu-button"
              aria-label="Menú"
            >
              <FiMenu className="w-6 h-6" />
            </button>
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
          <button 
            onClick={onMenuClick}
            className="menu-button"
            aria-label="Menú"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          {/* Barra de búsqueda */}
          <div className="hidden md:flex items-center ml-4 bg-gray-100 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none focus:outline-none w-64"
            />
          </div>
        </div>
        
        <div className="topbar-right">
          {/* Notificaciones */}
          <button 
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            aria-label="Notificaciones"
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {/* Menú de usuario */}
          <div className="relative ml-4">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 focus:outline-none"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <div className="user-avatar">
                {userInitial}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </button>
            
            {/* Menú desplegable */}
            {isDropdownOpen && (
              <div 
                className="dropdown-content"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                </div>
                
                <Link 
                  to="/perfil" 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiUser className="w-5 h-5" />
                  <span>Mi perfil</span>
                </Link>
                
                <Link 
                  to="/configuracion" 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiSettings className="w-5 h-5" />
                  <span>Configuración</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;