import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layout/MainLayout';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes (Authenticated) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* Placeholder routes for other sidebar items */}
        <Route path="askers" element={<div className="p-8"><h2>Organizaciones</h2><p>Página en construcción...</p></div>} />
        <Route path="asks" element={<div className="p-8"><h2>Peticiones</h2><p>Página en construcción...</p></div>} />
        <Route path="stories" element={<div className="p-8"><h2>Historias de Impacto</h2><p>Página en construcción...</p></div>} />
        <Route path="settings" element={<div className="p-8"><h2>Configuración</h2><p>Página en construcción...</p></div>} />
        <Route path="admin/users" element={<div className="p-8"><h2>Administración de Usuarios</h2><p>Página en construcción...</p></div>} />
        <Route path="admin/conceptual" element={<div className="p-8"><h2>Conceptual</h2><p>Página en construcción...</p></div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
