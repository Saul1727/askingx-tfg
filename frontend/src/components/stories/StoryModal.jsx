import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save, Send, RefreshCw, Globe, Lock } from 'lucide-react';
import { getStoryByAsk, generateStory, updateStory } from '../../services/storyService';
import { useLanguage } from '../../context/LanguageContext';

/**
 * StoryModal
 * -----------------------------------------------------------------------------
 * Modal central de las Historias de Impacto (CU-05). TODOS los puntos de entrada
 * (tabla de Peticiones, Kanban, página Historias) abren este mismo modal pasándole
 * un `ask`. El modal se encarga de todo el ciclo:
 *
 *   1. Al abrir, carga la historia existente de esa petición (si la hay).
 *   2. Si no existe, muestra el botón "Generar con IA".
 *   3. Una vez generada, permite editar el texto, guardarlo y publicarlo.
 *
 * Centralizar aquí toda la lógica mantiene los componentes que lo abren muy simples.
 * -----------------------------------------------------------------------------
 */
const StoryModal = ({ isOpen, onClose, ask, onSaved }) => {
  const { t } = useLanguage();
  const [story, setStory] = useState(null);   // historia cargada/generada (o null)
  const [content, setContent] = useState(''); // texto editable del textarea
  const [isLoading, setIsLoading] = useState(false);     // carga inicial
  const [isGenerating, setIsGenerating] = useState(false); // llamada a la IA
  const [isSaving, setIsSaving] = useState(false);       // guardar/publicar
  const [error, setError] = useState('');

  // Al abrir el modal, intentamos cargar la historia existente de la petición.
  useEffect(() => {
    if (isOpen && ask) {
      setError('');
      setStory(null);
      setContent('');
      setIsLoading(true);
      getStoryByAsk(ask.id)
        .then((existente) => {
          if (existente) {
            setStory(existente);
            setContent(existente.generatedContent);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, ask]);

  if (!isOpen || !ask) return null;

  // Genera o regenera la historia llamando a la IA del backend.
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const nueva = await generateStory(ask.id);
      setStory(nueva);
      setContent(nueva.generatedContent);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Guarda los cambios del texto editado por el usuario.
  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const actualizada = await updateStory(story.id, { generatedContent: content });
      setStory(actualizada);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Publica o despublica la historia (cambia el flag isPublished).
  const handleTogglePublish = async () => {
    setIsSaving(true);
    setError('');
    try {
      // Guardamos también el texto actual por si lo editó antes de publicar.
      const actualizada = await updateStory(story.id, {
        generatedContent: content,
        isPublished: !story.isPublished,
      });
      setStory(actualizada);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in duration-300">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('storyModal.title')}</h2>
              <p className="text-xs text-slate-500 truncate max-w-md">{ask.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">{error}</div>
          )}

          {isLoading ? (
            <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
          ) : !story ? (
            /* --- Aún no hay historia: invitamos a generarla con IA --- */
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <Sparkles size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">{t('storyModal.noStory')}</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{t('storyModal.noStoryHint')}</p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-purple-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-60"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? t('storyModal.generating') : t('storyModal.generate')}
              </button>
            </div>
          ) : (
            /* --- Historia generada: revisar / editar --- */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('storyModal.content')}</span>
                {story.isPublished ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <Globe size={12} /> {t('storyModal.published')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Lock size={12} /> {t('storyModal.draft')}
                  </span>
                )}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={9}
                className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-lg px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />

              <p className="text-[11px] text-slate-400 italic">{t('storyModal.editHint')}</p>
            </div>
          )}
        </div>

        {/* Footer con acciones (solo cuando ya hay historia) */}
        {story && !isLoading && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isSaving}
              className="text-slate-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {t('storyModal.regenerate')}
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || isGenerating}
                className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {t('storyModal.saveDraft')}
              </button>
              <button
                onClick={handleTogglePublish}
                disabled={isSaving || isGenerating}
                className={`text-white font-bold py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 ${story.isPublished ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {story.isPublished ? <Lock size={16} /> : <Send size={16} />}
                {story.isPublished ? t('storyModal.unpublish') : t('storyModal.publish')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryModal;
