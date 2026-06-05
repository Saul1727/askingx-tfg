import { useState, useEffect } from 'react';
import { Users2, CalendarDays, CheckCircle2, Loader2, Clock, LayoutDashboard, Database } from 'lucide-react';
import { getAllAsks, getAskers, getDomains } from '../services/askService';
import { getUser } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t('dashboard.connectorTitle')}</h2>
        <p className="text-slate-500 text-sm mt-1">{t('dashboard.connectorSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard icon={<CalendarDays size={24} className="md:w-7 md:h-7" />} label={t('dashboard.openNow')} value={openCount} bgColor="bg-[#F5D033]" />
        <MetricCard icon={<Clock size={24} className="md:w-7 md:h-7" />} label={t('dashboard.matchedNow')} value={matchedCount} bgColor="bg-[#41942A]" />
        <MetricCard icon={<CheckCircle2 size={24} className="md:w-7 md:h-7" />} label={t('dashboard.completedHist')} value={fulfilledCount} bgColor="bg-[#A4D8A4]" />
      </div>
    </div>
  );
};

// --- AUTHOR DASHBOARD ---
const AuthorDashboard = () => {
  const { t } = useLanguage();
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
  const expiredCount = asks.filter(a => a.status === 'EXPIRED').length;

  const data = {
    labels: [t('chart.created'), t('chart.open'), t('chart.matched'), t('chart.fulfilled'), t('chart.cancelled'), t('chart.expired')],
    datasets: [
      {
        data: [createdCount, openCount, matchedCount, fulfilledCount, cancelledCount, expiredCount],
        backgroundColor: ['#3b82f6', '#F5D033', '#41942A', '#A4D8A4', '#ef4444', '#64748b'],
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
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t('dashboard.authorTitle')}</h2>
        <p className="text-slate-500 text-sm mt-1">{t('dashboard.authorSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard icon={<Users2 size={24} className="md:w-7 md:h-7" />} label={t('dashboard.orgsCreated')} value={askers.length} bgColor="bg-slate-600" />
        <MetricCard icon={<LayoutDashboard size={24} className="md:w-7 md:h-7" />} label={t('dashboard.totalAsks')} value={asks.length} bgColor="bg-slate-700" />
        <MetricCard icon={<CheckCircle2 size={24} className="md:w-7 md:h-7" />} label={t('dashboard.fulfilled')} value={fulfilledCount} bgColor="bg-[#A4D8A4]" />
        <MetricCard icon={<Clock size={24} className="md:w-7 md:h-7" />} label={t('dashboard.expired')} value={expiredCount} bgColor="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 w-full overflow-hidden">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-6">{t('dashboard.distribution')}</h3>
          <div className="h-64 md:h-80 w-full flex items-center justify-center relative">
            {asks.length > 0 ? (
              <Pie data={data} options={options} />
            ) : (
              <p className="text-slate-500 italic text-sm">{t('dashboard.noData')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const { t } = useLanguage();
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
  const expiredCount = asks.filter(a => a.status === 'EXPIRED').length;

  const data = {
    labels: [t('chart.created'), t('chart.open'), t('chart.matched'), t('chart.fulfilled'), t('chart.cancelled'), t('chart.expired')],
    datasets: [
      {
        data: [createdCount, openCount, matchedCount, fulfilledCount, cancelledCount, expiredCount],
        backgroundColor: ['#3b82f6', '#F5D033', '#41942A', '#A4D8A4', '#ef4444', '#64748b'],
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
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t('dashboard.adminTitle')}</h2>
        <p className="text-slate-500 text-sm mt-1">{t('dashboard.adminSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <MetricCard icon={<LayoutDashboard size={24} className="md:w-7 md:h-7" />} label={t('dashboard.totalAsks')} value={asks.length} bgColor="bg-slate-800" />
        <MetricCard icon={<Users2 size={24} className="md:w-7 md:h-7" />} label={t('dashboard.totalOrgs')} value={askers.length} bgColor="bg-slate-600" />
        <MetricCard icon={<Database size={24} className="md:w-7 md:h-7" />} label={t('dashboard.totalDomains')} value={domains.length} bgColor="bg-blue-600" />
        <MetricCard icon={<Clock size={24} className="md:w-7 md:h-7" />} label={t('dashboard.matched')} value={matchedCount} bgColor="bg-[#41942A]" />
        <MetricCard icon={<CheckCircle2 size={24} className="md:w-7 md:h-7" />} label={t('dashboard.fulfilled')} value={fulfilledCount} bgColor="bg-[#A4D8A4]" />
        <MetricCard icon={<CalendarDays size={24} className="md:w-7 md:h-7" />} label={t('dashboard.expired')} value={expiredCount} bgColor="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 w-full overflow-hidden">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-6">{t('dashboard.globalState')}</h3>
          <div className="h-64 md:h-80 w-full flex items-center justify-center relative">
            {asks.length > 0 ? (
               <Pie data={data} options={options} />
            ) : (
               <p className="text-slate-500 italic text-sm">{t('dashboard.noData')}</p>
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