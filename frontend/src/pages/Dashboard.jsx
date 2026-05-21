import React, { useState, useEffect } from 'react';
import { Users2, CalendarDays, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
import { getAllAsks, getAskers } from '../services/askService';

const Dashboard = () => {
  const [asksList, setAsksList] = useState([]);
  const [askersList, setAskersList] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getAllAsks(), getAskers()])
      .then(([asksData, askersData]) => {
        setAsksList(asksData);
        setAskersList(askersData);
      })
      .catch((err) => console.error("Error cargando Dashboard:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = {
    askers: askersList.length,
    open: asksList.filter(ask => ask.status === 'OPEN').length,
    fulfilled: asksList.filter(ask => ask.status === 'FULFILLED').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Panel de Control - AskAuthor</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen estadístico del impacto y gestión global.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users2 size={28} />} label="Total Organizaciones" value={isLoading ? '-' : stats.askers} bgColor="bg-slate-500" />
        <StatCard icon={<CalendarDays size={28} />} label="Peticiones Abiertas" value={isLoading ? '-' : stats.open} bgColor="bg-slate-600" />
        <StatCard icon={<CheckCircle2 size={28} />} label="Peticiones Completadas" value={isLoading ? '-' : stats.fulfilled} bgColor="bg-slate-700" />
      </div>

      {/* Panel Informativo Temporal */}
      <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-4 bg-white rounded-full shadow-sm text-slate-400">
          <BarChart3 size={40} />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Módulo de Analítica Activo</h3>
        <p className="text-slate-500 text-sm max-w-sm">Utiliza el menú lateral para gestionar las Organizaciones y las Peticiones en sus respectivas vistas dedicadas.</p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]`}>
    <div className="bg-white/20 p-3 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm opacity-80 font-medium">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

export default Dashboard;