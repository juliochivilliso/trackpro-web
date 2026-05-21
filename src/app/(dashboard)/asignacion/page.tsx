"use client";

import { useState, useMemo } from "react";
import { useFleet } from "../../hooks/useFleet";
import { useDrivers, Driver } from "../../hooks/useDrivers";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Users,
  Car,
  Radio,
  Cpu,
  Shield,
  Star,
  Phone,
  IdCard,
  Clock,
  X,
  ChevronRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from "lucide-react";

type DriverTab = 'all' | 'available' | 'assigned' | 'off-duty';

function DeviceStatusDot({ status }: { status: 'connected' | 'disconnected' | 'warning' }) {
  const color = status === 'connected' ? 'bg-green-400' : status === 'warning' ? 'bg-yellow-400' : 'bg-red-400';
  return <div className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

function getStatusBadge(status: Driver['status']) {
  switch (status) {
    case 'available': return { label: 'Disponible', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
    case 'assigned': return { label: 'Asignado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'off-duty': return { label: 'Libre', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AsignacionPage() {
  const { fleet, setVehicleDriver } = useFleet();
  const { drivers, assignmentHistory, assignDriver, unassignDriver, getDriverByVehicle } = useDrivers();

  const [driverTab, setDriverTab] = useState<DriverTab>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState<string | null>(null);

  const filteredDrivers = useMemo(() => {
    switch (driverTab) {
      case 'available': return drivers.filter(d => d.status === 'available');
      case 'assigned': return drivers.filter(d => d.status === 'assigned');
      case 'off-duty': return drivers.filter(d => d.status === 'off-duty');
      default: return drivers;
    }
  }, [drivers, driverTab]);

  const handleAssignClick = (driverId: string) => {
    setSelectedDriverForAssign(driverId);
    setAssignModalOpen(true);
  };

  const handleAssignToVehicle = (vehicleId: string) => {
    if (!selectedDriverForAssign) return;
    const vehicle = fleet.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    assignDriver(selectedDriverForAssign, vehicleId, vehicle.name);
    setVehicleDriver(vehicleId, selectedDriverForAssign);
    setAssignModalOpen(false);
    setSelectedDriverForAssign(null);
  };

  const handleUnassign = (driverId: string, vehicleId: string) => {
    unassignDriver(driverId);
    setVehicleDriver(vehicleId, null);
  };

  const recentHistory = assignmentHistory.slice(0, 10);

  const tabs: { key: DriverTab; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'available', label: 'Disponibles' },
    { key: 'assigned', label: 'Asignados' },
    { key: 'off-duty', label: 'Libre' },
  ];

  return (
    <div className="page-container custom-scrollbar">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[var(--color-accent-blue)]" />
            Asignación de Conductores
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gestiona la asignación de conductores a los vehículos de la flota
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-5 gap-4">
        {/* LEFT: Drivers Column (40%) */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Driver Tabs */}
          <div className="flex items-center gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setDriverTab(tab.key)}
                className={`filter-pill ${driverTab === tab.key ? 'active active-all' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Driver Cards */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredDrivers.map((driver, index) => {
                const badge = getStatusBadge(driver.status);
                return (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="stats-card"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {driver.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{driver.name}</h3>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-secondary)] mb-2">
                          <span className="flex items-center gap-1 font-mono">
                            <IdCard className="w-3 h-3" /> {driver.cedula}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] font-mono font-bold">
                            Lic. {driver.licenseType}
                          </span>
                          
                          {/* Expiration Date */}
                          <span className={`flex items-center gap-1 font-mono px-1.5 py-0.5 rounded ${
                            new Date(driver.licenseExpiration) < new Date() 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : new Date(driver.licenseExpiration) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-[var(--color-surface-hover)]'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            Exp: {driver.licenseExpiration}
                            {new Date(driver.licenseExpiration) < new Date() && <AlertTriangle className="w-2.5 h-2.5" />}
                          </span>
                        </div>

                        {/* Score bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <div className="flex-1 h-1.5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${driver.score}%`,
                                background: driver.score >= 90 ? '#22c55e' : driver.score >= 80 ? '#eab308' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[var(--color-text-primary)]">{driver.score}</span>
                        </div>

                        {/* Actions */}
                        {driver.status === 'available' && (
                          <button
                            onClick={() => handleAssignClick(driver.id)}
                            className="glass-button px-3 py-1 text-[10px] gap-1 text-blue-400 hover:bg-blue-500/10"
                          >
                            <ChevronRight className="w-3 h-3" /> Asignar
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredDrivers.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No hay conductores en esta categoría.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Vehicles Column (60%) */}
        <div className="col-span-3 flex flex-col gap-3">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5" /> Vehículos y Asignaciones
          </h2>

          {fleet.vehicles.map((vehicle, index) => {
            const driver = getDriverByVehicle(vehicle.id);
            const isOnline = vehicle.status === 'online';

            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="stats-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-gray-500'}`} />
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                        {vehicle.name} <span className="text-[var(--color-text-secondary)] font-mono text-xs font-normal">({vehicle.id})</span>
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] font-mono">{vehicle.plate}</p>
                    </div>
                  </div>

                  {/* Device chips */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)]">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      <DeviceStatusDot status={vehicle.devices.gps.status} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)]">
                      <Cpu className="w-3 h-3 text-purple-400" />
                      <DeviceStatusDot status={vehicle.devices.obd.status} />
                    </div>
                  </div>
                </div>

                {/* Assignment area */}
                <div className="mt-3 pt-3 border-t border-[var(--color-border-glass)]">
                  {driver ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {driver.avatar}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-[var(--color-text-primary)]">{driver.name}</span>
                          <span className="text-[9px] text-blue-400 font-medium ml-2 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                            Conductor activo
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnassign(driver.id, vehicle.id)}
                        className="glass-button px-2 py-1 text-[10px] gap-1 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-3 h-3" /> Liberar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)] italic">Sin asignación</span>
                      <button
                        onClick={() => {
                          setSelectedDriverForAssign(null);
                          setAssignModalOpen(true);
                        }}
                        className="glass-button px-2 py-1 text-[10px] gap-1 text-blue-400 hover:bg-blue-500/10"
                      >
                        <UserCheck className="w-3 h-3" /> Asignar
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Assignment History */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Historial de Asignaciones
        </h2>
        <div className="stats-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-glass)]">
                  <th className="text-left py-2 px-3 text-[var(--color-text-secondary)] font-medium uppercase tracking-wider text-[10px]">Conductor</th>
                  <th className="text-left py-2 px-3 text-[var(--color-text-secondary)] font-medium uppercase tracking-wider text-[10px]">Vehículo</th>
                  <th className="text-left py-2 px-3 text-[var(--color-text-secondary)] font-medium uppercase tracking-wider text-[10px]">Inicio</th>
                  <th className="text-left py-2 px-3 text-[var(--color-text-secondary)] font-medium uppercase tracking-wider text-[10px]">Fin</th>
                  <th className="text-left py-2 px-3 text-[var(--color-text-secondary)] font-medium uppercase tracking-wider text-[10px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--color-border-glass)]/50 hover:bg-[var(--color-surface-hover)]/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium text-[var(--color-text-primary)]">{record.driverName}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-text-secondary)]">{record.vehicleName}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-text-secondary)]">{formatDate(record.startTime)}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-text-secondary)]">{record.endTime ? formatDate(record.endTime) : '—'}</td>
                    <td className="py-2.5 px-3">
                      {record.status === 'active' ? (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">Activo</span>
                      ) : (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">Completado</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setAssignModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">Seleccionar Vehículo</h3>
                <button onClick={() => setAssignModalOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                Selecciona un vehículo para asignar al conductor
              </p>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                {fleet.vehicles.filter(v => !getDriverByVehicle(v.id)).map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleAssignToVehicle(vehicle.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)]/30 hover:bg-[var(--color-surface-hover)] transition-all text-left"
                  >
                    <Car className="w-5 h-5 text-[var(--color-accent-blue)]" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{vehicle.name}</span>
                      <span className="text-xs text-[var(--color-text-secondary)] ml-2 font-mono">{vehicle.plate}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
                {fleet.vehicles.filter(v => !getDriverByVehicle(v.id)).length === 0 && (
                  <div className="text-center py-6 text-[var(--color-text-secondary)]">
                    <Shield className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Todos los vehículos tienen conductor asignado.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

