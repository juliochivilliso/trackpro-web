"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReports, ReportPeriod } from "../../hooks/useReports";
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Wrench, 
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";

type Tab = "resumen" | "conductores" | "alertas" | "mantenimiento";

export default function ReportesPage() {
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const { getReportData } = useReports();

  const data = getReportData(period);

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-background)] p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Reportes y Analíticas
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Métricas clave, comportamiento de conductores y estado de la flota
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-[var(--color-surface-glass)]/50 p-1 border border-[var(--color-border-glass)] rounded-xl">
          {(["today", "week", "month"] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                period === p 
                  ? "bg-blue-500/20 text-blue-400 font-medium" 
                  : "text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {p === "today" ? "Hoy" : p === "week" ? "Esta semana" : "Este mes"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-glass)] mb-6 gap-6">
        <TabButton icon={<Activity />} label="Resumen de Flota" isActive={activeTab === "resumen"} onClick={() => setActiveTab("resumen")} />
        <TabButton icon={<Users />} label="Conductores" isActive={activeTab === "conductores"} onClick={() => setActiveTab("conductores")} />
        <TabButton icon={<AlertTriangle />} label="Alertas & Diagnóstico" isActive={activeTab === "alertas"} onClick={() => setActiveTab("alertas")} />
        <TabButton icon={<Wrench />} label="Mantenimiento" isActive={activeTab === "mantenimiento"} onClick={() => setActiveTab("mantenimiento")} />
      </div>

      {/* Tab Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === "resumen" && <ResumenTab data={data} />}
            {activeTab === "conductores" && <ConductoresTab data={data} />}
            {activeTab === "alertas" && <AlertasTab data={data} />}
            {activeTab === "mantenimiento" && <MantenimientoTab data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Tabs Wrapper Components ---

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
        isActive 
          ? "border-blue-400 text-blue-400" 
          : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// --- TAB 1: Resumen de Flota ---
function ResumenTab({ data }: { data: any }) {
  const maxKm = Math.max(...data.weeklyKmChart.map((d: any) => d.km));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.kpiCards.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5 hover:bg-white/5 transition-colors">
            <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">{kpi.label}</h3>
            <p className="text-2xl font-semibold font-mono text-white mb-2">{kpi.value}</p>
            <p className="text-xs text-green-400">{kpi.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Gráfica */}
        <div className="lg:col-span-2 bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5 flex flex-col h-[300px]">
          <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-6">Kilómetros Recorridos</h3>
          <div className="flex-1 flex items-end justify-between gap-2 px-2 mt-auto">
            {data.weeklyKmChart.map((d: any, i: number) => {
              const heightPct = (d.km / maxKm) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                  <div className="w-full flex justify-center items-end relative h-[180px] group-hover:opacity-80 transition-opacity">
                    <div 
                      className="w-10 bg-gradient-to-t from-blue-600/40 to-blue-400/80 rounded-t-md transition-all duration-500 relative"
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111] text-xs font-mono px-2 py-1 rounded border border-white/10 pointer-events-none">
                        {d.km}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5 flex flex-col h-[300px]">
          <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">Ranking de Vehículos</h3>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {data.vehicleRanking.map((v: any, i: number) => (
              <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{v.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-mono">{v.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">{v.km} km</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{v.trips} viajes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- TAB 2: Conductores ---
function ConductoresTab({ data }: { data: any }) {
  const [sortCol, setSortCol] = useState<string>("score");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false); // default desc for new col
    }
  };

  const sortedData = [...data.driverStats].sort((a: any, b: any) => {
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getScoreColor = (score: number) => {
    if (score < 70) return "bg-red-500";
    if (score < 85) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-transparent border-b border-[var(--color-border-glass)] text-[var(--color-text-secondary)] text-xs uppercase">
            <tr>
              {["Conductor", "Viajes", "Km", "Velocidad Promedio", "Rendimiento", "Score"].map((hd, i) => {
                const cols = ["name", "trips", "km", "avgSpeed", "fuelEff", "score"];
                const colKey = cols[i];
                return (
                  <th key={hd} className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort(colKey)}>
                    <div className="flex items-center gap-1">
                      {hd}
                      {sortCol === colKey && (
                        sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-glass)]">
            {sortedData.map((d: any, idx: number) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{d.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-mono">{d.driverId}</p>
                </td>
                <td className="px-6 py-4 font-mono text-[var(--color-text-secondary)]">{d.trips}</td>
                <td className="px-6 py-4 font-mono text-[var(--color-text-secondary)]">{d.km} km</td>
                <td className="px-6 py-4 font-mono text-[var(--color-text-secondary)]">{d.avgSpeed} km/h</td>
                <td className="px-6 py-4 font-mono text-[var(--color-text-secondary)]">{d.fuelEff}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium min-w-[2rem]">{d.score}</span>
                    <div className="w-full max-w-[100px] h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getScoreColor(d.score)}`}
                        style={{ width: `${d.score}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- TAB 3: Alertas & Diagnóstico ---
function AlertasTab({ data }: { data: any }) {
  const maxAlerts = Math.max(...data.dailyAlertTrend.map((d: any) => d.count));

  const colors: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    gray: "text-gray-400 bg-gray-500/10 border-gray-500/20"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Distribución por Categoría */}
        <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5 md:col-span-1">
          <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">Alertas por Categoría</h3>
          <div className="flex flex-col gap-3">
            {data.alertsByCategory.map((a: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className={`px-2.5 py-1 text-xs rounded-lg border ${colors[a.color] || colors.gray}`}>
                  {a.category}
                </span>
                <span className="font-mono text-sm">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severidad */}
        <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5 md:col-span-1 flex flex-col justify-center gap-4">
          <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-2">Por Severidad</h3>
          <div className="flex gap-4 items-center">
             <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center font-mono font-bold text-red-500">
               {data.alertsBySeverity.critical}
             </div>
             <div>
               <p className="text-sm font-medium text-white">Críticas</p>
               <p className="text-xs text-[var(--color-text-secondary)]">Atención inmediata</p>
             </div>
          </div>
          <div className="flex gap-4 items-center">
             <div className="w-12 h-12 rounded-full border-4 border-yellow-500 flex items-center justify-center font-mono font-bold text-yellow-500">
               {data.alertsBySeverity.warning}
             </div>
             <div>
               <p className="text-sm font-medium text-white">Advertencia</p>
               <p className="text-xs text-[var(--color-text-secondary)]">Monitoreo</p>
             </div>
          </div>
          <div className="flex gap-4 items-center">
             <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-mono font-bold text-blue-500">
               {data.alertsBySeverity.info}
             </div>
             <div>
               <p className="text-sm font-medium text-white">Info</p>
               <p className="text-xs text-[var(--color-text-secondary)]">Notificaciones</p>
             </div>
          </div>
        </div>

        {/* Gráfica de Tendencia */}
        <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5 md:col-span-1 flex flex-col">
          <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">Tendencia Diaria</h3>
          <div className="flex-1 flex items-end justify-between gap-1 mt-auto h-[150px]">
            {data.dailyAlertTrend.map((d: any, i: number) => {
              const heightPct = maxAlerts > 0 ? (d.count / maxAlerts) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex justify-center items-end relative h-[120px]">
                    <div 
                      className="w-8 bg-red-500/40 rounded-t-md"
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DTC Codes */}
      <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5">
        <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">Códigos DTC Frecuentes (OBD2)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.topDtcCodes.map((dtc: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2">
               <div className="flex justify-between items-start">
                  <span className="font-mono text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">{dtc.code}</span>
                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">{dtc.count} veces</span>
               </div>
               <p className="text-sm font-medium text-white">{dtc.desc}</p>
               <p className="text-xs text-[var(--color-text-secondary)] truncate">Vehículo: {dtc.vehicle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- TAB 4: Mantenimiento ---
function MantenimientoTab({ data }: { data: any }) {
  const getStatusBadge = (status: string) => {
    if (status === "VENCIDO") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (status === "PRÓXIMO") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-green-500/10 text-green-400 border-green-500/20";
  };
  
  const getUrgencyBadge = (urgency: string) => {
    if (urgency === "critical") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (urgency === "warning") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6 flex flex-col justify-center items-center text-center">
             <Wrench className="w-8 h-8 text-blue-400 mb-2" />
             <p className="text-3xl font-mono font-bold text-white mb-1">{data.maintenanceSummary.alDia}</p>
             <p className="text-sm text-[var(--color-text-secondary)]">Vehículos al Día</p>
          </div>
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6 flex flex-col justify-center items-center text-center">
             <CalendarDays className="w-8 h-8 text-yellow-400 mb-2" />
             <p className="text-3xl font-mono font-bold text-white mb-1">{data.maintenanceSummary.proximos}</p>
             <p className="text-sm text-[var(--color-text-secondary)]">Mantenimiento Próximo</p>
          </div>
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6 flex flex-col justify-center items-center text-center ring-1 ring-red-500/30">
             <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
             <p className="text-3xl font-mono font-bold text-red-400 mb-1">{data.maintenanceSummary.vencidos}</p>
             <p className="text-sm text-red-400/80">Servicios Vencidos</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehículos Estado */}
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5">
             <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">Estado por Vehículo</h3>
             <div className="space-y-3">
               {data.vehicleMaintenanceStatus.map((v: any, i: number) => (
                 <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 gap-3">
                   <div>
                     <p className="font-medium text-white text-sm">{v.name}</p>
                     <p className="text-xs text-[var(--color-text-secondary)] font-mono">{v.id} • Odómetro: {v.odometer}</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="text-right">
                       <p className="text-xs text-[var(--color-text-secondary)] mb-1">Próx. Aceite</p>
                       <p className="text-sm font-mono">{v.nextOilKm}</p>
                     </div>
                     <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatusBadge(v.status)}`}>
                       {v.status}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Próximos Servicios */}
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-5">
             <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">Próximos Servicios Programados</h3>
             <div className="space-y-3">
               {data.upcomingServices.map((srv: any, i: number) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                   <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${srv.urgency === 'critical' ? 'bg-red-500' : srv.urgency === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                     <div>
                       <p className="font-medium text-white flex items-center gap-2">
                         {srv.service}
                         {srv.dueInKm === 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase border border-red-500/30">Vencido</span>}
                       </p>
                       <p className="text-xs text-[var(--color-text-secondary)]">{srv.vehicle}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-[var(--color-text-secondary)]">Faltan</p>
                     <p className="text-sm font-mono font-medium">{srv.dueInKm} km</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
       </div>
    </div>
  );
}
