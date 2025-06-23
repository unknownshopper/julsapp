import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiSettings,
  FiCalendar,
  FiFileText,
  FiBriefcase
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: <FiHome />, label: 'Resumen' },
    { to: '/clientes', icon: <FiUsers />, label: 'Clientes' },
    { to: '/proyectos', icon: <FiBriefcase />, label: 'Proyectos' },
    { to: '/tareas', icon: <FiCheckSquare />, label: 'Tareas' },
    { to: '/documentos', icon: <FiFileText />, label: 'Documentos' },
    { to: '/calendario', icon: <FiCalendar />, label: 'Calendario' },
    { to: '/configuracion', icon: <FiSettings />, label: 'Configuración' },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="app-title">Jules App</span>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <Link 
                  to={item.to}
                  className={`flex items-center ${location.pathname === item.to ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto p-4 text-xs text-gray-500 border-t border-gray-800">
          <p>© {new Date().getFullYear()} Jules App</p>
          <p className="text-gray-600">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;