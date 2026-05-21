import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * MainLayout Component
 * Global architecture containing Sidebar, Topbar, and a dynamic content area.
 */
const MainLayout = () => {
  // Get user info from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user?.role || 'AUTHOR'; // Fallback to AUTHOR if not found

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Container */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Fixed Topbar */}
        <Topbar />

        {/* Dynamic Content Scrollable */}
        <main className="flex-grow overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
