import React, { useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiSettings,
  FiCalendar,
  FiFileText,
  FiBriefcase,
  FiX
} from 'react-icons/fi';
import './Sidebar.css';

// Componente memoizado para evitar renders innecesarios
const NavItem = memo(({ to, icon, label, isActive, onClose }) => (
  <li>
    <Link 
      to={to}
      className={`flex items-center p-3 hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
      onClick={onClose}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-xl mr-3">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  </li>
));

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Usar useCallback para memoizar la función de cierre
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
          className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <span className="text-xl font-bold text-white">Jules App</span>
          <button 
            onClick={handleClose}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                onClose={handleClose}
              />
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto p-4 text-xs text-gray-400 border-t border-gray-700">
          <p>© {new Date().getFullYear()} Jules App</p>
          <p className="text-gray-500">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;