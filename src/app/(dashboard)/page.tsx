"use client";

import { Battery, MapPin, Navigation, Signal, Zap } from "lucide-react";
import { useFleet } from "../hooks/useFleet";
import { FleetMap } from "../components/FleetMap";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { fleet, selectVehicle, toggleFollow, getSelectedVehicle, centerFleet } = useFleet();
  
  const selectedVehicle = getSelectedVehicle();
  const onlineCount = useMemo(() => fleet.vehicles.filter(v => v.status === "online").length, [fleet.vehicles]);
  const alertCount = useMemo(() => fleet.vehicles.filter(v => v.hasAlert).length, [fleet.vehicles]);

  const [cutEngineModal, setCutEngineModal] = useState({ open: false, vehicleId: "", vehicleName: "" });
  const [toast, setToast] = useState({ show: false, msg: "" });

  const handleCutEngine = () => {
    if (!selectedVehicle) return;
    setCutEngineModal({ open: true, vehicleId: selectedVehicle.id, vehicleName: selectedVehicle.name });
  };

  const confirmCutEngine = () => {
    const id = cutEngineModal.vehicleId;
    setCutEngineModal({ open: false, vehicleId: "", vehicleName: "" });
    setToast({ show: true, msg: `Comando enviado a ${id} — Motor cortado` });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <div className="flex h-full w-full">
      {/* Map Area (Main Content) */}
      <div className="flex-1 relative bg-[#0a0a0a] rounded-xl overflow-hidden glass-panel border-0">
        <FleetMap 
          vehicles={fleet.vehicles}
          selectedVehicleId={fleet.selectedVehicleId}
          followVehicle={fleet.followVehicle}
          onSelectVehicle={selectVehicle}
          onToggleFollow={toggleFollow}
          onCenterFleet={centerFleet}
        />
        
        {/* Faux Gradients to blend Map with UI */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[var(--color-surface-glass)]/20 via-transparent to-transparent"></div>
      </div>

      {/* Right Side Panel: Detail / Flota */}
      <div className="w-80 h-full border-l border-[var(--color-border-glass)] bg-[var(--color-surface-glass)]/20 p-4 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Flota Activa</h2>
        
        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            title="Vehículos Online" 
            value={onlineCount.toString()} 
            unit="activos" 
            icon={<Signal className="w-4 h-4 text-green-400" />} 
          />
          <StatCard 
            title="Alertas Activas" 
            value={alertCount.toString()} 
            unit="eventos" 
            icon={<Zap className={`w-4 h-4 ${alertCount > 0 ? "text-red-400 animate-pulse" : "text-amber-400"}`} />} 
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-glass)] to-transparent my-2"></div>

        {/* Vehicle Cards List */}
        <div className="flex flex-col gap-3">
          {fleet.vehicles.map((v) => (
            <VehicleCard 
              key={v.id}
              vehicle={v}
              active={fleet.selectedVehicleId === v.id}
              onClick={() => {
                selectVehicle(v.id);
              }}
            />
          ))}
        </div>

        {/* Selected Vehicle Quick Actions */}
        <div className="mt-auto pt-4 flex flex-col gap-3">
          {selectedVehicle && selectedVehicle.status === 'online' ? (
            <button 
              onClick={handleCutEngine}
              className="w-full py-3 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold transition-colors flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Cortar Motor ({selectedVehicle.id})
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-[var(--color-border-glass)] bg-white/5 text-center">
              <p className="text-xs text-[var(--color-text-secondary)]">
                {selectedVehicle 
                  ? "Vehículo fuera de línea" 
                  : "Selecciona un vehículo para comandos"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cortar Motor */}
      <AnimatePresence>
        {cutEngineModal.open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-surface-glass)] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/10"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Confirmar Corte de Motor</h3>
              <p className="text-[var(--color-text-secondary)] text-center mb-6">
                Esta acción detendrá el motor del vehículo <span className="font-semibold text-white">{cutEngineModal.vehicleName}</span> (<span className="font-mono">{cutEngineModal.vehicleId}</span>) de forma remota. ¿Estás seguro?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCutEngineModal({ open: false, vehicleId: "", vehicleName: "" })}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border-glass)] hover:bg-white/5 text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmCutEngine}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl font-mono text-sm shadow-xl shadow-green-500/10 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ----- UI Components ----- //

function StatCard({ title, value, unit, icon }: { title: string, value: string, unit: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface-glass)]/50 border border-[var(--color-border-glass)] rounded-xl p-3 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-[var(--color-text-secondary)] font-medium">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1 mt-auto">
        <span className="text-2xl font-semibold leading-none">{value}</span>
        <span className="text-xs text-[var(--color-text-secondary)] font-mono">{unit}</span>
      </div>
    </div>
  );
}

function VehicleCard({ 
  vehicle, active, onClick 
}: { 
  vehicle: any, active: boolean, onClick: () => void 
}) {
  const isOnline = vehicle.status === "online";
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
        active 
          ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
          : "bg-[var(--color-surface-glass)]/30 border-[var(--color-border-glass)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-sm">{vehicle.name} <span className="text-[var(--color-text-secondary)] font-mono text-xs font-normal">({vehicle.id})</span></h3>
          <p className="text-xs text-[var(--color-text-secondary)]">{vehicle.plate}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-gray-500"} ${vehicle.hasAlert ? "animate-ping" : ""}`}></div>
      </div>
      
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
          <Navigation className={`w-3 h-3 ${isOnline && vehicle.speed > 0 ? "text-blue-400" : "text-gray-500"}`} />
          <span className="text-xs font-mono">{vehicle.speed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
          <Battery className={`w-3 h-3 ${vehicle.battery < 30 ? "text-red-400" : "text-green-400"}`} />
          <span className="text-xs font-mono">{vehicle.battery}%</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
           <Signal className={`w-3 h-3 ${isOnline ? "text-cyan-400" : "text-gray-500"}`} />
        </div>
      </div>
    </div>
  );
}
