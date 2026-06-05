import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Paperclip } from 'lucide-react';
import { getAppConfig, updateAppConfig } from '../../services/configService';
import { useConfig } from '../../context/ConfigContext';
import { useLanguage } from '../../context/LanguageContext';

const GlobalConfigPanel = () => {
  const { refreshConfig } = useConfig();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    installationName: '',
    platformUrl: '',
    logoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getAppConfig()
      .then(data => {
        setFormData(data);
      })
      .catch(err => {
        setMessage({ type: 'error', text: 'Error al cargar la configuración' });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setFormData({ ...formData, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateAppConfig(formData);
      await refreshConfig(); // Actualiza el contexto global
      setMessage({ type: 'success', text: t('admin.configSaved') });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al guardar.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">{t('admin.configInstall')}</h2>
      <p className="text-sm text-slate-500 mb-6">Modifica los datos globales de la plataforma. Estos cambios afectarán a todos los usuarios.</p>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.installName')} <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="installationName" 
            value={formData.installationName} 
            onChange={handleChange} 
            required 
            placeholder="Ej: AskingValencia"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
          />
          <p className="text-xs text-slate-500 mt-1">{t('admin.installHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.platformUrl')} <span className="text-red-500">*</span></label>
          <input 
            type="url" 
            name="platformUrl" 
            value={formData.platformUrl} 
            onChange={handleChange} 
            required 
            placeholder="Ej: https://valencia.askingx.org"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.logo')} <span className="text-red-500">*</span></label>
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => e.target.style.display = 'none'} />
              ) : (
                <span className="text-xs text-slate-400">{t('admin.noLogo')}</span>
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
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Paperclip size={16} /> Adjuntar Imagen
            </button>

            {formData.logoUrl && (
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, logoUrl: '' })}
                className="text-xs text-red-500 hover:underline"
              >
                Quitar
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Soporta JPG, PNG o GIF (Máx. 2MB). Se usará en la barra lateral.</p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? t('common.saving') : t('admin.saveConfig')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalConfigPanel;
