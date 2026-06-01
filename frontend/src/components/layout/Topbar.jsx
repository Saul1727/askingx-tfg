import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { getUser, logout } from '../../services/authService';
import { useConfig } from '../../context/ConfigContext';
import ProfileModal from './ProfileModal';

/**
 * Topbar Component
 * Features search, project title, language switcher, and user profile.
 */
const Topbar = ({ onMenuClick }) => {
  const { config } = useConfig();
  // Get user info from authService
  const user = getUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Logic for initials (e.g., "Saúl G" -> "SG")
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 md:px-8 text-white relative shrink-0">
      
      {/* Mobile Menu Button & Project Title */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="text-sm md:text-base text-slate-300 font-bold truncate max-w-[120px] md:max-w-[150px]">
          <p>{config?.installationName || 'AskingX'}</p>
        </div>
      </div>

      <div className="flex-grow"></div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden sm:flex text-xs font-medium space-x-2 text-slate-400">
          <button className="text-blue-500 font-bold border-b border-blue-500 pb-0.5">ES</button>
          <span>|</span>
          <button className="hover:text-white transition-colors">CAT</button>
          <span>|</span>
          <button className="hover:text-white transition-colors">EN</button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 md:pl-6 md:border-l md:border-slate-700 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-700 shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user ? getInitials(user.fullName) : '??'
              )}
            </div>
            <span className="hidden md:inline-block text-sm font-medium text-slate-200 group-hover:text-white">
              {user ? user.fullName : 'Invitado'}
            </span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#1e293b] border border-slate-700 rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-700">
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
              </div>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => { setIsDropdownOpen(false); setIsProfileModalOpen(true); }}
              >
                <User size={16} />
                Mi Perfil
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default Topbar;
