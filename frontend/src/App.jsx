import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import './App.css';
import Askers from './pages/Askers';
import Asks from './pages/Asks'; 
import ConnectorKanban from './pages/ConnectorKanban';
import AdminConfiguration from './pages/Admin/Configuration';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagementPanel from './components/admin/UserManagementPanel';
import DomainManagementPanel from './components/admin/DomainManagementPanel';

/**
 * Main Application Component
 * Separates public routes from protected routes wrapped in MainLayout.
 */
function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES 
          Accessible without authentication.
      */}
      <Route path="/login" element={<Login />} />
      
      {/* PROTECTED ROUTES 
          All these routes share the same Sidebar and Topbar via MainLayout.
          For the current development phase, specific role routes point to the same Dashboard component.
      */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          
          {/* Default Redirection */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ROLE-BASED ROUTES (Pending specific views)*/}
          
          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/configuration" element={<AdminConfiguration />} />
          
          {/* Admin Management Pages */}
          <Route path="admin/users" element={<div className="p-8 bg-slate-50 min-h-full"><UserManagementPanel /></div>} />
          <Route path="admin/conceptual" element={<div className="p-8 bg-slate-50 min-h-full"><DomainManagementPanel /></div>} />

          {/* Author Routes */}
          <Route path="author/asks" element={<Dashboard />} />


          {/* Connector Routes */}
          <Route path="connector/kanban" element={<ConnectorKanban />} />

          {/* Giver Routes */}
          <Route path="giver/history" element={<Dashboard />} />

          {/*GLOBAL PLACEHOLDERS (Sidebar Navigation) */}
          <Route path="askers" element={<Askers />} />
          
          <Route path="asks" element={<Asks />} />
          <Route path="stories" element={<div className="p-8"><h2>Historias de Impacto</h2><p>Página en construcción...</p></div>} />
          <Route path="settings" element={<div className="p-8"><h2>Configuración</h2><p>Página en construcción...</p></div>} />
          
        </Route>
      </Route>

      {/* FALLBACK: Redirect any unknown path to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;