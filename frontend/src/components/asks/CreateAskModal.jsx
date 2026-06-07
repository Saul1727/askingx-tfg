import React, { useState, useEffect } from 'react';
import { X, Loader2, ClipboardList } from 'lucide-react';
import { getAllAsks, getAskers, getDomains, createAsk, updateAsk } from '../../services/askService';
import { getUser } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

/**
 * CreateAskModal Component
 * 
 * A polymorphic modal used for both creating and editing help requests (Asks).
 * It dynamically adapts its fields based on the selected resource type (STI).
 */
const CreateAskModal = ({ isOpen, onClose, onAskCreated, askToEdit = null }) => {
  const { t } = useLanguage();
  const isEditMode = !!askToEdit;
  const [isLoading, setIsLoading] = useState(false);
  const [askers, setAskers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [error, setError] = useState(null);

  // Initial state based on whether we are creating or editing
  const [formData, setFormData] = useState({
    askerId: '',
    domainId: '',
    title: '',
    description: '',
    type: 'THINGS',
    dueDate: '',
    quantityRequested: '',
    estimatedHours: '',
    requiredSkill: '',
    serviceLocation: '',
    status: 'CREATED'
  });

  // 1. Fetch auxiliary data (Askers and Domains) when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const user = getUser();
      Promise.all([getAskers(user?.id), getDomains()])
        .then(([askersData, domainsData]) => {
          setAskers(askersData);
          setDomains(domainsData);
          
          // 2. If editing, populate form with existing data
          if (askToEdit) {
            setFormData({
              askerId: askToEdit.askerId || '',
              domainId: askToEdit.domainId || '',
              title: askToEdit.title || '',
              description: askToEdit.description || '',
              type: askToEdit.type || 'THINGS',
              dueDate: askToEdit.dueDate ? new Date(askToEdit.dueDate).toISOString().split('T')[0] : '',
              quantityRequested: askToEdit.quantityRequested || '',
              estimatedHours: askToEdit.estimatedHours || '',
              requiredSkill: askToEdit.requiredSkill || '',
              serviceLocation: askToEdit.serviceLocation || '',
              status: askToEdit.status || 'CREATED'
            });
          } else {
            // Reset for new creation
            setFormData({
              askerId: '', domainId: '', title: '', description: '',
              type: 'THINGS', dueDate: '', quantityRequested: '',
              estimatedHours: '', requiredSkill: '', serviceLocation: '',
              status: 'CREATED'
            });
          }
        })
        .catch(err => setError('Error al cargar datos auxiliares'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, askToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Data normalization before sending
      const payload = { ...formData };

      if (payload.quantityRequested) payload.quantityRequested = parseInt(payload.quantityRequested, 10);
      else delete payload.quantityRequested;

      if (payload.estimatedHours) payload.estimatedHours = parseInt(payload.estimatedHours, 10);
      else delete payload.estimatedHours;

      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();
      else delete payload.dueDate;

      if (!payload.requiredSkill) delete payload.requiredSkill;
      if (!payload.serviceLocation) delete payload.serviceLocation;

      if (isEditMode) {
        await updateAsk(askToEdit.id, payload);
      } else {
        await createAsk(payload);
      }

      onAskCreated(); // Callback to refresh parent list
      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la petición');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Lógica de filtrado de estados según ROL y ESTADO ACTUAL
  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';
  
  const getStatusOptions = () => {
    const currentStatus = askToEdit?.status || 'CREATED';

    if (isAdmin) {
      return [
        { value: 'CREATED', label: t('askModal.optCreatedAdmin') },
        { value: 'OPEN', label: t('askModal.optOpenAdmin') },
        { value: 'MATCHED', label: t('askModal.optMatchedAdmin') },
        { value: 'FULFILLED', label: t('askModal.optFulfilledAdmin') },
        { value: 'CANCELLED', label: t('askModal.optCancelled') },
      ];
    }

    const options = [];
    if (currentStatus === 'CREATED') {
      options.push({ value: 'CREATED', label: t('askModal.optCreatedDraft') });
      options.push({ value: 'OPEN', label: t('askModal.optOpenPublish') });
      options.push({ value: 'CANCELLED', label: t('askModal.optCancelAction') });
    } else if (currentStatus === 'OPEN') {
      options.push({ value: 'OPEN', label: t('askModal.optOpenSearching') });
      options.push({ value: 'CREATED', label: t('askModal.optReturnDraft') });
      options.push({ value: 'CANCELLED', label: t('askModal.optCancelAction') });
    } else {
      const labelMap = {
        'MATCHED': t('askModal.optMatchedLabel'),
        'FULFILLED': t('askModal.optFulfilledAdmin'),
        'CANCELLED': t('askModal.optCancelled'),
        'EXPIRED': t('askModal.optExpired'),
      };
      options.push({ value: currentStatus, label: labelMap[currentStatus] || currentStatus });
    }
    return options;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isLoading ? onClose : null} />

      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{isEditMode ? t('askModal.editTitle') : t('askModal.createTitle')}</h2>
              <p className="text-xs text-slate-500">{isEditMode ? t('askModal.editSub') : t('askModal.createSub')}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-30">
            <X size={20} />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form id="ask-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Fila 1: Organización y Dominio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t('askModal.org')} <span className="text-red-500">*</span></label>
                <select name="askerId" value={formData.askerId} onChange={handleChange} disabled={isLoading || isEditMode} className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" required>
                  <option value="">{t('askModal.selectOrg')}</option>
                  {askers.map(asker => (
                    <option key={asker.id} value={asker.id}>{asker.organizationName || asker.contactPerson}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t('askModal.domain')} <span className="text-red-500">*</span></label>
                <select name="domainId" value={formData.domainId} onChange={handleChange} disabled={isLoading} className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" required>
                  <option value="">{t('askModal.selectDomain')}</option>
                  {domains.map(domain => (
                    <option key={domain.id} value={domain.id}>{domain.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2: Título */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">{t('askModal.askTitle')} <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} disabled={isLoading} placeholder={t('askModal.titlePlaceholder')} className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" required />
            </div>

            {/* Fila 3: Descripción */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">{t('askModal.description')}</label>
              <textarea name="description" value={formData.description} onChange={handleChange} disabled={isLoading} rows="3" placeholder={t('askModal.descPlaceholder')} className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all resize-none"></textarea>
            </div>

            {/* Fila 4: Tipo de Recurso y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t('askModal.helpType')} <span className="text-red-500">*</span></label>
                <select name="type" value={formData.type} onChange={handleChange} disabled={isLoading || isEditMode} className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all font-bold" required>
                  <option value="THINGS">{t('askModal.typeThings')}</option>
                  <option value="TIME">{t('askModal.typeTime')}</option>
                  <option value="EXPERTISE">{t('askModal.typeExpertise')}</option>
                  <option value="SERVICES">{t('askModal.typeServices')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t('askModal.dueDate')}</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} disabled={isLoading} min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
              </div>
            </div>

            {/* Campos Dinámicos según Tipo (STI) */}
            <div className="space-y-4">
              {formData.type === 'THINGS' && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-3 border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase">{t('askModal.quantity')} <span className="text-red-500">*</span></label>
                  <input type="number" name="quantityRequested" value={formData.quantityRequested} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required min="1" />
                </div>
              )}

              {formData.type === 'TIME' && (
                <div className="p-4 bg-green-50 rounded-lg space-y-3 border border-green-100">
                  <label className="text-xs font-bold text-green-700 uppercase">{t('askModal.hours')} <span className="text-red-500">*</span></label>
                  <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 outline-none text-sm" required min="1" />

                  <label className="text-xs font-bold text-green-700 uppercase block">{t('askModal.location')} <span className="text-red-500">*</span></label>
                  <input type="text" name="serviceLocation" value={formData.serviceLocation} onChange={handleChange} disabled={isLoading} placeholder={t('askModal.locationPlaceholder')} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 outline-none text-sm" required />
                </div>
              )}

              {(formData.type === 'EXPERTISE' || formData.type === 'SERVICES') && (
                <div className="p-4 bg-purple-50 rounded-lg space-y-3 border border-purple-100">
                  <label className="text-xs font-bold text-purple-700 uppercase">{t('askModal.skill')} <span className="text-red-500">*</span></label>
                  <input type="text" name="requiredSkill" value={formData.requiredSkill} onChange={handleChange} disabled={isLoading} placeholder={t('askModal.skillPlaceholder')} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm" required />

                  <label className="text-xs font-bold text-purple-700 uppercase block">{t('askModal.location')} <span className="text-red-500">*</span></label>
                  <input type="text" name="serviceLocation" value={formData.serviceLocation} onChange={handleChange} disabled={isLoading} placeholder={t('askModal.remotePlaceholder')} className="w-full bg-white text-slate-900 px-4 py-2.5 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm" required />
                </div>
              )}
            </div>

            {/* Selector de Estado Dinámico (Solo en Edición) */}
            {isEditMode && (
              <div className="p-4 bg-slate-100 rounded-lg space-y-2 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase">{t('askModal.statusLabel')} <span className="text-red-500">*</span></label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  disabled={isLoading || (!isAdmin && (askToEdit?.status === 'MATCHED' || askToEdit?.status === 'FULFILLED'))} 
                  className="w-full bg-white text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {getStatusOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 leading-tight italic">
                  {isAdmin ? t('askModal.adminHint') : t('askModal.authorHint')}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button type="submit" form="ask-form" disabled={isLoading} className={`flex-[2] ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-100 transition-all flex justify-center items-center gap-2`}>
            {isLoading ? <><Loader2 className="animate-spin" size={20} /> {t('common.saving')}</> : (isEditMode ? t('common.saveChanges') : t('askModal.register'))}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAskModal;