import { useState, useEffect, useCallback } from 'react';
import { Loader2, HeartHandshake, Package, Clock, Wrench, ChevronRight, Inbox } from 'lucide-react';
import { getAllAsks } from '../services/askService';
import { useLanguage } from '../context/LanguageContext';
import GiverViewAskModal from '../components/asks/GiverViewAskModal';

/**
 * GiverParticipations
 * -----------------------------------------------------------------------------
 * Pestaña del rol GIVER con las peticiones en las que participa en este momento
 * (estado MATCHED, es decir, asignadas y aún no completadas). Al pulsar una
 * tarjeta se abre el detalle con los datos de contacto de la entidad beneficiaria.
 * -----------------------------------------------------------------------------
 */
const GiverParticipations = () => {
  const { t } = useLanguage();
  const [asks, setAsks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsk, setSelectedAsk] = useState(null);

  const fetchAsks = useCallback(() => {
    setIsLoading(true);
    getAllAsks()
      .then(setAsks)
      .catch((err) => console.error('Error cargando participaciones:', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchAsks(); }, [fetchAsks]);

  // "Participando ahora mismo": asignadas (MATCHED). En OPEN todavía no hay givers asignados.
  const activeAsks = asks.filter((a) => a.status === 'MATCHED');

  const typeIcon = {
    THINGS: <Package size={18} className="text-blue-600" />,
    TIME: <Clock size={18} className="text-green-600" />,
    EXPERTISE: <Wrench size={18} className="text-purple-600" />,
    SERVICES: <Wrench size={18} className="text-purple-600" />,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <HeartHandshake className="text-[#41942A]" /> {t('giver.participationsTitle')}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t('giver.participationsSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={40} /></div>
      ) : activeAsks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <Inbox size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">{t('giver.noParticipations')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAsks.map((ask) => (
            <button
              key={ask.id}
              onClick={() => setSelectedAsk(ask)}
              className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-[#41942A]/40 transition-all group flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                  {typeIcon[ask.type]}
                  {t(`viewAsk.${ask.type.toLowerCase()}Label`)}
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#41942A] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-slate-800 leading-snug mb-1 line-clamp-2">{ask.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-grow">{ask.description}</p>
              <div className="text-xs text-slate-400 pt-3 border-t border-slate-100">
                {ask.asker?.organizationName || ask.asker?.contactPerson || t('common.entity')}
              </div>
            </button>
          ))}
        </div>
      )}

      <GiverViewAskModal
        isOpen={!!selectedAsk}
        onClose={() => setSelectedAsk(null)}
        ask={selectedAsk}
      />
    </div>
  );
};

export default GiverParticipations;
