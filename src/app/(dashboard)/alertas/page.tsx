"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAlerts, Alert, AlertSeverity } from "../../hooks/useAlerts";
import { useFleet } from "../../hooks/useFleet";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Search,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Bell,
  X,
  Activity,
  Car,
} from "lucide-react";

// DTC code descriptions for tooltip
const DTC_DESCRIPTIONS: Record<string, string> = {
  "P0171": "Mezcla aire-combustible demasiado pobre (Banco 1)",
  "P0301": "Fallo de encendido detectado — Cilindro 1",
  "P0420": "Eficiencia del catalizador por debajo del umbral (Banco 1)",
  "P0455": "Fuga grande en el sistema de emisiones evaporativas (EVAP)",
  "P0128": "Termostato del refrigerante — temp. por debajo del umbral",
  "P0217": "Temperatura del motor — condición de sobrecalentamiento",
  "P0300": "Fallos de encendido aleatorios detectados",
  "P0442": "Fuga pequeña en el sistema EVAP",
  "P0500": "Sensor de velocidad del vehículo — mal funcionamiento",
  "P0700": "Sistema de control de transmisión — mal funcionamiento",
};

type SeverityFilter = "all" | AlertSeverity;

function getSeverityIcon(severity: AlertSeverity) {
  switch (severity) {
    case "critical": return <AlertTriangle className="w-4 h-4" />;
    case "warning": return <AlertCircle className="w-4 h-4" />;
    case "info": return <Info className="w-4 h-4" />;
  }
}

function getSeverityColor(severity: AlertSeverity) {
  switch (severity) {
    case "critical": return "text-red-400";
    case "warning": return "text-amber-400";
    case "info": return "text-blue-400";
  }
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function AlertasPage() {
  const {
    alerts,
    acknowledgeAlert,
    clearAlert,
    criticalCount,
    warningCount,
    infoCount,
    unacknowledgedCount,
    totalCount,
    addCrossDeviceAlert,
  } = useAlerts();

  const { fleet, setCrossDeviceAlertCallback } = useFleet();

  // Wire cross-device disconnect simulation → alert system
  useEffect(() => {
    setCrossDeviceAlertCallback(addCrossDeviceAlert);
    return () => setCrossDeviceAlertCallback(null);
  }, [setCrossDeviceAlertCallback, addCrossDeviceAlert]);

  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [searchCode, setSearchCode] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevCountRef = useRef(totalCount);

  // Track when new alerts arrive (for potential future sound)
  useEffect(() => {
    if (totalCount > prevCountRef.current && soundEnabled) {
      // Sound would play here if implemented
    }
    prevCountRef.current = totalCount;
  }, [totalCount, soundEnabled]);

  const filteredAlerts = useMemo(() => {
    let result = alerts;
    if (filter !== "all") {
      result = result.filter((a) => a.severity === filter);
    }
    if (searchCode) {
      const q = searchCode.toLowerCase();
      result = result.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.vehicleName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [alerts, filter, searchCode]);

  // Group DTC codes by vehicle
  const dtcByVehicle = useMemo(() => {
    const map = new Map<string, { name: string; codes: string[] }>();
    for (const v of fleet.vehicles) {
      if (v.obd.dtcCodes.length > 0) {
        map.set(v.id, { name: v.name, codes: v.obd.dtcCodes });
      }
    }
    return map;
  }, [fleet.vehicles]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ─── Left: Alert Feed ─── */}
      <div className="flex-1 flex flex-col min-h-0 p-6 pr-3">
        {/* Feed Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="page-title">Centro de Alertas</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">en vivo</span>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="glass-button px-3 py-1.5 gap-1.5"
            title={soundEnabled ? "Silenciar alertas" : "Activar sonido"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />}
            <span className="text-[10px]">{soundEnabled ? "Sonido On" : "Silenciado"}</span>
          </button>
        </div>

        {/* Filter Pills + Search */}
        <div className="flex items-center gap-2 mb-4 shrink-0 flex-wrap">
          {(["all", "critical", "warning", "info"] as SeverityFilter[]).map((f) => {
            const counts = { all: totalCount, critical: criticalCount, warning: warningCount, info: infoCount };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-pill ${filter === f ? `active active-${f}` : ""}`}
              >
                {f === "all" ? "Todas" : f === "critical" ? "🔴 Críticas" : f === "warning" ? "🟡 Advertencias" : "🔵 Info"}{" "}
                ({counts[f]})
              </button>
            );
          })}
          <div className="relative ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar código o título..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="search-input pl-9 py-1.5 text-xs w-60"
            />
          </div>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-3">
          <AnimatePresence initial={false}>
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
                onClear={clearAlert}
              />
            ))}
          </AnimatePresence>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-16 text-[var(--color-text-secondary)]">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay alertas con este filtro.</p>
              <p className="text-xs mt-1 opacity-60">El sistema está monitoreando activamente.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right Column ─── */}
      <div className="w-[340px] flex flex-col p-6 pl-3 gap-4 shrink-0">
        {/* Stats Panel */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <StatBox
            label="Total Alertas"
            value={totalCount}
            icon={<Bell className="w-4 h-4" />}
            color="text-[var(--color-text-primary)]"
          />
          <StatBox
            label="Sin Revisar"
            value={unacknowledgedCount}
            icon={<Activity className="w-4 h-4" />}
            color="text-amber-400"
            pulse={unacknowledgedCount > 0}
          />
          <StatBox
            label="Críticas"
            value={criticalCount}
            icon={<AlertTriangle className="w-4 h-4" />}
            color="text-red-400"
            pulse={criticalCount > 0}
          />
          <StatBox
            label="Advertencias"
            value={warningCount}
            icon={<AlertCircle className="w-4 h-4" />}
            color="text-amber-400"
          />
        </div>

        {/* Active DTC Codes Panel */}
        <div className="stats-card flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Códigos DTC Activos
            </h3>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
              {Array.from(dtcByVehicle.values()).reduce((s, v) => s + v.codes.length, 0)} códigos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
            {dtcByVehicle.size === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400 opacity-50" />
                <p className="text-xs">Todos los vehículos sin códigos de falla.</p>
              </div>
            ) : (
              Array.from(dtcByVehicle.entries()).map(([vehicleId, data]) => (
                <div key={vehicleId}>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-3 h-3 text-[var(--color-text-secondary)]" />
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">{data.name}</span>
                    <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">({vehicleId})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-5">
                    {data.codes.map((code) => (
                      <DtcChip key={code} code={code} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="stats-card shrink-0">
          <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            Leyenda de Severidad
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                <strong className="text-red-400">Crítica</strong> — Requiere acción inmediata
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                <strong className="text-amber-400">Advertencia</strong> — Revisar pronto
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                <strong className="text-blue-400">Informativa</strong> — Solo notificación
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─── //

function AlertCard({
  alert,
  onAcknowledge,
  onClear,
}: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onClear: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`alert-card alert-card-${alert.severity} ${alert.acknowledged ? "acknowledged" : ""}`}
    >
      <div className="flex justify-between items-start gap-3">
        {/* Left: Severity Icon + Content */}
        <div className="flex gap-3 flex-1 min-w-0">
          <div className={`shrink-0 mt-0.5 ${getSeverityColor(alert.severity)}`}>
            {getSeverityIcon(alert.severity)}
          </div>
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                {alert.severity === "critical" ? "CRÍTICA" : alert.severity === "warning" ? "ADVERTENCIA" : "INFO"}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)]">
                {alert.code}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)] ml-auto whitespace-nowrap">
                {getRelativeTime(alert.timestamp)}
              </span>
            </div>
            {/* Title */}
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              {alert.title}
            </h4>
            {/* Vehicle */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <Car className="w-3 h-3 text-[var(--color-text-secondary)]" />
              <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                {alert.vehicleName} ({alert.vehicleId})
              </span>
            </div>
            {/* Description */}
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {alert.description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {!alert.acknowledged && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="glass-button px-2 py-1 text-[10px] gap-1"
              title="Marcar como revisada"
            >
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              Revisar
            </button>
          )}
          <button
            onClick={() => onClear(alert.id)}
            className="glass-button px-2 py-1 text-[10px] gap-1 opacity-60 hover:opacity-100"
            title="Eliminar alerta"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
  pulse = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="stats-card">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className={`${color} ${pulse ? "animate-pulse" : ""}`}>{icon}</div>
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

function DtcChip({ code }: { code: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const desc = DTC_DESCRIPTIONS[code] || "Código de diagnóstico sin descripción registrada.";

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md cursor-help hover:bg-red-500/20 transition-colors"
      >
        {code}
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[200px] max-w-[280px]">
          <div className="glass-panel p-2.5 text-[10px] text-[var(--color-text-primary)] leading-relaxed shadow-lg">
            <div className="font-bold text-red-400 mb-1">{code}</div>
            {desc}
          </div>
          <div className="w-2 h-2 bg-[var(--color-surface-glass)] border-b border-r border-[var(--color-border-glass)] rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
}

