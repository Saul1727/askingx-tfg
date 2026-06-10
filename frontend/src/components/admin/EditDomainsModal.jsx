import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateUser } from '../../services/userService';
import { getDomains } from '../../services/askService';

/**
 * EditDomainsModal
 *
 * Permite al ADMIN editar los dominios (especialidades) de un usuario
 * con rol CONNECTOR o GIVER. Estos roles deben mantener siempre al menos
 * un dominio asociado, por lo que el formulario impide guardar una
 * selección vacía.
 */
const EditDomainsModal = ({ isOpen, onClose, user, onUpdated }) => {
  const [domains, setDomains] = useState([]);
  const [selectedDomainIds, setSelectedDomainIds] = useState([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      // Preseleccionamos los dominios actuales del usuario
      setSelectedDomainIds((user.specialties || []).map((d) => d.id));
      setError(null);

      const fetchDomains = async () => {
        setIsLoadingDomains(true);
        try {
          const data = await getDomains();
          setDomains(data);
        } catch (err) {
          console.error('Error fetching domains:', err);
        } finally {
          setIsLoadingDomains(false);
        }
      };
      fetchDomains();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const toggleDomain = (id) => {
    setSelectedDomainIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedDomainIds.length === 0) {
      setError('Este rol debe mantener al menos un dominio.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(user.id, { domainIds: selectedDomainIds });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-800">Editar dominios</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {user.fullName} <span className="text-slate-400">({user.role})</span>
        </p>

        <form onSubmit={handleSubmit}>
          {isLoadingDomains ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Cargando dominios...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
              {domains.map((domain) => (
                <label
                  key={domain.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white p-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDomainIds.includes(domain.id)}
                    onChange={() => toggleDomain(domain.id)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{domain.name}</span>
                </label>
              ))}
              {domains.length === 0 && (
                <p className="text-xs text-slate-400 italic">No hay dominios disponibles.</p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={18} className="animate-spin" />}
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDomainsModal;
