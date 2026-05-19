import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { createAsk, updateAsk, getAskers, getDomains } from '../../services/askService';

const CreateAskModal = ({ isOpen, onClose, askToEdit = null }) => {
  const initialFormData = {
    askerId: '',
    domainId: '',
    title: '',
    description: '',
    type: 'THINGS',
    dueDate: '',
    quantityRequested: '',
    estimatedHours: '',
    serviceLocation: '',
    requiredSkill: '',
    status: 'CREATED' // 1. AÑADIDO ESTADO INICIAL
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [askersList, setAskersList] = useState([]);
  const [domainsList, setDomainsList] = useState([]);

  const isEditMode = !!askToEdit;

  // TRUCO SENIOR: Calculamos la fecha de hoy basándonos en tu ZONA HORARIA LOCAL
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;

  // Efecto para cargar listas y resetear/cargar datos del formulario
  useEffect(() => {
    if (isOpen) {
      // Cargar selectores
      getAskers().then(setAskersList).catch(err => console.error("Error Askers:", err));
      getDomains().then(setDomainsList).catch(err => console.error("Error Domains:", err));

      // Si estamos editando, rellenamos el formulario
      if (askToEdit) {
        setFormData({
          askerId: askToEdit.askerId || '',
          domainId: askToEdit.domainId || '',
          title: askToEdit.title || '',
          description: askToEdit.description || '',
          type: askToEdit.type || 'THINGS',
          dueDate: askToEdit.dueDate ? askToEdit.dueDate.split('T')[0] : '',
          quantityRequested: askToEdit.quantityRequested || '',
          estimatedHours: askToEdit.estimatedHours || '',
          serviceLocation: askToEdit.serviceLocation || '',
          requiredSkill: askToEdit.requiredSkill || '',
          status: askToEdit.status || 'CREATED' // 2. AÑADIDO ESTADO AL EDITAR
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, askToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        askerId: formData.askerId,
        domainId: formData.domainId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status // 3. AÑADIDO ESTADO AL PAYLOAD
      };

      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString();
      }

      // Lógica de campos especializados según el tipo
      if (formData.type === 'THINGS') {
        payload.quantityRequested = parseInt(formData.quantityRequested, 10);
      } else if (formData.type === 'TIME') {
        payload.estimatedHours = parseInt(formData.estimatedHours, 10);
        payload.serviceLocation = formData.serviceLocation;
      } else if (formData.type === 'EXPERTISE' || formData.type === 'SERVICES') {
        payload.requiredSkill = formData.requiredSkill;
        payload.serviceLocation = formData.serviceLocation;
      }

      if (isEditMode) {
        await updateAsk(askToEdit.id, payload);
        alert('¡Petición actualizada con éxito!');
      } else {
        await createAsk(payload);
        alert('¡Petición creada con éxito!');
      }
      
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isLoading ? onClose : null} />

      <div className="relative bg-white w-full max-w-md max-h-[90vh] rounded-xl shadow-2xl overflow-y-auto animate-in zoom-in duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Editar Petición' : 'Nueva Petición'}
          </h2>
          <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-30">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {/* Fíjate cómo ahora todos los inputs tienen bg-white, text-slate-900 y border-slate-300 */}
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Organización o Solicitante</label>
            <select name="askerId" value={formData.askerId} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required>
              <option value="">Seleccione una organización/persona...</option>
              {Array.isArray(askersList) && askersList.map(asker => {
                const displayName = asker.organizationName 
                  ? `${asker.organizationName} (${asker.contactPerson})` 
                  : asker.contactPerson;
                return (
                  <option key={asker.id} value={asker.id}>
                    {displayName || 'Sin Nombre'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Dominio de Ayuda</label>
            <select name="domainId" value={formData.domainId} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required>
              <option value="">Seleccione un dominio...</option>
              {Array.isArray(domainsList) && domainsList.map(domain => (
                <option key={domain.id} value={domain.id}>
                  {domain.name || 'Sin Nombre'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Título de la Petición</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} disabled={isLoading} placeholder="Ej: Necesitamos 50 mascarillas" className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} disabled={isLoading} placeholder="Añade los detalles de la petición..." rows="3" className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Fecha Límite (Opcional)</label>
            <input 
              type="date" 
              name="dueDate" 
              value={formData.dueDate} 
              onChange={handleChange} 
              disabled={isLoading} 
              min={localToday} 
              className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Tipo de Recurso</label>
            <select name="type" value={formData.type} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-blue-700 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" required>
              <option value="THINGS">COSAS (Materiales)</option>
              <option value="TIME">TIEMPO (Voluntariado)</option>
              <option value="EXPERTISE">CONOCIMIENTO (Asesoría)</option>
              <option value="SERVICES">SERVICIOS (Actividades)</option>
            </select>
          </div>

          {formData.type === 'THINGS' && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <label className="text-xs font-bold text-blue-700 uppercase">Cantidad Necesaria</label>
              <input type="number" name="quantityRequested" value={formData.quantityRequested} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
            </div>
          )}

          {formData.type === 'TIME' && (
            <div className="p-4 bg-green-50 rounded-lg space-y-3">
              <label className="text-xs font-bold text-green-700 uppercase">Horas Estimadas</label>
              <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 outline-none text-sm mb-3" required />
              
              <label className="text-xs font-bold text-green-700 uppercase block mt-3">Lugar del Servicio</label>
              <input type="text" name="serviceLocation" value={formData.serviceLocation} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 outline-none text-sm" required />
            </div>
          )}

          {(formData.type === 'EXPERTISE' || formData.type === 'SERVICES') && (
            <div className="p-4 bg-purple-50 rounded-lg space-y-3">
              <label className="text-xs font-bold text-purple-700 uppercase">Habilidad Requerida</label>
              <input type="text" name="requiredSkill" value={formData.requiredSkill} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm mb-3" required />
              
              <label className="text-xs font-bold text-purple-700 uppercase block mt-3">Lugar del Servicio</label>
              <input type="text" name="serviceLocation" value={formData.serviceLocation} onChange={handleChange} disabled={isLoading} className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm" required />
            </div>
          )}

          {/* 4. AÑADIDO SELECTOR DE ESTADO (Solo visible al editar) */}
          {isEditMode && (
            <div className="p-4 bg-slate-100 rounded-lg space-y-1.5 border border-slate-200">
              <label className="text-xs font-bold text-slate-700 uppercase">Estado de la Petición</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                disabled={isLoading} 
                className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
              >
                <option value="CREATED">CREADA (En borrador/revisión)</option>
                <option value="OPEN">ABIERTA (Buscando voluntarios)</option>
                <option value="FULFILLED">COMPLETADA (Ayuda entregada)</option>
                <option value="CANCELLED">CANCELADA</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                * Para que los Connectors puedan buscar voluntarios, el estado debe ser ABIERTA.
              </p>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className={`w-full ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'} text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2`}>
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> Guardando...</>
              ) : (
                isEditMode ? 'Guardar Cambios' : 'Registrar Petición'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAskModal;