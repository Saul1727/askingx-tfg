import React, { useState } from 'react';
import { X, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { resetUserPassword } from '../../services/userService';

const ChangePasswordModal = ({ isOpen, onClose, user }) => {
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
      // Usamos el servicio de resetUserPassword enviando solo la password
      await resetUserPassword(user.id, newPassword);
      setSuccess(true);
      // Cerramos tras un breve delay para que vean el éxito
      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña.');
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
            <ShieldCheck className="text-blue-600" size={24} />
            Gestionar Acceso
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <ShieldCheck size={32} />
            </div>
            <p className="text-green-700 font-bold">¡Contraseña actualizada!</p>
            <p className="text-xs text-slate-500">Cerrando ventana...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Usuario</p>
              <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nueva Contraseña Temporal <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !newPassword}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Actualizar'}
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
