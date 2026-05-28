import React, { useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { updateUser } from '../../services/userService';
import ChangePasswordModal from './ChangePasswordModal';

const UserTable = ({ users, isLoading, onUserUpdate }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-center py-8 text-slate-500">No se encontraron usuarios.</div>;
  }

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm("El usuario perderá el acceso, pero su historial se mantendrá. ¿Deseas continuar?")) {
      try {
        await updateUser(userId, { isActive: false });
        onUserUpdate(); // Refresh the list
      } catch (error) {
        alert(`Error al desactivar el usuario: ${error.message}`);
      }
    }
  };

  const getStatusPill = (isActive) => {
    return isActive 
      ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Activo</span>
      : <span className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full">Inactivo</span>;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Usuario</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre Completo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Idioma</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{user.id.substring(0, 8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.preferredLanguage}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusPill(user.isActive)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleOpenPasswordModal(user)}
                    className="text-slate-600 hover:text-blue-600 transition-colors" 
                    title="Ver/Cambiar contraseña"
                  >
                    <Eye size={18} />
                  </button>
                  {user.isActive && (
                    <button 
                      onClick={() => handleDeactivate(user.id)}
                      className="ml-4 text-slate-600 hover:text-red-600 transition-colors" 
                      title="Desactivar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        user={selectedUser} 
      />
    </>
  );
};

export default UserTable;
