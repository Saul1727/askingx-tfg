import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

/**
 * Topbar Component
 * Features search, project title, language switcher, and user profile.
 */
const Topbar = () => {
  // Get user info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  
  // Logic for initials (e.g., "Saúl G" -> "SG")
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-8 text-white">
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

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-700 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-700">
            {user ? getInitials(user.fullName) : '??'}
          </div>
          <span className="text-sm font-medium text-slate-200 group-hover:text-white">
            {user ? user.fullName : 'Invitado'}
          </span>
          <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
