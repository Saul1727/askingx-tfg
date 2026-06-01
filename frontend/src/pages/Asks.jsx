import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Eye, Loader2, ClipboardList, Search } from 'lucide-react';
import CreateAskModal from '../components/asks/CreateAskModal';
import ViewAskModal from '../components/asks/ViewAskModal';
import { getAllAsks } from '../services/askService';

const Asks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [askToEdit, setAskToEdit] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [askToView, setAskToView] = useState(null);

  const [asksList, setAsksList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAsks = useCallback(() => {
    setIsLoading(true);
    getAllAsks()
      .then(setAsksList)
      .catch((err) => console.error("Error cargando peticiones:", err))
      .finally(() => {
        setIsLoading(false);
        setAskToEdit(null); 
      });
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      fetchAsks();
    }
  }, [isModalOpen, fetchAsks]);

  const handleEdit = (ask) => { setAskToEdit(ask); setIsModalOpen(true); };
  const handleView = (ask) => { setAskToView(ask); setIsViewModalOpen(true); };
  const toggleFilter = (status) => setActiveFilter(prev => prev === status ? null : status);

  const filteredAsks = asksList.filter(ask => {
    const matchesFilter = activeFilter ? ask.status === activeFilter : true;
    const term = searchTerm.toLowerCase();
    
    // Búsqueda extendida: Título, Descripción, Organización, Contacto, Tipo, Dominio y Estado
    const matchesSearch = 
      (ask.title && ask.title.toLowerCase().includes(term)) ||
      (ask.description && ask.description.toLowerCase().includes(term)) ||
      (ask.asker?.organizationName && ask.asker.organizationName.toLowerCase().includes(term)) ||
      (ask.asker?.contactPerson && ask.asker.contactPerson.toLowerCase().includes(term)) ||
      (ask.type && ask.type.toLowerCase().includes(term)) ||
      (ask.domain?.name && ask.domain.name.toLowerCase().includes(term)) ||
      (ask.status && ask.status.toLowerCase().includes(term));
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Peticiones de Ayuda</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona y monitoriza las necesidades creadas en el sistema.</p>
        </div>
        <button 
          onClick={() => { setAskToEdit(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Nueva Petición
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={20} className="text-slate-500"/> Listado de Peticiones
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por título, ONG, tipo, dominio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 bg-white text-slate-900 border border-slate-300 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['CREATED', 'OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED'].map((status) => (
                <StatusFilter key={status} status={status} isActive={activeFilter === status} onClick={() => toggleFilter(status)} />
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[600px] min-h-[200px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="animate-spin mb-2" size={24} />
            </div>
          )}

          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white z-10 text-slate-500 font-semibold shadow-sm border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Título</th>
                <th className="py-4 px-4">Organización / Solicitante</th>
                <th className="py-4 px-4">Tipo</th>
                <th className="py-4 px-4">Dominio</th>
                <th className="py-4 px-4">Vencimiento</th>
                <th className="py-4 px-4 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-50">
              {!isLoading && filteredAsks.length === 0 && (
                <tr><td colSpan="7" className="py-10 text-center text-slate-400 font-medium">No se han encontrado peticiones.</td></tr>
              )}
              {!isLoading && filteredAsks.map((ask) => {
                const askerName = ask.asker?.organizationName || ask.asker?.contactPerson || 'Sin especificar';
                const formattedDate = ask.dueDate ? new Date(ask.dueDate).toLocaleDateString('es-ES') : '-';
                return (
                  <TableRow key={ask.id} title={ask.title} asker={askerName} type={ask.type} domain={ask.domain?.name || 'Varios'} date={formattedDate} status={ask.status} onEdit={() => handleEdit(ask)} onView={() => handleView(ask)} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateAskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} askToEdit={askToEdit} />
      <ViewAskModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} ask={askToView} />
    </div>
  );
};

const STATUS_CONFIG = {
  'CREATED': { label: 'CREADAS', color: 'bg-blue-500' },
  'OPEN': { label: 'ABIERTAS', color: 'bg-yellow-500' },
  'MATCHED': { label: 'ASIGNADAS', color: 'bg-teal-500' },
  'FULFILLED': { label: 'COMPLETADAS', color: 'bg-green-500' },
  'CANCELLED': { label: 'CANCELADAS', color: 'bg-red-500' }
};

const StatusFilter = ({ status, isActive, onClick }) => {
  const config = STATUS_CONFIG[status];
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-all ${isActive ? 'border-blue-600 ring-1 ring-blue-600 text-slate-700 bg-blue-50/50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${config.color}`}></span>{config.label}
    </button>
  );
};

const TableRow = ({ title, asker, type, domain, date, status, onEdit, onView }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
    <td className="py-4 px-6 font-medium text-slate-800">{title}</td>
    <td className="py-4 px-4 text-slate-600">{asker}</td>
    <td className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase">{type}</td>
    <td className="py-4 px-4 text-slate-600">{domain}</td>
    <td className="py-4 px-4 text-slate-600">{date}</td>
    <td className="py-4 px-4">
      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 py-1 px-2 rounded-md">
        <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status]?.color || 'bg-slate-400'}`}></span>{status}
      </div>
    </td>
    <td className="py-4 px-6 text-right">
      <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <button onClick={onView} className="p-1 hover:text-blue-600 transition-colors"><Eye size={18}/></button>
        <button onClick={onEdit} className="p-1 hover:text-blue-600 transition-colors"><Edit size={18}/></button>
      </div>
    </td>
  </tr>
);

export default Asks;