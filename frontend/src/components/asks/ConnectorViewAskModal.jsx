import React from 'react';
import { X, Calendar, CheckCircle, Circle } from 'lucide-react';

const ConnectorViewAskModal = ({ isOpen, onClose, ask, onCancelAsk, onReassignGivers }) => {
  if (!isOpen || !ask) return null;

  const isUrgent = () => {
    if (!ask.dueDate) return false;
    const due = new Date(ask.dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CREATED':
        return { label: 'NUEVA (BORRADOR)', color: 'bg-blue-500' };
      case 'OPEN':
        return { label: 'ABIERTA', color: 'bg-[#F5D033]' };
      case 'MATCHED':
        return { label: 'ASIGNADA', color: 'bg-[#41942A]' };
      case 'FULFILLED':
        return { label: 'COMPLETADA', color: 'bg-[#A4D8A4]' };
      case 'CANCELLED':
        return { label: 'CANCELADA', color: 'bg-red-500' };
      default:
        return { label: status, color: 'bg-slate-400' };
    }
  };

  const statusConfig = getStatusConfig(ask.status);

  
  const statusHistory = [
    { status: 'Creada', user: 'AskAuthor', date: '10/04/2026', icon: <Circle size={12} className="text-slate-400"/> },
    { status: 'Revisada y Urgente', user: 'Connector', date: '12/04/2026', icon: <Circle size={12} className="text-yellow-500"/> },
    { status: 'Givers Asignados', user: 'Connector', date: '14/04/2026', icon: <CheckCircle size={12} className="text-green-500"/> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-50 w-full max-w-2xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in duration-300">
        
        {/* Cabecera */}
        <div className="bg-white sticky top-0 border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">
              Detalle de Petición - <span className="text-slate-500">#{ask.id.substring(0, 6)}</span>
            </h2>
            {isUrgent() && (
              <span className="bg-[#cc4b37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Urgente
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* Datos de la Petición */}
          <section>
            <h3 className="text-base font-bold text-slate-800 mb-4">Datos de la Petición</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-slate-500 block">Estado</label>
                <div className="flex items-center gap-2 mt-1">
                   <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}></div>
                   <span className="font-semibold text-slate-800">{statusConfig.label}</span>
                </div>
              </div>
              <div>
                <label className="text-slate-500 block">Tipo</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.type}</p>
              </div>
              <div>
                <label className="text-slate-500 block">Dominio</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.domain?.name || 'General'}</p>
              </div>
              <div>
                <label className="text-slate-500 block">Organización (Asker)</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.asker?.organizationName || ask.asker?.contactPerson || 'ONG Local'}</p>
              </div>
              <div>
                <label className="text-slate-500 block">Vencimiento</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.dueDate ? new Date(ask.dueDate).toLocaleDateString('es-ES') : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-slate-500 block">Descripción</label>
                <p className="font-semibold text-slate-800 mt-1 whitespace-pre-wrap">{ask.description}</p>
              </div>
            </div>
          </section>

          {/* Asignación de Givers */}
          <section>
            <h3 className="text-base font-bold text-slate-800 mb-4">Asignación de Donantes</h3>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Donantes Asignados:</h4>
             {ask.givers && ask.givers.length > 0 ? (
                <div className="space-y-2">
                    {ask.givers.map(giver => (
                        <div key={giver.id} className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg">
                           <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold text-white">
                                {giver.fullName.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                               <p className="font-bold text-sm text-slate-800">{giver.fullName}</p>
                               <p className="text-xs text-slate-500">Coordinación en proceso...</p>
                           </div>
                        </div>
                    ))}
                </div>
             ) : (
                <p className="text-sm text-slate-500 italic">No hay givers asignados.</p>
             )}
          </section>

          {/* Historial de Estado */}
          <section>
            <h3 className="text-base font-bold text-slate-800 mb-4">Historial de Estado</h3>
            <div className="space-y-4">
              {statusHistory.map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-sm">
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-grow">
                    <span className="font-semibold text-slate-700">{item.status}</span> - <span className="text-slate-500">{item.user}</span>
                  </div>
                  <div className="text-slate-400 text-xs">{item.date}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer con Acciones */}
        <div className="bg-white sticky bottom-0 border-t border-slate-200 px-6 py-4 flex justify-end items-center gap-3 rounded-b-2xl">
           <button 
              onClick={() => onReassignGivers(ask)}
              className="bg-slate-100 text-slate-700 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Reasignar Donantes
            </button>
            <button 
              onClick={() => onCancelAsk(ask.id)}
              className="bg-red-50 text-red-600 py-2 px-4 rounded-lg font-bold hover:bg-red-100 transition-colors"
            >
              Cerrar por caducidad/cancelación
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectorViewAskModal;