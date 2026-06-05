import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, Globe, Lock, History, FileText } from 'lucide-react';
import { getStories } from '../services/storyService';
import { getAllAsks } from '../services/askService';
import { getUser } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import StoryModal from '../components/stories/StoryModal';

/**
 * Stories (Historias de Impacto) — CU-05
 * -----------------------------------------------------------------------------
 * Página que lista las historias visibles para el usuario (el backend ya filtra
 * por rol) y, para AUTHOR/ADMIN, ofrece generar historias de peticiones
 * completadas que aún no tienen una.
 *
 * Tanto generar como editar/publicar se hace a través del StoryModal compartido.
 * -----------------------------------------------------------------------------
 */
const Stories = () => {
  const { t } = useLanguage();
  const user = getUser();
  const canManage = user?.role === 'AUTHOR' || user?.role === 'ADMIN';

  const [stories, setStories] = useState([]);
  const [pendingAsks, setPendingAsks] = useState([]); // peticiones FULFILLED sin historia
  const [isLoading, setIsLoading] = useState(true);

  // Modal compartido: guardamos la petición sobre la que trabajar.
  const [selectedAsk, setSelectedAsk] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    // Cargamos las historias siempre; las peticiones pendientes solo si puede gestionar.
    const peticiones = canManage ? getAllAsks() : Promise.resolve([]);
    Promise.all([getStories(), peticiones])
      .then(([storiesData, asksData]) => {
        setStories(storiesData);
        // Pendientes = completadas y sin historia todavía.
        setPendingAsks(asksData.filter((a) => a.status === 'FULFILLED' && !a.story));
      })
      .catch((err) => console.error('Error cargando historias:', err))
      .finally(() => setIsLoading(false));
  }, [canManage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModalFor = (ask) => {
    setSelectedAsk(ask);
    setIsModalOpen(true);
  };

  const askerName = (asker) => asker?.organizationName || asker?.contactPerson || 'Entidad';

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{t('stories.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('stories.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={36} /></div>
      ) : (
        <>
          {/* SECCIÓN 1: Peticiones completadas pendientes de historia (solo AUTHOR/ADMIN) */}
          {canManage && pendingAsks.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                {t('stories.pending')} ({pendingAsks.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingAsks.map((ask) => (
                  <div key={ask.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{ask.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{askerName(ask.asker)}</p>
                    </div>
                    <button
                      onClick={() => openModalFor(ask)}
                      className="bg-purple-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} /> {t('stories.generate')}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECCIÓN 2: Historias existentes */}
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              {t('stories.list')} {stories.length > 0 && `(${stories.length})`}
            </h2>

            {stories.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl py-16 text-center text-slate-400">
                <History size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">{t('stories.empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => canManage ? openModalFor(story.ask) : null}
                    className={`text-left bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 transition-all ${canManage ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                        <FileText size={12} /> {story.ask?.type}
                      </span>
                      {story.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <Globe size={11} /> {t('stories.published')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Lock size={11} /> {t('stories.draft')}
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-slate-800 text-sm leading-tight">{story.ask?.title}</p>
                    {/* Los gestores ven un extracto (abren el modal para leer/editar);
                        los participantes ven el texto completo aquí mismo. */}
                    <p className={`text-xs text-slate-500 leading-relaxed whitespace-pre-wrap ${canManage ? 'line-clamp-4' : ''}`}>{story.generatedContent}</p>

                    <div className="text-[11px] text-slate-400 mt-auto pt-2 border-t border-slate-50">
                      {askerName(story.ask?.asker)} · {new Date(story.generatedAt).toLocaleDateString('es-ES')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <StoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedAsk(null); }}
        ask={selectedAsk}
        onSaved={fetchData}
      />
    </div>
  );
};

export default Stories;
