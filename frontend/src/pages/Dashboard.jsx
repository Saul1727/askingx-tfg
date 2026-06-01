import { useState, useEffect } from 'react';
import { Users2, CalendarDays, CheckCircle2, Loader2, Clock, LayoutDashboard, Database } from 'lucide-react';
import { getAllAsks, getAskers, getDomains } from '../services/askService';
import { getUser } from '../services/authService';
import MetricCard from '../components/common/MetricCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

// --- CONNECTOR DASHBOARD ---
const ConnectorDashboard = () => {
  const [asks, setAsks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllAsks()
      .then(setAsks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const openCount = asks.filter(a => a.status === 'OPEN').length;
  const matchedCount = asks.filter(a => a.status === 'MATCHED').length;
  const fulfilledCount = asks.filter(a => a.status === 'FULFILLED').length;

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Panel de Control - Connector</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen de tus peticiones gestionadas y pendientes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard icon={<CalendarDays size={24} className="md:w-7 md:h-7" />} label="Peticiones Abiertas (Actuales)" value={openCount} bgColor="bg-[#F5D033]" />
        <MetricCard icon={<Clock size={24} className="md:w-7 md:h-7" />} label="Asignadas / Matched (Actuales)" value={matchedCount} bgColor="bg-[#41942A]" />
        <MetricCard icon={<CheckCircle2 size={24} className="md:w-7 md:h-7" />} label="Completadas (Histórico)" value={fulfilledCount} bgColor="bg-[#A4D8A4]" />
      </div>
    </div>
  );
};

// --- AUTHOR DASHBOARD ---
const AuthorDashboard = () => {
  const [asks, setAsks] = useState([]);
  const [askers, setAskers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllAsks(), getAskers()])
      .then(([asksData, askersData]) => {
        setAsks(asksData);
        setAskers(askersData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const createdCount = asks.filter(a => a.status === 'CREATED').length;
  const openCount = asks.filter(a => a.status === 'OPEN').length;
  const matchedCount = asks.filter(a => a.status === 'MATCHED').length;
  const fulfilledCount = asks.filter(a => a.status === 'FULFILLED').length;
  const cancelledCount = asks.filter(a => a.status === 'CANCELLED').length;

  const data = {
    labels: ['Creadas', 'Abiertas', 'Asignadas', 'Completadas', 'Canceladas'],
    datasets: [
      {
        data: [createdCount, openCount, matchedCount, fulfilledCount, cancelledCount],
        backgroundColor: ['#3b82f6', '#F5D033', '#41942A', '#A4D8A4', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: "'Inter', sans-serif" } }
      }
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Panel de Control - Author</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen estadístico del impacto y gestión de tus organizaciones.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard icon={<Users2 size={24} className="md:w-7 md:h-7" />} label="Organizaciones Creadas" value={askers.length} bgColor="bg-slate-600" />
        <MetricCard icon={<LayoutDashboard size={24} className="md:w-7 md:h-7" />} label="Total Peticiones" value={asks.length} bgColor="bg-slate-700" />
        <MetricCard icon={<CheckCircle2 size={24} className="md:w-7 md:h-7" />} label="Peticiones Completadas" value={fulfilledCount} bgColor="bg-[#A4D8A4]" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 w-full overflow-hidden">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-6">Distribución de Peticiones por Estado</h3>
          <div className="h-64 md:h-80 w-full flex items-center justify-center relative">
            {asks.length > 0 ? (
              <Pie data={data} options={options} />
            ) : (
              <p className="text-slate-500 italic text-sm">No hay peticiones para mostrar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const [asks, setAsks] = useState([]);
  const [askers, setAskers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllAsks(), getAskers(), getDomains()])
      .then(([asksData, askersData, domainsData]) => {
        setAsks(asksData);
        setAskers(askersData);
        setDomains(domainsData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const createdCount = asks.filter(a => a.status === 'CREATED').length;
  const openCount = asks.filter(a => a.status === 'OPEN').length;
  const matchedCount = asks.filter(a => a.status === 'MATCHED').length;
  const fulfilledCount = asks.filter(a => a.status === 'FULFILLED').length;
  const cancelledCount = asks.filter(a => a.status === 'CANCELLED').length;

  const data = {
    labels: ['Creadas', 'Abiertas', 'Asignadas', 'Completadas', 'Canceladas'],
    datasets: [
      {
        data: [createdCount, openCount, matchedCount, fulfilledCount, cancelledCount],
        backgroundColor: ['#3b82f6', '#F5D033', '#41942A', '#A4D8A4', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: "'Inter', sans-serif" } }
      }
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Panel de Control - Administrador</h2>
        <p className="text-slate-500 text-sm mt-1">Visión global de todo el sistema.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <MetricCard icon={<LayoutDashboard size={24} className="md:w-7 md:h-7" />} label="Total Peticiones" value={asks.length} bgColor="bg-slate-800" />
        <MetricCard icon={<Users2 size={24} className="md:w-7 md:h-7" />} label="Total Organizaciones" value={askers.length} bgColor="bg-slate-600" />
        <MetricCard icon={<Database size={24} className="md:w-7 md:h-7" />} label="Total Dominios" value={domains.length} bgColor="bg-blue-600" />
        <MetricCard icon={<Clock size={24} className="md:w-7 md:h-7" />} label="Peticiones Asignadas" value={matchedCount} bgColor="bg-[#41942A]" />
        <MetricCard icon={<CheckCircle2 size={24} className="md:w-7 md:h-7" />} label="Peticiones Completadas" value={fulfilledCount} bgColor="bg-[#A4D8A4]" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 w-full overflow-hidden">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-6">Estado Global de Peticiones</h3>
          <div className="h-64 md:h-80 w-full flex items-center justify-center relative">
            {asks.length > 0 ? (
               <Pie data={data} options={options} />
            ) : (
               <p className="text-slate-500 italic text-sm">No hay peticiones para mostrar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ROUTER ---
const Dashboard = () => {
  const currentUser = getUser();

  if (!currentUser) return <div className="p-8">No autorizado.</div>;

  switch (currentUser.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'CONNECTOR':
      return <ConnectorDashboard />;
    case 'AUTHOR':
      return <AuthorDashboard />;
    default:
      return <div className="p-8">Vista no disponible para tu rol.</div>;
  }
};

export default Dashboard;