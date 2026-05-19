import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  CalendarDays, 
  CheckCircle2, 
  Plus, 
  Edit, 
  Eye, 
  Loader2,
  ClipboardList
} from 'lucide-react';
import CreateAskModal from '../components/asks/CreateAskModal';
import { getAllAsks, getAskers } from '../services/askService';

/**
 * Dashboard Page Component
 * Central statistical view and detailed tables.
 */
const Dashboard = () => {
  // GESTIÓN DE ESTADOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [askToEdit, setAskToEdit] = useState(null);
  const [asksList, setAsksList] = useState([]);
  const [askersList, setAskersList] = useState([]); // <-- Nuevo estado para organizaciones
  const [isLoading, setIsLoading] = useState(true);
  
  //  Estado para el filtro activo (null = mostrar todas)
  const [activeFilter, setActiveFilter] = useState(null);

  // LÓGICA DE CARGA DE DATOS (Refetch)
  useEffect(() => {
    if (!isModalOpen) {
      setIsLoading(true);
      // Cargamos ambos simultáneamente
      Promise.all([getAllAsks(), getAskers()])
        .then(([asksData, askersData]) => {
          setAsksList(asksData);
          setAskersList(askersData);
        })
        .catch((err) => console.error("Error cargando el Dashboard:", err))
        .finally(() => {
          setIsLoading(false);
          setAskToEdit(null); // Limpiamos edición al cerrar
        });
    }
  }, [isModalOpen]);

  // Lógica para abrir edición
  const handleEdit = (ask) => {
    setAskToEdit(ask);
    setIsModalOpen(true);
  };

  // LÓGICA DE FILTRADO 
  const toggleFilter = (status) => {
    // Si haces clic en el que ya está activo, lo apaga (null). Si no, lo enciende.
    if (activeFilter === status) {
      setActiveFilter(null);
    } else {
      setActiveFilter(status);
    }
  };

  // Filtramos la lista antes de pintarla
  const filteredAsks = activeFilter 
    ? asksList.filter(ask => ask.status === activeFilter) 
    : asksList;

  // CÁLCULO DE ESTADÍSTICAS REALES
  const totalOrganizaciones = askersList.length;
  const peticionesAbiertas = asksList.filter(ask => ask.status === 'OPEN').length;
  const peticionesCompletadas = asksList.filter(ask => ask.status === 'FULFILLED').length;

  // UI: RENDERIZADO
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-800">Panel - AskAuthor</h2>

      {/* Stats Cards - AHORA CON DATOS REALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users2 size={28} />} 
          label="Total Organizaciones" 
          value={isLoading ? '-' : totalOrganizaciones} 
          bgColor="bg-slate-500" 
        />
        <StatCard 
          icon={<CalendarDays size={28} />} 
          label="Peticiones Abiertas" 
          value={isLoading ? '-' : peticionesAbiertas} 
          bgColor="bg-slate-600" 
        />
        <StatCard 
          icon={<CheckCircle2 size={28} />} 
          label="Peticiones Completadas" 
          value={isLoading ? '-' : peticionesCompletadas} 
          bgColor="bg-slate-700" 
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <TabButton label="Mis Organizaciones (Askers)" status="INACTIVE" />
          <TabButton label="Mis Peticiones (Asks)" status="ACTIVE" isActive />
        </div>

        <div className="p-6 space-y-6">
          {/* Table Filters & Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            
            {/* Botones de Filtro Funcionales */}
            <div className="flex gap-2">
              <StatusFilter 
                label="CREADAS" color="bg-blue-500" 
                isActive={activeFilter === 'CREATED'} onClick={() => toggleFilter('CREATED')} 
              />
              <StatusFilter 
                label="ABIERTAS" color="bg-yellow-500" 
                isActive={activeFilter === 'OPEN'} onClick={() => toggleFilter('OPEN')} 
              />
              <StatusFilter 
                label="COMPLETADAS" color="bg-green-500" 
                isActive={activeFilter === 'FULFILLED'} onClick={() => toggleFilter('FULFILLED')} 
              />
              <StatusFilter 
                label="CANCELADAS" color="bg-red-500" 
                isActive={activeFilter === 'CANCELLED'} onClick={() => toggleFilter('CANCELLED')} 
              />
            </div>

            {/* Main Action: Open Modal */}
            <button 
              onClick={() => {
                setAskToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <Plus size={18} /> Nueva Petición
            </button>
          </div>

          {/* Data Table -  Con altura máxima y scroll interno */}
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] min-h-[200px] relative rounded-lg border border-slate-100">
            
            {/* Pantalla de Carga */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mb-2" size={24} />
                <span className="text-sm font-medium">Cargando peticiones...</span>
              </div>
            )}

            <table className="w-full text-left text-sm relative">
              {/* Cabecera (Sticky) para no perder los títulos al hacer scroll */}
              <thead className="sticky top-0 bg-white z-10 text-slate-500 font-semibold shadow-sm">
                <tr>
                  <th className="py-4 pr-4 pl-4">Título</th>
                  <th className="py-4 px-4">Organización / Solicitante</th>
                  <th className="py-4 px-4">Tipo</th>
                  <th className="py-4 px-4">Dominio</th>
                  <th className="py-4 px-4">Vencimiento</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 pl-4 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-50">
                
                {/* Si no hay peticiones en general */}
                {!isLoading && asksList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 font-medium">
                      Aún no has creado ninguna petición. ¡Haz clic en "Nueva Petición" para empezar!
                    </td>
                  </tr>
                )}

                {/* Si hay peticiones, pero ninguna coincide con el filtro */}
                {!isLoading && asksList.length > 0 && filteredAsks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 font-medium">
                      No hay peticiones con el estado seleccionado.
                    </td>
                  </tr>
                )}

                {/* Renderizado de las peticiones FILTRADAS */}
                {!isLoading && filteredAsks.map((ask) => {
                  
                  const askerName = ask.asker?.organizationName 
                    ? `${ask.asker.organizationName} (${ask.asker.contactPerson})`
                    : ask.asker?.contactPerson || 'Sin especificar';
                  
                  const formattedDate = ask.dueDate 
                    ? new Date(ask.dueDate).toLocaleDateString('es-ES') 
                    : '-';

                  return (
                    <TableRow 
                      key={ask.id}
                      title={ask.title} 
                      asker={askerName} 
                      type={ask.type} 
                      domain={ask.domain?.name || 'Varios'} 
                      date={formattedDate} 
                      status={ask.status}
                      onEdit={() => handleEdit(ask)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Hemos eliminado la botonera de Paginación falsa aquí */}
        </div>
      </div>

      {/* Modal */}
      <CreateAskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        askToEdit={askToEdit}
      />
    </div>
  );
};

/* --- UI Sub-components --- */

const StatCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]`}>
    <div className="bg-white/20 p-3 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm opacity-80 font-medium">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

const TabButton = ({ label, status, isActive }) => (
  <button className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
    isActive ? 'bg-white text-slate-800 border-b-2 border-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-50'
  }`}>
    {label}
  </button>
);

// onClick y estilos dinámicos para saber si está seleccionado
const StatusFilter = ({ label, color, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-all ${
      isActive 
        ? 'border-blue-600 ring-1 ring-blue-600 text-slate-700 bg-blue-50/50' 
        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
    }`}
  >
    <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
    {label}
  </button>
);

const getStatusColor = (status) => {
  const statusColors = {
    'CREATED': 'bg-blue-500',
    'OPEN': 'bg-yellow-500',
    'FULFILLED': 'bg-green-500',
    'CANCELLED': 'bg-red-500'
  };
  return statusColors[status] || 'bg-slate-400';
};

const TableRow = ({ title, asker, type, domain, date, status, onEdit }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="py-4 pr-4 pl-4 font-medium text-slate-800">{title}</td>
    <td className="py-4 px-4 text-slate-600">{asker}</td>
    <td className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase">{type}</td>
    <td className="py-4 px-4 text-slate-600">{domain}</td>
    <td className="py-4 px-4 text-slate-600">{date}</td>
    <td className="py-4 px-4">
      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 py-1 px-2 rounded-md">
        <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></span>
        {status}
      </div>
    </td>
    <td className="py-4 pl-4 pr-4 text-right">
      <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onEdit}
          className="p-1 hover:text-blue-600 transition-colors" 
          title="Editar"
        >
          <Edit size={18}/>
        </button>
        <button className="p-1 hover:text-blue-600 transition-colors" title="Ver Detalle"><Eye size={18}/></button>
      </div>
    </td>
  </tr>
);

export default Dashboard;