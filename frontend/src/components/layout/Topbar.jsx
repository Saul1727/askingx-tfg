import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LogOut, User } from 'lucide-react';
import { getUser, logout } from '../../services/authService';

/**
 * Topbar Component
 * Features search, project title, language switcher, and user profile.
 */
const Topbar = () => {
  // Get user info from authService
  const user = getUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-8 text-white relative">
      {/* Project Title */}
      <div className="flex items-center gap-4">
        <div className="text-xs text-slate-400 font-medium">
          <p>TFG</p>
          <p>Proyecto UPV</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-grow max-w-xl mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar Organizaciones, Asks, Givers o Dominio..."
            className="w-full bg-[#1e293b] border border-slate-700 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-6">
        <div className="text-xs font-medium space-x-2 text-slate-400">
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
            className="flex items-center gap-3 pl-6 border-l border-slate-700 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-700">
              {user ? getInitials(user.fullName) : '??'}
            </div>
            <span className="text-sm font-medium text-slate-200 group-hover:text-white">
              {user ? user.fullName : 'Invitado'}
            </span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                onClick={() => setIsDropdownOpen(false)}
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
  );
};

export default Topbar;
