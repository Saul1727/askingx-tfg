import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, MoreVertical, Users, Edit, UserPlus } from 'lucide-react';
import { getAllAsks, matchAsk, updateAskStatus } from '../services/askService';
import { getGivers } from '../services/userService';
import { getUser } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import ConnectorViewAskModal from '../components/asks/ConnectorViewAskModal';
import CreateAskModal from '../components/asks/CreateAskModal';
import StoryModal from '../components/stories/StoryModal';

const ConnectorKanban = () => {
  const { t } = useLanguage();
  const [asks, setAsks] = useState([]);
  const [givers, setGivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Estados para el Modal de Match
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedAskForMatch, setSelectedAskForMatch] = useState(null);
  const [selectedGiverIds, setSelectedGiverIds] = useState([]);

  // Estados para el Modal de Vista
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAskForView, setSelectedAskForView] = useState(null);

  // Estados para el Modal de Edición (Reutilizando CreateAskModal)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [askToEdit, setAskToEdit] = useState(null);

  // Estados para el Modal de Historia de Impacto (CU-05)
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [askForStory, setAskForStory] = useState(null);

  // silent=true refresca los datos sin mostrar el spinner a pantalla completa
  // (evita el "parpadeo" que borra el tablero en cada guardado).
  const fetchData = (silent = false) => {
    if (!silent) setIsLoading(true);
    return Promise.all([getAllAsks(), getGivers()])
      .then(([asksData, giversData]) => {
        setAsks(asksData);
        setGivers(giversData);
        return asksData;
      })
      .catch(err => {
        console.error("Error cargando Kanban:", err);
        return null;
      })
      .finally(() => { if (!silent) setIsLoading(false); });
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
      if (newStatus === 'MATCHED') {
        // No se pueden asignar donantes a una petición que aún no ha sido aprobada (OPEN).
        if (ask.status !== 'OPEN' && ask.status !== 'MATCHED') {
          alert(t('kanban.cannotAssign'));
          return;
        }
        setSelectedAskForMatch(ask);
        setSelectedGiverIds(ask.givers?.map(g => g.id) || []);
        setIsMatchModalOpen(true);
      }
      else if (ask.status === 'MATCHED' && newStatus === 'OPEN') {
        if (window.confirm(t('kanban.confirmUnmatch'))) {
          await matchAsk(ask.id, []);
          fetchData(true);
        }
      }
      else if (newStatus === 'OPEN' || newStatus === 'CREATED' || newStatus === 'FULFILLED') {
         await updateAskStatus(ask.id, newStatus);
         fetchData(true);
      }
      else {
        alert(t('kanban.invalidTransition'));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditAsk = (ask) => {
    setAskToEdit(ask);
    setIsEditModalOpen(true);
  };

  const handleEditGivers = (ask) => {
    setSelectedAskForMatch(ask);
    setSelectedGiverIds(ask.givers?.map(g => g.id) || []);
    setIsMatchModalOpen(true);
  };

  const handleCancelAsk = async (askId) => {
    if (window.confirm(t('kanban.confirmCancel'))) {
      try {
        await updateAskStatus(askId, 'CANCELLED');
        fetchData(true); // Recargar datos sin parpadeo
        setIsViewModalOpen(false); // Acción terminal: cerramos el modal
      } catch (error) {
        alert("Error al cancelar la petición: " + error.message);
      }
    }
  };

  const handleForceComplete = async (askId) => {
    try {
      await updateAskStatus(askId, 'FULFILLED');
      fetchData(true); // Recargar datos sin parpadeo
      setIsViewModalOpen(false); // Acción terminal: cerramos el modal
    } catch (error) {
      alert("Error al completar la petición: " + error.message);
    }
  };

  const handleReassignGivers = (ask) => {
    setIsViewModalOpen(false);
    handleEditGivers(ask);
  };

  // Abre el modal de Historia de Impacto (cierra antes el de detalle para no solaparlos).
  const handleGenerateStory = (ask) => {
    setIsViewModalOpen(false);
    setAskForStory(ask);
    setIsStoryModalOpen(true);
  };

  // EJECUCIÓN DEL MATCH 
  const handleViewAskDetails = (ask) => {
    setSelectedAskForView(ask);
    setIsViewModalOpen(true);
  };

  // EJECUCIÓN DEL MATCH 
  const handleConfirmMatch = async () => {
    try {
      await matchAsk(selectedAskForMatch.id, selectedGiverIds);
      setIsMatchModalOpen(false);
      setSelectedGiverIds([]);
      setSelectedAskForMatch(null);
      fetchData(true);
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
  const createdAsks = asks.filter(a => a.status === 'CREATED');
  const openAsks = asks.filter(a => a.status === 'OPEN');
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

  // Solo se muestran los Givers cuya especialidad coincide con el dominio de la petición seleccionada
  const eligibleGivers = givers.filter(g =>
    !selectedAskForMatch?.domain?.id ||
    (g.specialties || []).some(s => s.id === selectedAskForMatch.domain.id)
  );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col font-sans">
      
      {/* Título Principal */}
      <div className="mb-8 pl-4">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          {t('kanban.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>
      ) : (
        <div className={`flex-1 grid grid-cols-1 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 overflow-hidden px-4`}>
          
          {/* COLUMNA 0: NUEVAS (Solo Admin) */}
          {isAdmin && (
            <KanbanColumn
              title={t('kanban.colNew')}
              dotColor="bg-blue-500"
              onDragOver={handleDragOver} 
              onDrop={(e) => handleDrop(e, 'CREATED')}
            >
              {createdAsks.map(ask => (
                <AskCard 
                  key={ask.id} 
                  ask={ask} 
                  dotColor="bg-blue-500"
                  onDragStart={handleDragStart} 
                  getInitials={getInitials}
                  onViewDetails={() => handleViewAskDetails(ask)}
                  onEditAsk={() => handleEditAsk(ask)}
                />
              ))}
            </KanbanColumn>
          )}

          {/* COLUMNA 1: ABIERTA */}
          <KanbanColumn
            title={t('kanban.colOpen')}
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
                onViewDetails={() => handleViewAskDetails(ask)}
                onEditAsk={isAdmin ? () => handleEditAsk(ask) : null}
                onStartMatch={() => handleEditGivers(ask)}
              />
            ))}
          </KanbanColumn>

          {/* COLUMNA 2: ASIGNADA */}
          <KanbanColumn
            title={t('kanban.colMatched')}
            dotColor="bg-[#41942A]"
            onDragOver={handleDragOver} 
            onDrop={(e) => handleDrop(e, 'MATCHED')}
            isCenterColumn={true}
          >
            {/* Header Givers Asignados */}
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-sm font-medium text-slate-700">{t('kanban.assignedGivers')}</span>
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
                onViewDetails={() => handleViewAskDetails(ask)}
                onEditAsk={isAdmin ? () => handleEditAsk(ask) : null}
              />
            ))}
          </KanbanColumn>

          {/* COLUMNA 3: COMPLETADA */}
          <KanbanColumn
            title={t('kanban.colDone')}
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
                onViewDetails={() => handleViewAskDetails(ask)}
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
            <h2 className="text-xl font-bold text-slate-800 mb-2">{t('kanban.manageGivers')}</h2>
            <p className="text-sm text-slate-500 mb-6">
              {t('kanban.selectGivers')} <strong>{selectedAskForMatch?.title}</strong>
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-6">
              {eligibleGivers.map(g => {
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
              {eligibleGivers.length === 0 && (
                 <p className="text-sm text-slate-500 text-center py-4">{t('kanban.noGivers')}</p>
              )}
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
              <button onClick={() => setIsMatchModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-slate-200">{t('common.cancel')}</button>
              <button onClick={handleConfirmMatch} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                {t('common.confirm')} <CheckCircle2 size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA VER DETALLES DE LA PETICIÓN */}
      <ConnectorViewAskModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        ask={selectedAskForView}
        onCancelAsk={handleCancelAsk}
        onForceComplete={handleForceComplete}
        onReassignGivers={handleReassignGivers}
        onFulfillmentAdded={async () => {
            // Refresco silencioso manteniendo el modal abierto en la misma petición.
            const updatedAsks = await fetchData(true);
            if (updatedAsks && selectedAskForView) {
              const refreshed = updatedAsks.find(a => a.id === selectedAskForView.id);
              if (refreshed) setSelectedAskForView(refreshed); // re-sincroniza barra de progreso e historial
              else setIsViewModalOpen(false); // la petición ya no existe en la lista
            }
        }}
        // El botón de generar historia solo se ofrece al ADMIN dentro del Kanban (CU-05).
        onGenerateStory={isAdmin ? handleGenerateStory : undefined}
      />

      {/* MODAL DE HISTORIA DE IMPACTO (CU-05) */}
      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => { setIsStoryModalOpen(false); setAskForStory(null); }}
        ask={askForStory}
        onSaved={() => fetchData(true)}
      />

      {/* MODAL PARA EDITAR LA PETICIÓN (ADMIN/CONNECTOR) */}
      <CreateAskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setAskToEdit(null);
          fetchData();
        }}
        askToEdit={askToEdit}
        onAskCreated={fetchData}
      />
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

const AskCard = ({ ask, onDragStart, isStatic, dotColor, getInitials, onEditGivers, onViewDetails, onEditAsk, onStartMatch }) => {
  const { t, translateDomain } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // Si no hay ninguna acción disponible, no mostramos el botón de menú "⋮".
  const hasMenuActions = Boolean(onEditAsk || onEditGivers || onStartMatch);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de Urgencia (Si vence en menos de 7 días o ya venció).
  // Una petición en estado final (resuelta/cerrada) nunca es urgente.
  const isUrgent = () => {
    if (['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(ask.status)) return false;
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
      onClick={onViewDetails}
      className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 relative ${!isStatic ? 'cursor-grab active:cursor-grabbing' : ''} hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer`}
    >
      {/* Título y opciones */}
      <div className="flex justify-between items-start mb-3 relative">
        <div className="flex items-center gap-2 flex-wrap pr-6">
          <h4 className="font-bold text-slate-900 text-base leading-tight">{ask.title}</h4>
          {isUrgent() && (
            <span className="bg-[#cc4b37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              {t('kanban.urgent')}
            </span>
          )}
        </div>
        
        {/* Menú de 3 puntos — solo si la tarjeta tiene acciones disponibles */}
        {!isStatic && hasMenuActions && (
          <div className="absolute right-0 top-0" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-20">
                {onEditAsk && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEditAsk();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> {t('kanban.editDetails')}
                  </button>
                )}
                {onStartMatch && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onStartMatch();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserPlus size={14} /> {t('kanban.assignGiver')}
                  </button>
                )}
                {onEditGivers && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEditGivers();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Users size={14} /> {t('kanban.manageVolunteers')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Detalles Apilados */}
      <div className="space-y-1.5 text-[13px] text-slate-800">
        <p>
          {t('kanban.org')}: <span className="font-medium">{ask.asker?.organizationName || ask.asker?.contactPerson || t('common.entity')}</span>
        </p>
        <p>
          {t('kanban.type')}: <span className="font-medium">{ask.type}</span>
        </p>
        <p>
          {t('kanban.domain')}: <span className="font-medium">{translateDomain(ask.domain?.name) || 'General'}</span>
        </p>
        <p>
          {t('kanban.due')}: <span className="font-medium">{ask.dueDate ? new Date(ask.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : t('kanban.noDate')}</span>
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
