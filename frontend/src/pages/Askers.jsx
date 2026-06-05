import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Loader2, Mail, Phone, MapPin, X, Trash2, Search } from 'lucide-react';
import { getAskers, createAsker, deleteAsker } from '../services/askService';
import { useLanguage } from '../context/LanguageContext';

const Askers = () => {
  const { t } = useLanguage();
  const [askersList, setAskersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAskers = useCallback(() => {
    setIsLoading(true);
    getAskers()
      .then(setAskersList)
      .catch(err => console.error("Error cargando Askers:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchAskers();
  }, [fetchAskers]);

  const handleDelete = async (id, name, hasAsks) => {
    if (hasAsks > 0) {
      alert(t('askers.hasAsksError'));
      return;
    }

    if (window.confirm(t('askers.confirmDelete').replace('{name}', name))) {
      try {
        await deleteAsker(id);
        fetchAskers(); // Recargar la tabla automáticamente tras borrar
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filteredAskers = askersList.filter(asker => {
    const term = searchTerm.toLowerCase();
    return (
      (asker.organizationName && asker.organizationName.toLowerCase().includes(term)) ||
      (asker.contactPerson && asker.contactPerson.toLowerCase().includes(term)) ||
      (asker.email && asker.email.toLowerCase().includes(term)) ||
      (asker.phone && asker.phone.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('askers.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('askers.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> {t('askers.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={20} className="text-slate-500"/> {t('askers.registered')}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('askers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 bg-white text-slate-900 border border-slate-300 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">{t('askers.colOrg')}</th>
                <th className="py-4 px-6">{t('askers.colContact')}</th>
                <th className="py-4 px-6">{t('askers.colContactInfo')}</th>
                <th className="py-4 px-6 text-center">{t('askers.colAsks')}</th>
                <th className="py-4 px-6 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                  </td>
                </tr>
              ) : filteredAskers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                    {searchTerm ? t('askers.noSearch') : t('askers.empty')}
                  </td>
                </tr>
              ) : (
                filteredAskers.map((asker) => {
                  const askCount = asker.asks?.length || 0;
                  const displayName = asker.organizationName || 'Particular';

                  return (
                    <tr key={asker.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {asker.organizationName ? asker.organizationName : <span className="text-slate-400 italic px-2 py-1 bg-slate-100 rounded text-xs">{t('askers.individual')}</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{asker.contactPerson}</td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex flex-col gap-1">
                          {asker.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400"/> {asker.email}</span>}
                          {asker.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {asker.phone}</span>}
                          {asker.address && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400"/> {asker.address}</span>}
                          {!asker.email && !asker.phone && !asker.address && <span className="text-slate-300">-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full font-bold text-xs border border-blue-100">
                          {askCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {/* BOTÓN DE BORRAR */}
                        <button 
                          onClick={() => handleDelete(asker.id, displayName, askCount)}
                          disabled={askCount > 0}
                          title={askCount > 0 ? "No puedes borrarla porque tiene peticiones" : "Eliminar"}
                          className={`p-2 rounded-md transition-colors ${
                            askCount > 0 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-red-400 hover:text-red-600 hover:bg-red-50 opacity-50 group-hover:opacity-100'
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateAskerModal onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchAskers(); }} />
      )}
    </div>
  );
};

// --- SUB-COMPONENTE: MODAL DE CREACIÓN ---
const CreateAskerModal = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ contactPerson: '', organizationName: '', phone: '', email: '', address: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validación básica del email
    if (!formData.email) {
      setError(t('askers.emailRequired'));
      return;
    }

    if (formData.phone && !/^\+?\d{9,15}$/.test(formData.phone)) {
      setError(t('askers.phoneInvalid'));
      return;
    }

    setIsLoading(true);
    try {
      const payload = { 
        ...formData, 
        phone: formData.phone || undefined, 
        email: formData.email, 
        address: formData.address || undefined 
      };
      await createAsker(payload);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isLoading ? onClose : null} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">{t('askers.modalTitle')}</h2>
          <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t('askers.orgField')} <span className="text-red-500">*</span></label>
            <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required disabled={isLoading} placeholder={t('askers.orgPlaceholder')} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">{t('askers.orgHint')}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t('askers.contactField')} <span className="text-red-500">*</span></label>
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required disabled={isLoading} placeholder={t('askers.contactPlaceholder')} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 mt-2">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <div className="flex-1">
                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} placeholder={t('askers.emailPlaceholder')} className="w-full bg-white text-slate-900 px-3 py-2 rounded-md border border-slate-300 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-slate-400" />
              <input type="tel" name="phone" maxLength="15" value={formData.phone} onChange={handleChange} disabled={isLoading} placeholder={t('askers.phonePlaceholder')} className="w-full bg-white text-slate-900 px-3 py-2 rounded-md border border-slate-300 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-slate-400" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isLoading} placeholder={t('askers.addressPlaceholder')} className="w-full bg-white text-slate-900 px-3 py-2 rounded-md border border-slate-300 text-sm" />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-3"><span className="text-red-500">*</span> {t('common.required')}</p>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? t('common.saving') : t('askers.register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Askers;