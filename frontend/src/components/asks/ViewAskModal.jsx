import React from 'react';
import { X, Calendar, MapPin, Wrench, Package, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ViewAskModal = ({ isOpen, onClose, ask }) => {
  const { t, translateDomain } = useLanguage();
  if (!isOpen || !ask) return null;

  // Formatear la fecha
  const formattedDate = ask.dueDate 
    ? new Date(ask.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : t('viewAsk.noDueDate');

  // Configuración visual según el tipo de ayuda
  const typeConfig = {
    'THINGS': { icon: <Package size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', label: t('viewAsk.thingsLabel') },
    'TIME': { icon: <Clock size={18} />, color: 'text-green-600', bg: 'bg-green-50', label: t('viewAsk.timeLabel') },
    'EXPERTISE': { icon: <Wrench size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', label: t('viewAsk.expertiseLabel') },
    'SERVICES': { icon: <Wrench size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', label: t('viewAsk.servicesLabel') }
  }[ask.type] || { icon: null, color: 'text-slate-600', bg: 'bg-slate-100', label: ask.type };

  // --- Lógica CU-11: Barra de Progreso de Donaciones Parciales ---
  const isQuantifiable = ask.type === 'THINGS' || ask.type === 'TIME';
  const targetQuantity = ask.type === 'THINGS' ? ask.quantityRequested : ask.estimatedHours;
  let totalDelivered = 0;
  let progressPercentage = 0;

  if (isQuantifiable && targetQuantity > 0 && ask.fulfillments) {
    totalDelivered = ask.fulfillments.reduce((sum, f) => sum + (f.quantityDelivered || 0), 0);
    progressPercentage = Math.min(100, Math.round((totalDelivered / targetQuantity) * 100));
  }

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
          
          {/* SECCIÓN CU-11: Barra de Progreso */}
          {isQuantifiable && !['CANCELLED', 'EXPIRED', 'CREATED'].includes(ask.status) && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    {t('viewAsk.progress')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalDelivered} / {targetQuantity} {ask.type === 'THINGS' ? t('viewAsk.units') : t('viewAsk.hours')} {t('viewAsk.delivered')}
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ${progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('viewAsk.description')}</h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ask.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} /> {t('viewAsk.dueDate')}
              </h3>
              <p className="text-sm font-medium text-slate-800">{formattedDate}</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('viewAsk.domain')}</h3>
              <p className="text-sm font-medium text-slate-800">{translateDomain(ask.domain?.name) || 'General'}</p>
            </div>
          </div>

          {/* Campos Especializados */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t('viewAsk.details')}</h3>

            {ask.type === 'THINGS' && (
              <p className="text-sm text-slate-700"><span className="font-semibold">{t('viewAsk.qtyRequested')}:</span> {ask.quantityRequested} {t('viewAsk.units')}</p>
            )}
            {ask.type === 'TIME' && (
              <>
                <p className="text-sm text-slate-700"><span className="font-semibold">{t('viewAsk.estHours')}:</span> {ask.estimatedHours} {t('viewAsk.hours')}</p>
                <p className="text-sm text-slate-700 flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> {ask.serviceLocation}</p>
              </>
            )}
            {(ask.type === 'EXPERTISE' || ask.type === 'SERVICES') && (
              <>
                <p className="text-sm text-slate-700"><span className="font-semibold">{t('viewAsk.skillRequired')}:</span> {ask.requiredSkill}</p>
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