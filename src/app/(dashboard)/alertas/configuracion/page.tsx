"use client";

import { useState, useMemo } from "react";
import { useAlertRules, AlertRule, AlertRuleType, AlertRuleConfig, IgnitionConfig, SpeedConfig, GeofenceConfig, MaintenanceConfig, DeviceDisconnectConfig } from "../../../hooks/useAlertRules";
import { useFleet } from "../../../hooks/useFleet";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Key,
  Zap,
  MapPin,
  Wrench,
  Radio,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
} from "lucide-react";

const TYPE_CONFIG: Record<AlertRuleType, { icon: React.ReactNode; label: string; color: string }> = {
  ignition: { icon: <Key className="w-5 h-5" />, label: 'Ignición', color: 'text-amber-400' },
  speed: { icon: <Zap className="w-5 h-5" />, label: 'Velocidad', color: 'text-red-400' },
  geofence: { icon: <MapPin className="w-5 h-5" />, label: 'Geocerca', color: 'text-blue-400' },
  maintenance: { icon: <Wrench className="w-5 h-5" />, label: 'Mantenimiento', color: 'text-green-400' },
  device_disconnect: { icon: <Radio className="w-5 h-5" />, label: 'Dispositivo', color: 'text-purple-400' },
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

// Weekly simulated stats
const WEEKLY_STATS: Record<AlertRuleType, number> = {
  ignition: 156,
  speed: 34,
  geofence: 12,
  maintenance: 5,
  device_disconnect: 18,
};

function getRuleSummary(rule: AlertRule): string {
  switch (rule.type) {
    case 'ignition': {
      const c = rule.config as IgnitionConfig;
      const parts = [];
      if (c.onStart) parts.push('Encendido');
      if (c.onStop) parts.push('Apagado');
      return parts.join(' | ') || 'Sin configurar';
    }
    case 'speed': {
      const c = rule.config as SpeedConfig;
      return `Límite: ${c.limitKmh} km/h | Tolerancia: ${c.gracePercent}%`;
    }
    case 'geofence': {
      const c = rule.config as GeofenceConfig;
      const actions = [];
      if (c.onEnter) actions.push('Entrada');
      if (c.onExit) actions.push('Salida');
      return `${c.zoneName} | ${actions.join(', ')} | Radio: ${c.radiusKm} km`;
    }
    case 'maintenance': {
      const c = rule.config as MaintenanceConfig;
      return `Cada ${c.afterKm.toLocaleString()} km o ${c.afterDays} días`;
    }
    case 'device_disconnect': {
      const c = rule.config as DeviceDisconnectConfig;
      const dev = c.device === 'gps' ? 'GPS' : c.device === 'obd' ? 'OBD' : 'Ambos';
      return `Dispositivo: ${dev} | Tolerancia: ${c.toleranceSeconds}s`;
    }
  }
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Nunca';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function AlertConfigPage() {
  const { rules, toggleRule, updateRule, addRule, deleteRule } = useAlertRules();
  const { fleet } = useFleet();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Modal state
  const [modalStep, setModalStep] = useState(1);
  const [newRuleType, setNewRuleType] = useState<AlertRuleType>('speed');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'critical' | 'warning' | 'info'>('warning');
  const [newRuleScope, setNewRuleScope] = useState<'all' | string[]>('all');
  const [newRuleConfig, setNewRuleConfig] = useState<AlertRuleConfig>({ limitKmh: 80, gracePercent: 10 });

  const openNewModal = () => {
    setEditingRule(null);
    setModalStep(1);
    setNewRuleType('speed');
    setNewRuleName('');
    setNewRuleSeverity('warning');
    setNewRuleScope('all');
    setNewRuleConfig({ limitKmh: 80, gracePercent: 10 });
    setModalOpen(true);
  };

  const openEditModal = (rule: AlertRule) => {
    setEditingRule(rule);
    setModalStep(2);
    setNewRuleType(rule.type);
    setNewRuleName(rule.name);
    setNewRuleSeverity(rule.severity);
    setNewRuleScope(rule.scope);
    setNewRuleConfig(rule.config);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingRule) {
      updateRule(editingRule.id, {
        name: newRuleName,
        severity: newRuleSeverity,
        scope: newRuleScope,
        config: newRuleConfig,
      });
    } else {
      addRule({
        name: newRuleName,
        type: newRuleType,
        enabled: true,
        severity: newRuleSeverity,
        scope: newRuleScope,
        config: newRuleConfig,
      });
    }
    setModalOpen(false);
  };

  const handleSelectType = (type: AlertRuleType) => {
    setNewRuleType(type);
    switch (type) {
      case 'ignition': setNewRuleConfig({ onStart: true, onStop: false }); break;
      case 'speed': setNewRuleConfig({ limitKmh: 80, gracePercent: 10 }); break;
      case 'geofence': setNewRuleConfig({ zoneName: '', onEnter: true, onExit: true, centerLat: 18.4861, centerLng: -69.9312, radiusKm: 2 }); break;
      case 'maintenance': setNewRuleConfig({ afterKm: 5000, afterDays: 90, lastServiceKm: 0 }); break;
      case 'device_disconnect': setNewRuleConfig({ device: 'gps', toleranceSeconds: 60 }); break;
    }
    setModalStep(2);
  };

  const handleDelete = (id: string) => {
    deleteRule(id);
    setDeleteConfirm(null);
  };

  const maxStat = Math.max(...Object.values(WEEKLY_STATS));

  return (
    <div className="page-container custom-scrollbar">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-[var(--color-accent-blue)]" />
            Configuración de Alertas
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Administra las reglas de alerta para la flota
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="glass-button px-4 py-2 gap-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 border-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Nueva Regla
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rules.map((rule, index) => {
          const typeConf = TYPE_CONFIG[rule.type];

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`stats-card transition-all duration-300 ${!rule.enabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${typeConf.color}`}>{typeConf.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">{rule.name}</h3>
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{typeConf.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${SEVERITY_BADGE[rule.severity]}`}>
                    {rule.severity === 'critical' ? 'Crítica' : rule.severity === 'warning' ? 'Advertencia' : 'Info'}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                      rule.enabled ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
                      animate={{ left: rule.enabled ? '22px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p className="text-[11px] text-[var(--color-text-secondary)] mb-2 font-mono">
                {getRuleSummary(rule)}
              </p>

              {/* Scope */}
              <div className="text-[10px] text-[var(--color-text-secondary)] mb-2">
                <span className="font-medium">Alcance:</span>{' '}
                {rule.scope === 'all' ? 'Toda la flota' : (rule.scope as string[]).map(id => {
                  const v = fleet.vehicles.find(v => v.id === id);
                  return v ? v.plate : id;
                }).join(', ')}
              </div>

              {/* Trigger info + actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-glass)]/50">
                <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)]">
                  <Clock className="w-3 h-3" />
                  <span>Disparada {rule.triggerCount} veces</span>
                  {rule.lastTriggered && (
                    <span className="font-mono">| {formatRelativeTime(rule.lastTriggered)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirm === rule.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(rule.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-[var(--color-text-secondary)] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Stats */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          Estadísticas de Alertas esta semana
        </h2>
        <div className="stats-card">
          <div className="flex flex-col gap-3">
            {(Object.entries(WEEKLY_STATS) as [AlertRuleType, number][]).map(([type, count]) => {
              const conf = TYPE_CONFIG[type];
              const pct = (count / maxStat) * 100;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className={`w-20 flex items-center gap-1.5 shrink-0 ${conf.color}`}>
                    {conf.icon}
                    <span className="text-[10px] font-medium">{conf.label}</span>
                  </div>
                  <div className="flex-1 h-5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: type === 'ignition' ? '#f59e0b' : type === 'speed' ? '#ef4444' : type === 'geofence' ? '#3b82f6' : type === 'maintenance' ? '#22c55e' : '#a855f7',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--color-text-primary)] w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">
                  {editingRule ? 'Editar Regla' : 'Nueva Regla'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${modalStep >= s ? 'bg-blue-500' : 'bg-[var(--color-surface-hover)]'}`} />
                ))}
              </div>

              {/* Step 1: Choose type */}
              {modalStep === 1 && (
                <div className="grid grid-cols-1 gap-3">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">Selecciona el tipo de alerta:</p>
                  {(Object.entries(TYPE_CONFIG) as [AlertRuleType, typeof TYPE_CONFIG[AlertRuleType]][]).map(([type, conf]) => (
                    <button
                      key={type}
                      onClick={() => handleSelectType(type)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)]/30 hover:bg-[var(--color-surface-hover)] transition-all text-left group"
                    >
                      <div className={`${conf.color} p-2 rounded-xl bg-[var(--color-surface-hover)]`}>{conf.icon}</div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{conf.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Configure */}
              {modalStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">Nombre de la regla</label>
                    <input
                      type="text"
                      value={newRuleName}
                      onChange={e => setNewRuleName(e.target.value)}
                      placeholder="Ej: Velocidad en zona escolar"
                      className="search-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">Severidad</label>
                    <div className="flex gap-2">
                      {(['critical', 'warning', 'info'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setNewRuleSeverity(s)}
                          className={`filter-pill ${newRuleSeverity === s ? `active active-${s}` : ''}`}
                        >
                          {s === 'critical' ? 'Crítica' : s === 'warning' ? 'Advertencia' : 'Info'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type-specific config */}
                  <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)]">
                    <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 font-medium">Parámetros</p>
                    {newRuleType === 'speed' && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Límite (km/h)</label>
                          <input type="number" value={(newRuleConfig as SpeedConfig).limitKmh} onChange={e => setNewRuleConfig({ ...newRuleConfig as SpeedConfig, limitKmh: Number(e.target.value) })} className="search-input w-full text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Tolerancia (%)</label>
                          <input type="number" value={(newRuleConfig as SpeedConfig).gracePercent} onChange={e => setNewRuleConfig({ ...newRuleConfig as SpeedConfig, gracePercent: Number(e.target.value) })} className="search-input w-full text-sm" />
                        </div>
                      </div>
                    )}
                    {newRuleType === 'ignition' && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs text-[var(--color-text-primary)]">
                          <input type="checkbox" checked={(newRuleConfig as IgnitionConfig).onStart} onChange={e => setNewRuleConfig({ ...newRuleConfig as IgnitionConfig, onStart: e.target.checked })} className="accent-blue-500" />
                          Encendido
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[var(--color-text-primary)]">
                          <input type="checkbox" checked={(newRuleConfig as IgnitionConfig).onStop} onChange={e => setNewRuleConfig({ ...newRuleConfig as IgnitionConfig, onStop: e.target.checked })} className="accent-blue-500" />
                          Apagado
                        </label>
                      </div>
                    )}
                    {newRuleType === 'geofence' && (
                      <div className="flex flex-col gap-2">
                        <input type="text" placeholder="Nombre de zona" value={(newRuleConfig as GeofenceConfig).zoneName} onChange={e => setNewRuleConfig({ ...newRuleConfig as GeofenceConfig, zoneName: e.target.value })} className="search-input w-full text-sm" />
                        <div className="flex gap-2">
                          <input type="number" placeholder="Radio (km)" value={(newRuleConfig as GeofenceConfig).radiusKm} onChange={e => setNewRuleConfig({ ...newRuleConfig as GeofenceConfig, radiusKm: Number(e.target.value) })} className="search-input w-full text-sm" />
                        </div>
                      </div>
                    )}
                    {newRuleType === 'maintenance' && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Cada (km)</label>
                          <input type="number" value={(newRuleConfig as MaintenanceConfig).afterKm} onChange={e => setNewRuleConfig({ ...newRuleConfig as MaintenanceConfig, afterKm: Number(e.target.value) })} className="search-input w-full text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Cada (días)</label>
                          <input type="number" value={(newRuleConfig as MaintenanceConfig).afterDays} onChange={e => setNewRuleConfig({ ...newRuleConfig as MaintenanceConfig, afterDays: Number(e.target.value) })} className="search-input w-full text-sm" />
                        </div>
                      </div>
                    )}
                    {newRuleType === 'device_disconnect' && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Dispositivo</label>
                          <select value={(newRuleConfig as DeviceDisconnectConfig).device} onChange={e => setNewRuleConfig({ ...newRuleConfig as DeviceDisconnectConfig, device: e.target.value as 'gps' | 'obd' | 'both' })} className="search-input w-full text-sm">
                            <option value="gps">GPS</option>
                            <option value="obd">OBD</option>
                            <option value="both">Ambos</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Tolerancia (seg)</label>
                          <input type="number" value={(newRuleConfig as DeviceDisconnectConfig).toleranceSeconds} onChange={e => setNewRuleConfig({ ...newRuleConfig as DeviceDisconnectConfig, toleranceSeconds: Number(e.target.value) })} className="search-input w-full text-sm" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    {!editingRule && (
                      <button onClick={() => setModalStep(1)} className="glass-button px-3 py-1.5 text-xs gap-1">
                        <ChevronLeft className="w-3 h-3" /> Atrás
                      </button>
                    )}
                    <button onClick={() => setModalStep(3)} className="glass-button px-3 py-1.5 text-xs gap-1 text-blue-400 ml-auto">
                      Siguiente <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Scope */}
              {modalStep === 3 && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[var(--color-text-secondary)]">Selecciona los vehículos afectados:</p>

                  <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRuleScope === 'all'}
                      onChange={e => setNewRuleScope(e.target.checked ? 'all' : [])}
                      className="accent-blue-500"
                    />
                    Toda la flota
                  </label>

                  {newRuleScope !== 'all' && (
                    <div className="flex flex-col gap-2 pl-4">
                      {fleet.vehicles.map(v => (
                        <label key={v.id} className="flex items-center gap-2 text-xs text-[var(--color-text-primary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Array.isArray(newRuleScope) && newRuleScope.includes(v.id)}
                            onChange={e => {
                              const current = Array.isArray(newRuleScope) ? newRuleScope : [];
                              setNewRuleScope(e.target.checked ? [...current, v.id] : current.filter(id => id !== v.id));
                            }}
                            className="accent-blue-500"
                          />
                          {v.name} <span className="font-mono text-[var(--color-text-secondary)]">({v.plate})</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between mt-4">
                    <button onClick={() => setModalStep(2)} className="glass-button px-3 py-1.5 text-xs gap-1">
                      <ChevronLeft className="w-3 h-3" /> Atrás
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!newRuleName.trim()}
                      className="glass-button px-4 py-1.5 text-xs gap-1 text-blue-400 hover:bg-blue-500/10 disabled:opacity-30"
                    >
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
