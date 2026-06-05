import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  History, 
  Settings,
  KanbanSquare,
  LogOut,
  X
} from 'lucide-react';
import { logout } from '../../services/authService';
import { useConfig } from '../../context/ConfigContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Sidebar Component
 * Handles navigation with role-based visibility logic. Mobile-friendly.
 */
const Sidebar = ({ userRole = 'AUTHOR', isMobileOpen, setIsMobileOpen }) => {
  const { config } = useConfig();
  const { t } = useLanguage();
  const isAdmin = userRole === 'ADMIN';
  const isConnector = userRole === 'CONNECTOR';
  const isAuthorOrAdmin = userRole === 'AUTHOR' || isAdmin;
  const isConnectorOrAdmin = isConnector || isAdmin;

  const navItems = [
    { name: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard', show: true },
    { name: t('sidebar.kanban'), icon: <KanbanSquare size={20} />, path: '/connector/kanban', show: isConnectorOrAdmin },
    { name: t('sidebar.askers'), icon: <Building2 size={20} />, path: '/askers', show: isAuthorOrAdmin },
    { name: t('sidebar.asks'), icon: <FileText size={20} />, path: '/asks', show: isAuthorOrAdmin },
    { name: t('sidebar.stories'), icon: <History size={20} />, path: '/stories', show: true },
    { name: t('sidebar.settings'), icon: <Settings size={20} />, path: '/admin/configuration', show: isAdmin },
  ];

  const handleClose = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed md:relative z-50 w-64 bg-[#1e293b] text-slate-300 flex flex-col h-full h-screen transition-transform duration-300 ease-in-out shrink-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Logo & Mobile Close */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded shrink-0" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            ) : null}
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold shrink-0" style={{ display: config?.logoUrl ? 'none' : 'flex' }}>
              {config?.installationName ? config.installationName.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-xl font-bold text-white tracking-tight truncate">{config?.installationName || 'AskingX'}</span>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={handleClose}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => item.show && (
            <SidebarLink key={item.path} item={item} onClick={handleClose} />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto border-t border-slate-700">
          <button
            onClick={() => {
              if (window.confirm(t('confirmLogout'))) {
                logout();
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 w-full text-slate-300 hover:bg-red-500/10 hover:text-red-400 group"
          >
            <LogOut size={20} className="opacity-70 group-hover:opacity-100 shrink-0" />
            <span className="text-sm font-medium truncate">{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    <span className="opacity-70 group-hover:opacity-100 shrink-0">{item.icon}</span>
    <span className="text-sm font-medium truncate">{item.name}</span>
  </NavLink>
);

export default Sidebar;
