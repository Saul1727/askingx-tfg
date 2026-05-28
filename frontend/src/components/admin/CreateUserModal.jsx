import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createUser } from '../../services/userService';
import { getDomains } from '../../services/askService';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('GIVER');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for domains
  const [domains, setDomains] = useState([]);
  const [selectedDomainIds, setSelectedDomainIds] = useState([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(false);

  // Fetch domains when modal opens
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset form on close
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('GIVER');
    setSelectedDomainIds([]);
    setError(null);
    setIsLoading(false);
    onClose();
  }

  const toggleDomain = (id) => {
    if (selectedDomainIds.includes(id)) {
      setSelectedDomainIds(selectedDomainIds.filter(domainId => domainId !== id));
    } else {
      setSelectedDomainIds([...selectedDomainIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !role) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    // Validar que si es GIVER o CONNECTOR, tenga al menos un dominio
    if ((role === 'GIVER' || role === 'CONNECTOR') && selectedDomainIds.length === 0) {
      setError('Debes seleccionar al menos un dominio para este rol.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await createUser({ 
        fullName, 
        email, 
        password, 
        role,
        domainIds: selectedDomainIds 
      });
      onUserCreated(); // Callback to refresh user list
      handleClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const needsDomain = role === 'GIVER' || role === 'CONNECTOR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
          <h2 className="text-xl font-bold text-slate-800">Crear Nuevo Usuario</h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña Temporal</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                required
                minLength="8"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">Rol</label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value !== 'GIVER' && e.target.value !== 'CONNECTOR') {
                    setSelectedDomainIds([]);
                  }
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-slate-900"
              >
                <option value="GIVER">GIVER (Voluntario)</option>
                <option value="AUTHOR">AUTHOR (Gestor de peticiones)</option>
                <option value="CONNECTOR">CONNECTOR (Validador)</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {/* Selector de Dominios (Solo para GIVER y CONNECTOR) */}
            {needsDomain && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Especialidades / Dominios
                </label>
                {isLoadingDomains ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                    <Loader2 size={16} className="animate-spin" /> Cargando dominios...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
                    {domains.map(domain => (
                      <label key={domain.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-1 rounded transition-colors">
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
                      <p className="text-xs text-slate-400 italic">No hay dominios disponibles. Créalos primero en la sección Conceptual.</p>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  * Selecciona las áreas en las que este usuario puede ayudar o conectar.
                </p>
              </div>
            )}
          </div>
          
          {error && <p className="mt-4 text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
          
          <div className="flex gap-3 mt-8">
            <button type="button" onClick={handleClose} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
