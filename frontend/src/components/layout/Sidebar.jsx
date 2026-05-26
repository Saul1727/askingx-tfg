import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  History, 
  Settings, 
  Users, 
  Layers,
  KanbanSquare,
  LogOut
} from 'lucide-react';
import { logout } from '../../services/authService';

/**
 * Sidebar Component
 * Handles navigation with role-based visibility logic.
 */
const Sidebar = ({ userRole = 'AUTHOR' }) => {
  const isAdmin = userRole === 'ADMIN';
  const isConnector = userRole === 'CONNECTOR';
  const isAuthorOrAdmin = userRole === 'AUTHOR' || isAdmin;
  const isConnectorOrAdmin = isConnector || isAdmin;

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', show: true },
    { name: 'Tablero (Kanban)', icon: <KanbanSquare size={20} />, path: '/connector/kanban', show: isConnectorOrAdmin },
    { name: 'Organizaciones (Askers)', icon: <Building2 size={20} />, path: '/askers', show: isAuthorOrAdmin },
    { name: 'Peticiones (Asks)', icon: <FileText size={20} />, path: '/asks', show: isAuthorOrAdmin },
    { name: 'Historias de Impacto', icon: <History size={20} />, path: '/stories', show: true },
    { name: 'Configuración', icon: <Settings size={20} />, path: '/settings', show: true },
  ];

  const adminItems = [
    { name: 'Usuarios', icon: <Users size={20} />, path: '/admin/users', show: isAdmin },
    { name: 'Conceptual (concectiva)', icon: <Layers size={20} />, path: '/admin/conceptual', show: isAdmin },
  ];

  return (
    <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col min-h-screen">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">A</div>
        <span className="text-xl font-bold text-white tracking-tight">AskingX</span>
      </div>

      <nav className="flex-grow px-3 py-4 space-y-1">
        {navItems.map((item) => item.show && (
          <SidebarLink key={item.path} item={item} />
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-8 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin
          </div>
        )}
        {adminItems.map((item) => item.show && (
          <SidebarLink key={item.path} item={item} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-slate-700">
        <button 
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
              logout();
            }
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 w-full text-slate-300 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut size={20} className="opacity-70 group-hover:opacity-100" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ item }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    <span className="opacity-70 group-hover:opacity-100">{item.icon}</span>
    <span className="text-sm font-medium">{item.name}</span>
  </NavLink>
);

export default Sidebar;
