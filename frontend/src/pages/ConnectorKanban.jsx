import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, MoreVertical, Users } from 'lucide-react';
import { getAllAsks, matchAsk, updateAskStatus } from '../services/askService';
import { getGivers } from '../services/userService';

const ConnectorKanban = () => {
  const [asks, setAsks] = useState([]);
  const [givers, setGivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el Modal de Match
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedAskForMatch, setSelectedAskForMatch] = useState(null);
  const [selectedGiverIds, setSelectedGiverIds] = useState([]);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([getAllAsks(), getGivers()])
      .then(([asksData, giversData]) => {
        setAsks(asksData);
        setGivers(giversData);
      })
      .catch(err => console.error("Error cargando Kanban:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // --- LÓGICA DRAG & DROP ---
  const handleDragStart = (e, askId) => {
    e.dataTransfer.setData("askId", askId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const askId = e.dataTransfer.getData("askId");
    const ask = asks.find(a => a.id === askId);
    if (!ask || ask.status === newStatus) return;

    processStatusChange(ask, newStatus);
  };

  // --- LÓGICA DE TRANSICIÓN DE ESTADOS ---
  const processStatusChange = async (ask, newStatus) => {
    try {
      if ((ask.status === 'OPEN' || ask.status === 'CREATED') && newStatus === 'MATCHED') {
        setSelectedAskForMatch(ask);
        setSelectedGiverIds(ask.givers?.map(g => g.id) || []);
        setIsMatchModalOpen(true);
      } 
      else if (ask.status === 'MATCHED' && newStatus === 'OPEN') {
        if (window.confirm("¿Seguro que quieres deshacer la asignación y devolverla a Abierta?")) {
          // Removeremos todos los givers
          await matchAsk(ask.id, []);
          fetchData();
        }
      } 
      else if (ask.status === 'MATCHED' && newStatus === 'FULFILLED') {
        if (window.confirm("¿Confirmas que la ayuda ha sido entregada y completada con éxito?")) {
          await updateAskStatus(ask.id, 'FULFILLED');
          fetchData();
        }
      }
      else {
        alert("Transición no permitida directamente.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditGivers = (ask) => {
    setSelectedAskForMatch(ask);
    setSelectedGiverIds(ask.givers?.map(g => g.id) || []);
    setIsMatchModalOpen(true);
  };

  // EJECUCIÓN DEL MATCH 
  const handleConfirmMatch = async () => {
    try {
      await matchAsk(selectedAskForMatch.id, selectedGiverIds);
      setIsMatchModalOpen(false);
      setSelectedGiverIds([]);
      setSelectedAskForMatch(null);
      fetchData(); 
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleGiverSelection = (giverId) => {
    if (selectedGiverIds.includes(giverId)) {
      setSelectedGiverIds(selectedGiverIds.filter(id => id !== giverId));
    } else {
      setSelectedGiverIds([...selectedGiverIds, giverId]);
    }
  };

  // Columnas del tablero
  const openAsks = asks.filter(a => a.status === 'OPEN' || a.status === 'CREATED');
  const matchedAsks = asks.filter(a => a.status === 'MATCHED');
  const fulfilledAsks = asks.filter(a => a.status === 'FULFILLED');

  // Helper para obtener iniciales
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Extraer Givers asignados únicos de las peticiones MATCHED
  const uniqueMatchedGivers = [];
  matchedAsks.forEach(ask => {
    if (ask.givers && Array.isArray(ask.givers)) {
      ask.givers.forEach(giver => {
        if (!uniqueMatchedGivers.find(g => g.id === giver.id)) {
          uniqueMatchedGivers.push(giver);
        }
      });
    }
  });

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col font-sans">
      
      {/* Título Principal */}
      <div className="mb-8 pl-4">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Kanban de Dominios - Connector
        </h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden px-4">
          
          {/* COLUMNA 1: ABIERTA */}
          <KanbanColumn 
            title="ABIERTA" 
            dotColor="bg-[#F5D033]" 
            onDragOver={handleDragOver} 
            onDrop={(e) => handleDrop(e, 'OPEN')}
          >
            {openAsks.map(ask => (
              <AskCard 
                key={ask.id} 
                ask={ask} 
                dotColor="bg-[#F5D033]"
                onDragStart={handleDragStart} 
                getInitials={getInitials}
              />
            ))}
          </KanbanColumn>

          {/* COLUMNA 2: ASIGNADA */}
          <KanbanColumn 
            title="ASIGNADA" 
            dotColor="bg-[#41942A]" 
            onDragOver={handleDragOver} 
            onDrop={(e) => handleDrop(e, 'MATCHED')}
            isCenterColumn={true}
          >
            {/* Header Givers Asignados */}
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-sm font-medium text-slate-700">Givers Asignados</span>
              <div className="flex -space-x-2">
                {uniqueMatchedGivers.map((giver, idx) => (
                  <div key={idx} title={giver.fullName} className="w-7 h-7 rounded-full bg-slate-500 border-2 border-slate-100 flex items-center justify-center text-[10px] font-bold text-white z-10">
                    {getInitials(giver.fullName)}
                  </div>
                ))}
              </div>
            </div>

            {matchedAsks.map(ask => (
              <AskCard 
                key={ask.id} 
                ask={ask} 
                dotColor="bg-[#41942A]"
                onDragStart={handleDragStart} 
                getInitials={getInitials}
                onEditGivers={() => handleEditGivers(ask)}
              />
            ))}
          </KanbanColumn>

          {/* COLUMNA 3: COMPLETADA */}
          <KanbanColumn 
            title="COMPLETADA" 
            dotColor="bg-[#A4D8A4]" 
            onDragOver={handleDragOver} 
            onDrop={(e) => handleDrop(e, 'FULFILLED')}
          >
            {fulfilledAsks.map(ask => (
              <AskCard 
                key={ask.id} 
                ask={ask} 
                dotColor="bg-[#A4D8A4]"
                onDragStart={handleDragStart} 
                isStatic 
                getInitials={getInitials}
              />
            ))}
          </KanbanColumn>

        </div>
      )}

      {/* MODAL PARA ELEGIR A LOS VOLUNTARIOS */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMatchModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Gestionar Voluntarios</h2>
            <p className="text-sm text-slate-500 mb-6">
              Selecciona los Givers que se encargarán de: <strong>{selectedAskForMatch?.title}</strong>
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-6">
              {givers.map(g => {
                const isSelected = selectedGiverIds.includes(g.id);
                return (
                  <label 
                    key={g.id} 
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleGiverSelection(g.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{g.fullName}</p>
                      <p className="text-xs text-slate-500">{g.email}</p>
                    </div>
                  </label>
                )
              })}
              {givers.length === 0 && (
                 <p className="text-sm text-slate-500 text-center py-4">No hay voluntarios disponibles.</p>
              )}
            </div>
            
            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
              <button onClick={() => setIsMatchModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-slate-200">Cancelar</button>
              <button onClick={handleConfirmMatch} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                Confirmar <CheckCircle2 size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUBCOMPONENTES DE UI REDISEÑADOS ---

const KanbanColumn = ({ title, dotColor, children, onDragOver, onDrop, isCenterColumn }) => (
  <div 
    className={`bg-[#f1f3f5] rounded-xl flex flex-col overflow-hidden shadow-sm border border-slate-200/60 ${isCenterColumn ? 'ring-1 ring-slate-300/50' : ''}`}
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    {/* Cabecera de Columna Estilo Trello */}
    <div className="pt-4 pb-3 flex justify-center items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
      <h3 className="font-semibold text-slate-800 text-[15px] tracking-wide">{title}</h3>
    </div>
    
    <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
      {children}
    </div>
  </div>
);

const AskCard = ({ ask, onDragStart, isStatic, dotColor, getInitials, onEditGivers }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de Urgencia (Si vence en menos de 7 días o ya venció)
  const isUrgent = () => {
    if (!ask.dueDate) return false;
    const due = new Date(ask.dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const hasGivers = ask.givers && ask.givers.length > 0;

  return (
    <div 
      draggable={!isStatic}
      onDragStart={(e) => !isStatic && onDragStart(e, ask.id)}
      className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 relative ${!isStatic ? 'cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow' : ''}`}
    >
      {/* Título y opciones */}
      <div className="flex justify-between items-start mb-3 relative">
        <div className="flex items-center gap-2 flex-wrap pr-6">
          <h4 className="font-bold text-slate-900 text-base leading-tight">{ask.title}</h4>
          {isUrgent() && (
            <span className="bg-[#cc4b37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Urgente
            </span>
          )}
        </div>
        
        {/* Menú de 3 puntos */}
        {(!isStatic && onEditGivers) && (
          <div className="absolute right-0 top-0" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <MoreVertical size={18} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-20">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsMenuOpen(false); 
                    onEditGivers(); 
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Users size={14} /> Gestionar Voluntarios
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Detalles Apilados */}
      <div className="space-y-1.5 text-[13px] text-slate-800">
        <p>
          Organización: <span className="font-medium">{ask.asker?.organizationName || ask.asker?.contactPerson || 'ONG Local'}</span>
        </p>
        <p>
          Tipo: <span className="font-medium">{ask.type}</span>
        </p>
        <p>
          Dominio: <span className="font-medium">{ask.domain?.name || 'General'}</span>
        </p>
        <p>
          Vencimiento: <span className="font-medium">{ask.dueDate ? new Date(ask.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin fecha'}</span>
        </p>
      </div>

      {/* Avatares de Givers Asignados dentro de la tarjeta */}
      {hasGivers && (
        <div className="mt-4 flex -space-x-1">
          {ask.givers.map((giver, idx) => (
            <div key={idx} title={giver.fullName} className="w-6 h-6 rounded-full bg-slate-500 border border-white flex items-center justify-center text-[9px] font-bold text-white">
              {getInitials(giver.fullName)}
            </div>
          ))}
        </div>
      )}

      {/* Punto de color de estado (Bottom Right) */}
      <div className={`absolute bottom-3 right-3 w-3 h-3 rounded-full ${dotColor}`}></div>
    </div>
  );
};

export default ConnectorKanban;
