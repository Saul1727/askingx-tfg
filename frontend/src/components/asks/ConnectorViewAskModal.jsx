import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, ClipboardCheck, Package, Clock, Wrench, UserCheck, Sparkles } from 'lucide-react';
import { createFulfillment } from '../../services/askService';
import { useLanguage } from '../../context/LanguageContext';

const ConnectorViewAskModal = ({ isOpen, onClose, ask, onCancelAsk, onReassignGivers, onForceComplete, onFulfillmentAdded, onGenerateStory }) => {
  const { t, translateDomain } = useLanguage();
  const [partialAmount, setPartialAmount] = useState('');
  const [isSubmittingPartial, setIsSubmittingPartial] = useState(false);
  const [partialError, setPartialError] = useState('');

  const [serviceNotes, setServiceNotes] = useState('');
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [serviceError, setServiceError] = useState('');

  // Giver que realiza la entrega (seleccionado explícitamente por el Connector).
  const [selectedGiverId, setSelectedGiverId] = useState('');

  // Al cambiar de petición, preseleccionamos el primer donante asignado por defecto.
  useEffect(() => {
    if (ask?.givers?.length > 0) {
      setSelectedGiverId(ask.givers[0].id);
    } else {
      setSelectedGiverId('');
    }
  }, [ask]);

  if (!isOpen || !ask) return null;

  const handlePartialSubmit = async () => {
    const amount = Number(partialAmount);
    if (!amount || amount <= 0) {
      setPartialError(t('connectorView.invalidAmount'));
      return;
    }

    if (!ask.givers || ask.givers.length === 0) {
      setPartialError(t('connectorView.noGivers'));
      return;
    }
    if (!selectedGiverId) {
      setPartialError(t('connectorView.selectGiver'));
      return;
    }

    setIsSubmittingPartial(true);
    setPartialError('');
    try {
      await createFulfillment({
        askId: ask.id,
        giverId: selectedGiverId,
        quantityDelivered: amount,
        expertNotes: t('connectorView.autoNotePartial'),
      });
      setPartialAmount('');
      if(onFulfillmentAdded) onFulfillmentAdded();
    } catch (err) {
      setPartialError(err.message);
    } finally {
      setIsSubmittingPartial(false);
    }
  };

  const handleServiceSubmit = async () => {
    if (!ask.givers || ask.givers.length === 0) {
      setServiceError(t('connectorView.noGivers'));
      return;
    }
    if (!selectedGiverId) {
      setServiceError(t('connectorView.selectGiver'));
      return;
    }
    setIsSubmittingService(true);
    setServiceError('');
    try {
      await createFulfillment({
        askId: ask.id,
        giverId: selectedGiverId,
        quantityDelivered: 1,
        expertNotes: serviceNotes || t('connectorView.autoNoteService'),
      });
      setServiceNotes('');
      if (onFulfillmentAdded) onFulfillmentAdded();
    } catch (err) {
      setServiceError(err.message);
    } finally {
      setIsSubmittingService(false);
    }
  };

  // Reutilizable: dropdown para elegir el donante que realiza la entrega/servicio.
  const GiverSelector = () => (
    <div className="mb-2">
      <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center gap-1.5">
        <UserCheck size={13} className="text-slate-400" /> {t('connectorView.giverLabel')}
      </label>
      <select
        value={selectedGiverId}
        onChange={(e) => setSelectedGiverId(e.target.value)}
        className="w-full bg-white text-slate-900 border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      >
        {ask.givers.map(g => (
          <option key={g.id} value={g.id}>{g.fullName}</option>
        ))}
      </select>
    </div>
  );

  // Estados terminales: no se permite ninguna acción operativa sobre la petición.
  const isTerminal = ['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(ask.status);

  const isUrgent = () => {
    if (['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(ask.status)) return false;
    if (!ask.dueDate) return false;
    const due = new Date(ask.dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getStatusConfig = (status) => {
    const colors = {
      CREATED: 'bg-blue-500',
      OPEN: 'bg-[#F5D033]',
      MATCHED: 'bg-[#41942A]',
      FULFILLED: 'bg-[#A4D8A4]',
      CANCELLED: 'bg-red-500',
      EXPIRED: 'bg-slate-400',
    };
    return { label: t(`status.${status}`), color: colors[status] || 'bg-slate-400' };
  };

  const statusConfig = getStatusConfig(ask.status);

  // --- Lógica CU-11: Barra de Progreso de Donaciones Parciales ---
  const isQuantifiable = ask.type === 'THINGS' || ask.type === 'TIME';
  const targetQuantity = ask.type === 'THINGS' ? ask.quantityRequested : ask.estimatedHours;
  let totalDelivered = 0;
  let progressPercentage = 0;

  if (isQuantifiable && targetQuantity > 0 && ask.fulfillments) {
    totalDelivered = ask.fulfillments.reduce((sum, f) => sum + (f.quantityDelivered || 0), 0);
    progressPercentage = Math.min(100, Math.round((totalDelivered / targetQuantity) * 100));
  }

  const unitLabel = ask.type === 'THINGS' ? t('connectorView.unitsShort') : t('connectorView.hoursShort');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-50 w-full max-w-2xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in duration-300">

        {/* Cabecera */}
        <div className="bg-white sticky top-0 border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">
              {t('connectorView.detail')} - <span className="text-slate-500">#{ask.id.substring(0, 6)}</span>
            </h2>
            {isUrgent() && (
              <span className="bg-[#cc4b37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                {t('connectorView.urgent')}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* SECCIÓN UNIFICADA: Progreso + Historial de Entregas */}
          {!['CREATED'].includes(ask.status) && (
            <section className={`rounded-xl border p-4 ${isQuantifiable ? 'bg-blue-50/40 border-blue-100' : 'bg-purple-50/40 border-purple-100'}`}>

              {/* Cabecera con barra de progreso — solo THINGS/TIME */}
              {isQuantifiable ? (
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1.5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-blue-500" />
                      {t('connectorView.progressTitle')}
                    </h3>
                    <span className={`text-sm font-bold ${progressPercentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {totalDelivered} / {targetQuantity} {unitLabel} · {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-1000 ${progressPercentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <ClipboardCheck size={15} className="text-purple-500" />
                  {t('connectorView.serviceRecords')}
                </h3>
              )}

              {/* Listado de entregas individuales */}
              {ask.fulfillments && ask.fulfillments.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {ask.fulfillments.map((f, index) => {
                    const unit = ask.type === 'THINGS' ? t('connectorView.unitsShort') : ask.type === 'TIME' ? t('connectorView.hoursShort') : null;
                    const entryPct = isQuantifiable && targetQuantity > 0 && f.quantityDelivered
                      ? Math.round((f.quantityDelivered / targetQuantity) * 100)
                      : null;
                    const icon = ask.type === 'THINGS'
                      ? <Package size={13} className="text-blue-400" />
                      : ask.type === 'TIME'
                      ? <Clock size={13} className="text-green-400" />
                      : <Wrench size={13} className="text-purple-400" />;
                    return (
                      <div key={f.id} className="bg-white rounded-lg border border-slate-100 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {icon}
                            <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                            <span className="text-sm font-semibold text-slate-800 truncate">
                              {f.giver?.fullName || t('common.unspecified')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">
                            {new Date(f.deliveryDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {isQuantifiable && f.quantityDelivered != null && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-500">
                                <span className="font-bold text-slate-700">{f.quantityDelivered} {unit}</span> {t('connectorView.inThisDelivery')}
                              </span>
                              {entryPct !== null && (
                                <span className="text-xs font-bold text-slate-400">+{entryPct}%</span>
                              )}
                            </div>
                            {entryPct !== null && (
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full bg-blue-300"
                                  style={{ width: `${Math.min(100, entryPct)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        {!isQuantifiable && (
                          <p className="text-xs text-slate-500 mt-1">{t('connectorView.servicePerformed')}</p>
                        )}
                        {f.expertNotes && (
                          <p className="text-xs text-slate-400 mt-1.5 italic border-t border-slate-50 pt-1.5">"{f.expertNotes}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 mb-4">
                  <Package size={24} className="mx-auto mb-1 opacity-30" />
                  <p className="text-xs">{t('connectorView.noDeliveries')}</p>
                </div>
              )}

              {/* Formulario de nueva entrega — THINGS/TIME */}
              {isQuantifiable && ask.status === 'MATCHED' && progressPercentage < 100 && (
                <div className="pt-3 border-t border-blue-100">
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{t('connectorView.newDelivery')}</p>
                  <GiverSelector />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={targetQuantity - totalDelivered}
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      placeholder={`Máx. ${targetQuantity - totalDelivered} ${unitLabel}`}
                      className="flex-1 bg-white border border-blue-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-slate-900"
                      disabled={isSubmittingPartial}
                    />
                    <button
                      onClick={handlePartialSubmit}
                      disabled={isSubmittingPartial}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[90px]"
                    >
                      {isSubmittingPartial ? <Loader2 size={15} className="animate-spin" /> : t('connectorView.add')}
                    </button>
                  </div>
                  {partialError && <p className="text-red-500 text-xs mt-1">{partialError}</p>}
                </div>
              )}

              {/* Formulario de registro — EXPERTISE/SERVICES */}
              {!isQuantifiable && ask.status === 'MATCHED' && (
                <div className="pt-3 border-t border-purple-100">
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{t('connectorView.registerService')}</p>
                  <GiverSelector />
                  <textarea
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    placeholder={t('connectorView.serviceNotesPlaceholder')}
                    rows={2}
                    className="w-full bg-white text-slate-900 border border-purple-200 rounded-md px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none mb-2"
                    disabled={isSubmittingService}
                  />
                  {serviceError && <p className="text-red-500 text-xs mb-2">{serviceError}</p>}
                  <button
                    onClick={handleServiceSubmit}
                    disabled={isSubmittingService}
                    className="w-full bg-purple-600 text-white py-2 rounded-md text-sm font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingService ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    {isSubmittingService ? t('connectorView.registering') : t('connectorView.confirmService')}
                  </button>
                </div>
              )}

            </section>
          )}

          {/* Datos de la Petición */}
          <section>
            <h3 className="text-base font-bold text-slate-800 mb-4">{t('connectorView.askData')}</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-slate-500 block">{t('connectorView.state')}</label>
                <div className="flex items-center gap-2 mt-1">
                   <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}></div>
                   <span className="font-semibold text-slate-800">{statusConfig.label}</span>
                </div>
              </div>
              <div>
                <label className="text-slate-500 block">{t('connectorView.type')}</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.type}</p>
              </div>
              <div>
                <label className="text-slate-500 block">{t('connectorView.domain')}</label>
                <p className="font-semibold text-slate-800 mt-1">{translateDomain(ask.domain?.name) || t('common.unspecified')}</p>
              </div>
              <div>
                <label className="text-slate-500 block">{t('connectorView.org')}</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.asker?.organizationName || ask.asker?.contactPerson || t('common.entity')}</p>
              </div>
              <div>
                <label className="text-slate-500 block">{t('connectorView.due')}</label>
                <p className="font-semibold text-slate-800 mt-1">{ask.dueDate ? new Date(ask.dueDate).toLocaleDateString('es-ES') : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-slate-500 block">{t('connectorView.description')}</label>
                <p className="font-semibold text-slate-800 mt-1 whitespace-pre-wrap">{ask.description}</p>
              </div>
            </div>
          </section>

          {/* Asignación de Givers */}
          <section>
            <h3 className="text-base font-bold text-slate-800 mb-4">{t('connectorView.assignment')}</h3>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('connectorView.assignedGivers')}</h4>
             {ask.givers && ask.givers.length > 0 ? (
                <div className="space-y-2">
                    {ask.givers.map(giver => (
                        <div key={giver.id} className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg">
                           <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold text-white">
                                {giver.fullName.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                               <p className="font-bold text-sm text-slate-800">{giver.fullName}</p>
                               <p className="text-xs text-slate-500">{t('connectorView.coordinating')}</p>
                           </div>
                        </div>
                    ))}
                </div>
             ) : (
                <p className="text-sm text-slate-500 italic">{t('connectorView.noGivers')}</p>
             )}
          </section>

        </div>

        {/* Footer con Acciones */}
        <div className="bg-white sticky bottom-0 border-t border-slate-200 px-6 py-4 flex flex-wrap justify-end items-center gap-3 rounded-b-2xl">
          {isTerminal ? (
            <>
              <span className="mr-auto text-sm text-slate-500 italic">
                {t('connectorView.terminalNote').replace('{status}', statusConfig.label)}
              </span>
              {/* Historia de impacto (CU-05): solo para peticiones completadas */}
              {ask.status === 'FULFILLED' && onGenerateStory && (
                <button
                  onClick={() => onGenerateStory(ask)}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles size={16} /> {ask.story ? t('connectorView.viewStory') : t('connectorView.generateStory')}
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-slate-100 text-slate-700 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                {t('common.close')}
              </button>
            </>
          ) : (
            <>
              {(ask.status === 'OPEN' || ask.status === 'MATCHED') && (
                <button
                  onClick={() => onReassignGivers(ask)}
                  className="bg-slate-100 text-slate-700 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  {ask.status === 'OPEN' ? t('connectorView.assignGivers') : t('connectorView.reassignGivers')}
                </button>
              )}
              {ask.status === 'MATCHED' && (
                <button
                  onClick={() => {
                    if(window.confirm(t('kanban.confirmForce'))) {
                      if (typeof onForceComplete === 'function') onForceComplete(ask.id);
                    }
                  }}
                  className="bg-green-50 text-green-700 py-2 px-4 rounded-lg font-bold hover:bg-green-100 transition-colors"
                >
                  {t('connectorView.forceComplete')}
                </button>
              )}
              <button
                onClick={() => onCancelAsk(ask.id)}
                className="bg-red-50 text-red-600 py-2 px-4 rounded-lg font-bold hover:bg-red-100 transition-colors"
              >
                {t('connectorView.cancelAsk')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectorViewAskModal;
