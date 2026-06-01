import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Save, User, KeyRound, Image as ImageIcon, Paperclip } from 'lucide-react';
import { updateUserProfile, changePassword } from '../../services/userService';
import { getUser } from '../../services/authService';

const ProfileModal = ({ isOpen, onClose }) => {
  const user = getUser();
  
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    avatarUrl: user?.avatarUrl || ''
  });
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && user) {
      setProfileData({
        fullName: user.fullName || '',
        avatarUrl: user.avatarUrl || ''
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: '', text: '' });
      setActiveTab('profile');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setMessage({ type: 'error', text: 'La imagen no debe superar los 2MB.'});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatarUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedUser = await updateUserProfile(profileData);
      
      // Update local storage user data
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));
      
      setMessage({ type: 'success', text: 'Perfil actualizado con éxito. Los cambios se verán reflejados en breve.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      setIsLoading(false);
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Contraseña cambiada con éxito.' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isLoading ? onClose : null} />

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-50 border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User size={24} className="text-blue-600" />
            Mi Perfil
          </h2>
          <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700 disabled:opacity-30">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          <button 
            type="button"
            className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
          >
            <ImageIcon size={16} /> Datos
          </button>
          <button 
            type="button"
            className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
          >
            <KeyRound size={16} /> Contraseña
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombre de Visualización <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={profileData.fullName} 
                  onChange={handleProfileChange} 
                  disabled={isLoading} 
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Foto de Perfil</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-slate-300" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Paperclip size={16} /> Adjuntar
                  </button>
                  {profileData.avatarUrl && (
                    <button 
                      type="button" 
                      onClick={() => setProfileData({ ...profileData, avatarUrl: '' })}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Soporta JPG, PNG o GIF (Máx. 2MB)</p>
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar Perfil
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Contraseña Actual <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  name="oldPassword" 
                  value={passwordData.oldPassword} 
                  onChange={handlePasswordChange} 
                  disabled={isLoading} 
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nueva Contraseña <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange} 
                  disabled={isLoading} 
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                  required 
                  minLength={8}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Confirmar Nueva Contraseña <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange} 
                  disabled={isLoading} 
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                  required 
                  minLength={8}
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Cambiar Contraseña
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;