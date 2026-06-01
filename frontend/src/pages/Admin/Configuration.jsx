import React, { useState } from 'react';
import { Users, Shield, Settings } from 'lucide-react';
import UserManagementPanel from '../../components/admin/UserManagementPanel';
import DomainManagementPanel from '../../components/admin/DomainManagementPanel';
import GlobalConfigPanel from '../../components/admin/GlobalConfigPanel';

/**
 * AdminConfiguration Page
 */
const AdminConfiguration = () => {
  // State to track the currently active tab
  const [activeTab, setActiveTab] = useState('users');

  /**
   * Renders the content panel based on the active tab.
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementPanel />;
      case 'domains':
        return <DomainManagementPanel />;
      case 'global':
        return <GlobalConfigPanel />;
      default:
        return <UserManagementPanel />;
    }
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500">
      {/* Secondary Sidebar for navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Configuración
        </h2>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <Users size={18} />
            <span>Usuarios y Donantes</span>
          </button>
          <button 
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'domains' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <Shield size={18} />
            <span>Dominios Temáticos</span>
          </button>
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'global' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <Settings size={18} />
            <span>Configuración Global</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-slate-50 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminConfiguration;
