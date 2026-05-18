import React, { useState } from 'react';
import { 
  Users2, 
  CalendarDays, 
  CheckCircle2, 
  Plus, 
  Edit, 
  Eye, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import CreateAskModal from '../components/asks/CreateAskModal';

/**
 * Dashboard Page Component
 * Central statistical view and detailed tables.
 * Now includes the "Create New Petition" modal logic.
 */
const Dashboard = () => {
  // Modal State Management
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-800">Panel - AskAuthor</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users2 size={28} />} 
          label="Total Organizaciones (Askers)" 
          value="8" 
          bgColor="bg-slate-500" 
        />
        <StatCard 
          icon={<CalendarDays size={28} />} 
          label="Peticiones (Asks) Abiertas" 
          value="5" 
          bgColor="bg-slate-600" 
        />
        <StatCard 
          icon={<CheckCircle2 size={28} />} 
          label="Peticiones (Asks) Completadas" 
          value="3" 
          bgColor="bg-slate-700" 
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <TabButton label="Mis Organizaciones (Askers)" status="INACTIVE" />
          <TabButton label="Mis Peticiones (Asks)" status="ACTIVE" isActive />
        </div>

        <div className="p-6 space-y-6">
          {/* Table Filters & Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <StatusFilter label="CREADA" color="bg-green-700" />
              <StatusFilter label="ABIERTA" color="bg-yellow-500" isActive />
              <StatusFilter label="COMPLETADA" color="bg-green-300" />
              <StatusFilter label="CANCELADA" color="bg-red-600" />
            </div>

            {/* Main Action: Open CU-01 Modal */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <Plus size={18} />
              Nueva Petición
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-4 pr-4">Título</th>
                  <th className="pb-4 px-4">Organización (Asker)</th>
                  <th className="pb-4 px-4">Tipo</th>
                  <th className="pb-4 px-4">Dominio</th>
                  <th className="pb-4 px-4">Vencimiento</th>
                  <th className="pb-4 px-4 text-center">Estado</th>
                  <th className="pb-4 pl-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-50">
                <TableRow 
                  title="Donación Muebles" 
                  asker="Fundación Solidaridad" 
                  type="COSAS" 
                  domain="Salud" 
                  date="20/06/2026" 
                  status="ABIERTA"
                  statusColor="bg-yellow-500"
                />
                <TableRow 
                  title="Taller Lectura" 
                  asker="Asociación Ruzafa" 
                  type="TIEMPO" 
                  domain="Educación" 
                  date="15/07/2026" 
                  status="ABIERTA"
                  statusColor="bg-yellow-500"
                />
                <TableRow 
                  title="Ayuda Mudanza" 
                  asker="ONG Ayuda Local" 
                  type="SERVICIOS" 
                  domain="Transportes" 
                  date="10/06/2026" 
                  status="COMPLETADA"
                  statusColor="bg-green-400"
                />
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-4 text-xs font-medium text-slate-400">
             <button className="flex items-center hover:text-slate-600"><ChevronLeft size={16}/> Anterior</button>
             <span className="text-slate-300">|</span>
             <button className="flex items-center hover:text-slate-600">Siguiente <ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {/* CU-01: Create New Petition Modal */}
      <CreateAskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

/* --- UI Sub-components --- */

const StatCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]`}>
    <div className="bg-white/20 p-3 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm opacity-80 font-medium">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

const TabButton = ({ label, status, isActive }) => (
  <button className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
    isActive 
      ? 'bg-white text-slate-800 border-b-2 border-blue-600' 
      : 'bg-slate-100 text-slate-400 hover:bg-slate-50'
  }`}>
    {label}
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
      {status}
    </span>
  </button>
);

const StatusFilter = ({ label, color, isActive }) => (
  <button className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-all ${
    isActive ? 'border-blue-600 ring-1 ring-blue-600 text-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
  }`}>
    <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
    {label}
  </button>
);

const TableRow = ({ title, asker, type, domain, date, status, statusColor }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="py-4 pr-4 font-medium">{title}</td>
    <td className="py-4 px-4">{asker}</td>
    <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase">{type}</td>
    <td className="py-4 px-4">{domain}</td>
    <td className="py-4 px-4">{date}</td>
    <td className="py-4 px-4">
      <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider">
        <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
        {status}
      </div>
    </td>
    <td className="py-4 pl-4 text-right">
      <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:text-blue-600 transition-colors"><Edit size={18}/></button>
        <button className="p-1 hover:text-blue-600 transition-colors"><Eye size={18}/></button>
      </div>
    </td>
  </tr>
);

export default Dashboard;
