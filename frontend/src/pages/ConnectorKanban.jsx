import React, { useState, useEffect } from 'react';
import { KanbanSquare, Loader2, Users, CheckCircle2, Clock, MapPin, X, ArrowRight } from 'lucide-react';
import { getAllAsks, matchAsk, updateAskStatus } from '../services/askService';
import { getGivers } from '../services/userService';

const ConnectorKanban = () => {
  const [asks, setAsks] = useState([]);
  const [givers, setGivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el Modal de Match
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedAskForMatch, setSelectedAskForMatch] = useState(null);
  const [selectedGiverId, setSelectedGiverId] = useState('');

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
    e.preventDefault(); // Necesario para permitir el drop
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
        // Abrimos el modal para elegir al voluntario
        setSelectedAskForMatch(ask);
        setIsMatchModalOpen(true);
      } 
      else if (ask.status === 'MATCHED' && newStatus === 'OPEN') {
        // Deshacer el Match
        if (window.confirm("¿Seguro que quieres deshacer la asignación y devolverla a Abierta?")) {
          await updateAskStatus(ask.id, 'OPEN');
          fetchData();
        }
      } 
      else if (ask.status === 'MATCHED' && newStatus === 'FULFILLED') {
        // Completar la ayuda
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

  //  EJECUCIÓN DEL MATCH 
  const handleConfirmMatch = async () => {
    if (!selectedGiverId) return alert("Debes seleccionar un voluntario.");
    try {
      await matchAsk(selectedAskForMatch.id, selectedGiverId);
      setIsMatchModalOpen(false);
      setSelectedGiverId('');
      setSelectedAskForMatch(null);
      fetchData(); // Recargamos para ver el cambio
    } catch (error) {
      alert(error.message);
    }
  };

  // Columnas del tablero
  const openAsks = asks.filter(a => a.status === 'OPEN' || a.status === 'CREATED');
  const matchedAsks = asks.filter(a => a.status === 'MATCHED');
  const fulfilledAsks = asks.filter(a => a.status === 'FULFILLED');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <KanbanSquare size={32} className="text-blue-600"/> Tablero de Conexiones
        </h1>
        <p className="text-slate-500 text-sm mt-1">Arrastra las peticiones para gestionar su estado de asignación.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
          
          {/* COLUMNA 1: OPEN */}
          <KanbanColumn 
            title="Buscando Ayuda" count={openAsks.length} color="border-yellow-400" bg="bg-slate-50"
            onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'OPEN')}
          >
            {openAsks.map(ask => (
              <AskCard key={ask.id} ask={ask} onDragStart={handleDragStart} onClickAction={() => processStatusChange(ask, 'MATCHED')} actionText="Asignar" />
            ))}
          </KanbanColumn>

          {/* COLUMNA 2: MATCHED */}
          <KanbanColumn 
            title="Asignadas / En Proceso" count={matchedAsks.length} color="border-blue-500" bg="bg-blue-50/30"
            onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'MATCHED')}
          >
            {matchedAsks.map(ask => (
              <AskCard key={ask.id} ask={ask} onDragStart={handleDragStart} onClickAction={() => processStatusChange(ask, 'FULFILLED')} actionText="Completar" />
            ))}
          </KanbanColumn>

          {/* COLUMNA 3: FULFILLED */}
          <KanbanColumn 
            title="Ayuda Completada" count={fulfilledAsks.length} color="border-green-500" bg="bg-green-50/30"
            onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'FULFILLED')}
          >
            {fulfilledAsks.map(ask => (
              <AskCard key={ask.id} ask={ask} onDragStart={handleDragStart} isStatic />
            ))}
          </KanbanColumn>

        </div>
      )}

      {/* MODAL PARA ELEGIR AL VOLUNTARIO */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMatchModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Asignar Voluntario (Match)</h2>
            <p className="text-sm text-slate-500 mb-6">Selecciona el Giver que se encargará de: <strong>{selectedAskForMatch?.title}</strong></p>
            
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">Catálogo de Givers Disponibles</label>
              <select 
                value={selectedGiverId} 
                onChange={(e) => setSelectedGiverId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecciona un Voluntario --</option>
                {givers.map(g => (
                  <option key={g.id} value={g.id}>{g.fullName} ({g.email})</option>
                ))}
              </select>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsMatchModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-slate-200">Cancelar</button>
                <button onClick={handleConfirmMatch} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                  Confirmar Match <CheckCircle2 size={18}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//SUBCOMPONENTES DE UI

const KanbanColumn = ({ title, count, color, bg, children, onDragOver, onDrop }) => (
  <div 
    className={`${bg} rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-inner`}
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    <div className={`p-4 bg-white border-t-4 ${color} border-b border-slate-200 flex justify-between items-center shadow-sm`}>
      <h3 className="font-bold text-slate-700">{title}</h3>
      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{count}</span>
    </div>
    <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
      {children}
      {count === 0 && (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-lg">
          Arrastra tarjetas aquí
        </div>
      )}
    </div>
  </div>
);

const AskCard = ({ ask, onDragStart, onClickAction, actionText, isStatic }) => (
  <div 
    draggable={!isStatic}
    onDragStart={(e) => !isStatic && onDragStart(e, ask.id)}
    className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm ${!isStatic && 'cursor-grab hover:shadow-md hover:border-blue-300 transition-all active:cursor-grabbing group'}`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
        {ask.type}
      </span>
      {ask.dueDate && <span className="text-[10px] text-red-500 flex items-center gap-1"><Clock size={10}/> {new Date(ask.dueDate).toLocaleDateString()}</span>}
    </div>
    
    <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{ask.title}</h4>
    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3 line-clamp-1">
      <MapPin size={12} /> {ask.asker?.organizationName || ask.asker?.contactPerson || 'ONG / Particular'}
    </p>

    {!isStatic && onClickAction && (
      <button 
        onClick={onClickAction}
        className="w-full bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-100 hover:border-blue-200 text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
      >
        {actionText} <ArrowRight size={14}/>
      </button>
    )}
  </div>
);

export default ConnectorKanban;