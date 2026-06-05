import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CalendarClock, Loader2, X } from 'lucide-react';
import { republishAsk, discardAsk } from '../../services/askService';
import { useLanguage } from '../../context/LanguageContext';

// Esquema de validación estricto para el Frontend
const republishSchema = z.object({
  newDueDate: z.string()
    .min(1, 'Debes establecer una nueva fecha límite obligatoriamente.')
    .refine((val) => new Date(val) > new Date(), {
      message: 'La fecha límite debe ser futura.',
    }),
});

const RepublishAskModal = ({ isOpen, onClose, askToRepublish, onSuccess }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(republishSchema),
    defaultValues: { newDueDate: '' }
  });

  if (!isOpen || !askToRepublish) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // El backend ahora es inteligente y solo pedirá lo que falte
      await republishAsk(askToRepublish.id, new Date(data.newDueDate).toISOString());
      onSuccess(); // Recarga la tabla de peticiones
      handleClose();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error al republicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = async () => {
    if(!window.confirm(t('republish.confirmDiscard'))) return;
    setIsDiscarding(true);
    try {
      await discardAsk(askToRepublish.id);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error al descartar');
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('republish.title')}</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{askToRepublish.title}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo / Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6">
          <p className="text-sm text-slate-600">{t('republish.intro')}</p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CalendarClock size={16} className="text-slate-400" />
              {t('republish.newDueDate')}
            </label>
            <input
              type="datetime-local"
              {...register('newDueDate')}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2
                ${errors.newDueDate
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50 text-red-900 [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-0'
                  : 'bg-white text-slate-900 border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
                }`}
            />
            {errors.newDueDate && (
              <p className="text-red-500 text-xs font-medium animate-in slide-in-from-top-1">
                {errors.newDueDate.message}
              </p>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSubmitting || isDiscarding}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {isDiscarding ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
              {t('republish.discard')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDiscarding}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-blue-600/20 flex items-center"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {t('republish.republish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepublishAskModal;
