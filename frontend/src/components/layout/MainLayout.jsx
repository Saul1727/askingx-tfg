import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getUser } from '../../services/authService';

/**
 * MainLayout Component
 * Global architecture containing Sidebar, Topbar, and a dynamic content area.
 */
const MainLayout = () => {
  // Get user info from localStorage
  const user = getUser();
  const userRole = user?.role || 'AUTHOR'; // Fallback to AUTHOR if not found
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar Container - Handled inside Sidebar component using isMobileMenuOpen */}
      <Sidebar userRole={userRole} isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      {/* Main Container */}
      <div className="flex-grow flex flex-col h-full overflow-x-hidden relative w-full">
        {/* Fixed Topbar */}
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Content Scrollable */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
