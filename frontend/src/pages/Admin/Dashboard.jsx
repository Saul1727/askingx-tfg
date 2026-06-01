import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/statsService';
import { Award, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';

/**
 * ActiveConnectorListItem Component
 * @param {object} props - The component props.
 * @param {object} props.connector - The connector data.
 * @param {number} props.rank - The rank of the connector in the list.
 * @returns {JSX.Element} A list item representing an active connector.
 */
const ActiveConnectorListItem = ({ connector, rank }) => (
    <li className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-400 w-6 text-center">{rank}</span>
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {connector.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="font-medium text-slate-800">{connector.fullName}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{connector.askCount}</span>
            <span className="text-sm text-slate-500">peticiones</span>
            <Award size={16} className="text-amber-500" />
        </div>
    </li>
);

/**
 * AdminDashboard Page
 * @description
 * This page displays key performance indicators and statistics for the platform,
 * providing administrators with a high-level overview of system activity.
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="p-8 h-full flex justify-center items-center"><Loader2 className="animate-spin text-slate-400" size={40}/></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error al cargar el dashboard: {error}</div>;
  }

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Panel de Estadísticas</h1>
      
      {/* Grid of main statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          label="Peticiones Completadas (Mes)" 
          value={stats?.completedThisMonth ?? 0}
          icon={<CheckCircle size={24} className="text-green-600"/>}
          bgColor="bg-green-100 text-green-900"
        />
        <MetricCard 
          label="Peticiones Pendientes" 
          value={stats?.pendingAsks ?? 0}
          icon={<Clock size={24} className="text-amber-600"/>}
          bgColor="bg-amber-100 text-amber-900"
        />
        <MetricCard 
          label="Peticiones Caducadas" 
          value={stats?.expiredAsks ?? 0}
          icon={<AlertTriangle size={24} className="text-red-600"/>}
          bgColor="bg-red-100 text-red-900"
        />
      </div>

      {/* List of most active connectors */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Connectors más Activos</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
          <ul className="divide-y divide-slate-200">
            {stats?.activeConnectors?.length > 0 ? (
              stats.activeConnectors.map((connector, index) => (
                <ActiveConnectorListItem key={connector.id} connector={connector} rank={index + 1} />
              ))
            ) : (
              <p className="text-center py-4 text-slate-500">No hay datos de conectores todavía.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
