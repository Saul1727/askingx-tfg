import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layout/MainLayout';
import './App.css';

/**
 * Main Application Component
 * Defines the routing structure using React Router v7.
 * Separates public routes from protected routes wrapped in MainLayout.
 */
function App() {
  return (
    <Routes>
      {/* 
          PUBLIC ROUTES 
          Accessible without authentication.
      */}
      <Route path="/login" element={<Login />} />
      
      {/* 
          PROTECTED ROUTES 
          All these routes share the same Sidebar and Topbar via MainLayout.
          For the current development phase, specific role routes point to the same Dashboard component.
      */}
      <Route path="/" element={<MainLayout />}>
        
        {/* Default Redirection */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* --- ROLE-BASED ROUTES (Pending specific views) --- */}
        
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<Dashboard />} />
        <Route path="admin/users" element={<div className="p-8"><h2>Administración de Usuarios</h2><p>Página en construcción...</p></div>} />
        <Route path="admin/conceptual" element={<div className="p-8"><h2>Conceptual</h2><p>Página en construcción...</p></div>} />

        {/* Author Routes */}
        <Route path="author/asks" element={<Dashboard />} />

        {/* Connector Routes */}
        <Route path="connector/matches" element={<Dashboard />} />

        {/* Giver Routes */}
        <Route path="giver/history" element={<Dashboard />} />

        {/* --- GLOBAL PLACEHOLDERS (Sidebar Navigation) --- */}
        <Route path="askers" element={<div className="p-8"><h2>Organizaciones</h2><p>Página en construcción...</p></div>} />
        <Route path="asks" element={<div className="p-8"><h2>Peticiones</h2><p>Página en construcción...</p></div>} />
        <Route path="stories" element={<div className="p-8"><h2>Historias de Impacto</h2><p>Página en construcción...</p></div>} />
        <Route path="settings" element={<div className="p-8"><h2>Configuración</h2><p>Página en construcción...</p></div>} />
        
      </Route>

      {/* FALLBACK: Redirect any unknown path to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
