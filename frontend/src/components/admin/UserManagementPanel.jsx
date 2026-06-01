import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { getAllUsers } from '../../services/userService';
import UserTable from './UserTable';
import CreateUserModal from './CreateUserModal';

/**
 * UserManagementPanel Component
 *
 * @description
 * This component serves as the main panel for user management within the admin configuration page.
 * It handles fetching the list of users, displaying them in a table, and managing
 * the creation of new users via a modal.
 */
const UserManagementPanel = () => {
  // State for storing the list of users
  const [users, setUsers] = useState([]);
  // State to handle loading status during data fetching
  const [isLoading, setIsLoading] = useState(true);
  // State to store any potential errors during API calls
  const [error, setError] = useState(null);
  // State to control the visibility of the "Create User" modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Fetches all users from the server and updates the component's state.
   * Wrapped in useCallback to prevent re-creation on every render,
   * making it safe to use in the useEffect dependency array.
   */
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null); // Reset error state on new fetch
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      // Set a user-friendly error message
      setError(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect hook to fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (user.fullName && user.fullName.toLowerCase().includes(term)) ||
           (user.email && user.email.toLowerCase().includes(term)) ||
           (user.role && user.role.toLowerCase().includes(term));
  });

  return (
    <>
      <div>
        {/* Header section for the panel */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión Integral de Usuarios y Donantes</h1>
            <p className="text-slate-500 mt-1">Crea, edita y gestiona los roles de los miembros del equipo.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar usuario, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-white text-slate-900 border border-slate-300 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Crear Nuevo Usuario
            </button>
          </div>
        </div>
        
        {/* Main content area for the user table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
          {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
          <UserTable users={filteredUsers} isLoading={isLoading} onUserUpdate={fetchUsers} />
        </div>
      </div>

      {/* Modal for creating a new user */}
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </>
  );
};

export default UserManagementPanel;
