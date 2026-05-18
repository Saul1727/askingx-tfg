import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { createAsk } from '../../services/askService';

/**
 * CreateAskModal Component
 * Implements the "New Petition" (CU-01) form as a floating modal.
 * Connected to backend API with loading and error states.
 */
const CreateAskModal = ({ isOpen, onClose }) => {
  // Initial state for the form
  const initialFormData = {
    askerId: '',
    domainId: '',
    title: '',
    description: '',
    type: 'THINGS', // Default type
    quantityRequested: '',
    estimatedHours: '',
    serviceLocation: '',
    requiredSkill: '',
  };

  // State Management
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // If the modal is closed, don't render anything
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles the submission of the form to the backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Logic call to Backend Service
      await createAsk(formData);
      
      // Success feedback
      alert('¡Petición creada con éxito!');
      
      // Reset and close
      setFormData(initialFormData);
      onClose();
    } catch (err) {
      // Capture and display API or Connection errors
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={!isLoading ? onClose : null} // Prevent closing while saving
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md max-h-[90vh] rounded-xl shadow-2xl overflow-y-auto animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800">Nueva Petición</h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-4">
          
          {/* Error Message Box */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {/* Asker Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Organización (Asker)</label>
            <select 
              name="askerId" 
              value={formData.askerId} 
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400"
              required
            >
              <option value="">Seleccione una organización...</option>
              <option value="1">ONG Sonrisas</option>
              <option value="2">Refugio Animal</option>
              <option value="3">Ayuda Local</option>
            </select>
          </div>

          {/* Domain Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Dominio de Ayuda</label>
            <select 
              name="domainId" 
              value={formData.domainId} 
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400"
              required
            >
              <option value="">Seleccione un dominio...</option>
              <option value="1">Material Sanitario</option>
              <option value="2">Educación</option>
              <option value="3">Transportes</option>
              <option value="4">Alimentación</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Título de la Petición</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ej: Necesitamos 50 mascarillas"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-50"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Descripción detallada</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows="3"
              placeholder="Describe brevemente qué necesitas y por qué..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none disabled:bg-gray-50"
              required
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Tipo de Recurso</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-blue-700 disabled:text-blue-300"
              required
            >
              <option value="THINGS">COSAS (Materiales)</option>
              <option value="TIME">TIEMPO (Voluntariado)</option>
              <option value="EXPERTISE">CONOCIMIENTO (Asesoría)</option>
              <option value="SERVICES">SERVICIOS (Actividades)</option>
            </select>
          </div>

          {/* --- CONDITIONAL FIELDS (STI) --- */}

          {formData.type === 'THINGS' && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-600 uppercase">Cantidad Necesaria</label>
                <input 
                  type="number" 
                  name="quantityRequested"
                  value={formData.quantityRequested}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Ej: 50"
                  className="w-full px-4 py-2 rounded-lg border border-blue-100 outline-none text-sm"
                  required
                />
              </div>
            </div>
          )}

          {formData.type === 'TIME' && (
            <div className="p-4 bg-green-50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-green-600 uppercase">Horas Estimadas</label>
                <input 
                  type="number" 
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Ej: 4"
                  className="w-full px-4 py-2 rounded-lg border-green-100 outline-none text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-green-600 uppercase">Lugar del Servicio</label>
                <input 
                  type="text" 
                  name="serviceLocation"
                  value={formData.serviceLocation}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Ej: Valencia Centro"
                  className="w-full px-4 py-2 rounded-lg border-green-100 outline-none text-sm"
                  required
                />
              </div>
            </div>
          )}

          {(formData.type === 'EXPERTISE' || formData.type === 'SERVICES') && (
            <div className="p-4 bg-purple-50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-600 uppercase">Habilidad Requerida</label>
                <input 
                  type="text" 
                  name="requiredSkill"
                  value={formData.requiredSkill}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Ej: Programación, Cocina..."
                  className="w-full px-4 py-2 rounded-lg border-purple-100 outline-none text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-600 uppercase">Lugar del Servicio</label>
                <input 
                  type="text" 
                  name="serviceLocation"
                  value={formData.serviceLocation}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Ej: Remoto o Presencial"
                  className="w-full px-4 py-2 rounded-lg border-purple-100 outline-none text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              } text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Guardando...
                </>
              ) : (
                'Registrar Petición'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAskModal;
