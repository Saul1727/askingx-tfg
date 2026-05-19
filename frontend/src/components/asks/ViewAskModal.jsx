import React from 'react';
import { X, Calendar, MapPin, Wrench, Package, Clock } from 'lucide-react';

const ViewAskModal = ({ isOpen, onClose, ask }) => {
  if (!isOpen || !ask) return null;

  // Formatear la fecha
  const formattedDate = ask.dueDate 
    ? new Date(ask.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Sin fecha límite';

  // Configuración visual según el tipo de ayuda
  const typeConfig = {
    'THINGS': { icon: <Package size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Materiales' },
    'TIME': { icon: <Clock size={18} />, color: 'text-green-600', bg: 'bg-green-50', label: 'Voluntariado' },
    'EXPERTISE': { icon: <Wrench size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Conocimiento' },
    'SERVICES': { icon: <Wrench size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Servicios' }
  }[ask.type] || { icon: null, color: 'text-slate-600', bg: 'bg-slate-100', label: ask.type };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-xl shadow-2xl overflow-y-auto animate-in zoom-in duration-300">
        {/* Cabecera */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3 ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.icon}
              {typeConfig.label}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">{ask.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ask.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} /> Fecha Límite
              </h3>
              <p className="text-sm font-medium text-slate-800">{formattedDate}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dominio</h3>
              <p className="text-sm font-medium text-slate-800">{ask.domain?.name || 'General'}</p>
            </div>
          </div>

          {/* Campos Especializados */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detalles Específicos</h3>
            
            {ask.type === 'THINGS' && (
              <p className="text-sm text-slate-700"><span className="font-semibold">Cantidad solicitada:</span> {ask.quantityRequested} unidades</p>
            )}
            {ask.type === 'TIME' && (
              <>
                <p className="text-sm text-slate-700"><span className="font-semibold">Horas estimadas:</span> {ask.estimatedHours} horas</p>
                <p className="text-sm text-slate-700 flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> {ask.serviceLocation}</p>
              </>
            )}
            {(ask.type === 'EXPERTISE' || ask.type === 'SERVICES') && (
              <>
                <p className="text-sm text-slate-700"><span className="font-semibold">Habilidad requerida:</span> {ask.requiredSkill}</p>
                <p className="text-sm text-slate-700 flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> {ask.serviceLocation}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAskModal;