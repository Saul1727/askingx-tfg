import React, { useState } from 'react';
import { Trash2, Eye, UserCheck, Tags } from 'lucide-react';
import { updateUser } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import ChangePasswordModal from './ChangePasswordModal';
import EditDomainsModal from './EditDomainsModal';

const UserTable = ({ users, isLoading, onUserUpdate }) => {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [reactivationMode, setReactivationMode] = useState(false);
  const [domainsUser, setDomainsUser] = useState(null);
  const [isDomainsModalOpen, setIsDomainsModalOpen] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-center py-8 text-slate-500">{t('admin.noUsers')}</div>;
  }

  const handleOpenPasswordModal = (user, isReactivation = false) => {
    setSelectedUser(user);
    setReactivationMode(isReactivation);
    setIsPasswordModalOpen(true);
  };

  const handleOpenDomainsModal = (user) => {
    setDomainsUser(user);
    setIsDomainsModalOpen(true);
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm(t('admin.confirmDeactivate'))) {
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
      ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{t('admin.active')}</span>
      : <span className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full">{t('admin.inactive')}</span>;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.colId')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.colName')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.colEmail')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.colRole')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.colLang')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('admin.colState')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('common.actions')}</th>
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
                    title={t('admin.changePassword')}
                  >
                    <Eye size={18} />
                  </button>
                  {(user.role === 'CONNECTOR' || user.role === 'GIVER') && (
                    <button
                      onClick={() => handleOpenDomainsModal(user)}
                      className="ml-4 text-slate-600 hover:text-blue-600 transition-colors"
                      title="Editar dominios"
                    >
                      <Tags size={18} />
                    </button>
                  )}
                  {user.isActive ? (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="ml-4 text-slate-600 hover:text-red-600 transition-colors"
                      title={t('admin.deactivate')}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPasswordModal(user, true)}
                      className="ml-4 text-slate-600 hover:text-green-600 transition-colors"
                      title={t('admin.reactivate')}
                    >
                      <UserCheck size={18} />
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
        isReactivation={reactivationMode}
        onSuccess={onUserUpdate}
      />

      <EditDomainsModal
        isOpen={isDomainsModalOpen}
        onClose={() => setIsDomainsModalOpen(false)}
        user={domainsUser}
        onUpdated={onUserUpdate}
      />
    </>
  );
};

export default UserTable;
