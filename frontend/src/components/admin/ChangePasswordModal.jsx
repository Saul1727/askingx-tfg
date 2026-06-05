import React, { useState } from 'react';
import { X, Loader2, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { resetUserPassword, updateUser } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';

const ChangePasswordModal = ({ isOpen, onClose, user, isReactivation = false, onSuccess }) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleClose = () => {
    setNewPassword('');
    setShowPassword(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Establecemos la nueva contraseña
      await resetUserPassword(user.id, newPassword);
      // En modo reactivación, además volvemos a activar al usuario (isActive: true)
      if (isReactivation) {
        await updateUser(user.id, { isActive: true });
      }
      setSuccess(true);
      if (onSuccess) onSuccess(); // refresca la tabla de usuarios
      // Cerramos tras un breve delay para que vean el éxito
      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {isReactivation ? <UserCheck className="text-green-600" size={24} /> : <ShieldCheck className="text-blue-600" size={24} />}
            {isReactivation ? t('changePassword.reactivate') : t('changePassword.manage')}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              {isReactivation ? <UserCheck size={32} /> : <ShieldCheck size={32} />}
            </div>
            <p className="text-green-700 font-bold">{isReactivation ? t('changePassword.reactivated') : t('changePassword.updated')}</p>
            <p className="text-xs text-slate-500">{t('changePassword.closing')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">{t('changePassword.user')}</p>
              <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{isReactivation ? t('changePassword.newPasswordReactivate') : t('changePassword.newPasswordTemp')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('changePassword.minChars')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}

            <div>
              <p className="text-xs text-slate-500 mb-3"><span className="text-red-500">*</span> Campos obligatorios</p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleClose} 
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newPassword}
                  className={`flex-1 py-2.5 text-white rounded-lg font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg ${isReactivation ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isReactivation ? t('changePassword.reactivateBtn') : t('changePassword.update'))}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
