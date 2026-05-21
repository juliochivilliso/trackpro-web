'use client';

import { useState, useEffect, useMemo } from 'react';
import { MOCK_DRIVERS } from '../../../../lib/api-client';

interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiration?: string | null;
  isActive: boolean;
}
import { Users, Search, Edit2, Power, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function LicenseStatus({ expiration }: { expiration?: string | null }) {
  const days = daysUntil(expiration);
  if (days === null) return <span className="text-gray-500 text-xs">Sin registro</span>;
  if (days < 0) return (
    <div className="flex items-center gap-1.5 text-red-400">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span className="text-xs font-bold">Vencida</span>
    </div>
  );
  if (days <= 30) return (
    <div className="flex items-center gap-1.5 text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span className="text-xs font-bold">Vence en {days}d</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 text-emerald-400">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span className="text-xs font-mono">{expiration?.slice(0, 10)}</span>
    </div>
  );
}

export default function ConductoresPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLive, setApiLive] = useState(false);
  const [search, setSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState<'all' | 'warning' | 'expired'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', licenseNumber: '', licenseExpiration: '' });
  const [saving, setSaving] = useState(false);

  const loadDrivers = async () => {
    try {
      const res = await fetch('http://localhost:4000/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
        setApiLive(true);
      } else throw new Error();
    } catch {
      setDrivers(MOCK_DRIVERS as unknown as Driver[]);
      setApiLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingDriver
        ? `http://localhost:4000/drivers/${editingDriver.id}`
        : 'http://localhost:4000/drivers';
      const method = editingDriver ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          licenseNumber: formData.licenseNumber,
          licenseExpiration: formData.licenseExpiration || undefined,
        }),
      });
      if (res.ok) {
        await loadDrivers();
        setModalOpen(false);
        setEditingDriver(null);
      } else {
        alert('Error al guardar conductor');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (driver: Driver) => {
    if (!confirm(`¿Desactivar al conductor ${driver.firstName} ${driver.lastName}?`)) return;
    const res = await fetch(`http://localhost:4000/drivers/${driver.id}`, { method: 'DELETE' });
    if (res.ok) await loadDrivers();
  };

  const expiredCount = drivers.filter(d => { const days = daysUntil(d.licenseExpiration); return days !== null && days < 0; }).length;
  const warnCount = drivers.filter(d => { const days = daysUntil(d.licenseExpiration); return days !== null && days >= 0 && days <= 30; }).length;

  const filtered = useMemo(() => drivers.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.firstName.toLowerCase().includes(q) || d.lastName.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q);
    const days = daysUntil(d.licenseExpiration);
    const matchAlert =
      alertFilter === 'all' ? true :
      alertFilter === 'expired' ? (days !== null && days < 0) :
      alertFilter === 'warning' ? (days !== null && days >= 0 && days <= 30) : true;
    return matchSearch && matchAlert;
  }), [drivers, search, alertFilter]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Gestión de Conductores
          </h1>
          <p className="text-gray-400 text-sm">Expedientes, licencias y control de vencimientos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingDriver(null);
            setFormData({ firstName: '', lastName: '', licenseNumber: '', licenseExpiration: '' });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
          + Nuevo Conductor
        </button>
      </div>

      {/* Alert Badges */}
      {(expiredCount > 0 || warnCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <button
              onClick={() => setAlertFilter(alertFilter === 'expired' ? 'all' : 'expired')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                alertFilter === 'expired' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {expiredCount} licencia{expiredCount > 1 ? 's' : ''} vencida{expiredCount > 1 ? 's' : ''}
            </button>
          )}
          {warnCount > 0 && (
            <button
              onClick={() => setAlertFilter(alertFilter === 'warning' ? 'all' : 'warning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                alertFilter === 'warning' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {warnCount} por vencer (≤30 días)
            </button>
          )}
          {alertFilter !== 'all' && (
            <button onClick={() => setAlertFilter('all')} className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-bold text-gray-400 hover:text-white transition-colors">
              Ver todos
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o licencia..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border-glass)] rounded-xl text-sm text-white placeholder-gray-500 focus:border-blue-500/50 outline-none transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-glass)]">
                {['Conductor', 'N° Licencia', 'Vencimiento', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]/50">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">
                        {d.firstName[0]}{d.lastName[0]}
                      </div>
                      <span className="font-semibold text-white">{d.firstName} {d.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-400">{d.licenseNumber}</td>
                  <td className="px-6 py-4"><LicenseStatus expiration={d.licenseExpiration} /></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      d.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {d.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingDriver(d);
                          setFormData({
                            firstName: d.firstName,
                            lastName: d.lastName,
                            licenseNumber: d.licenseNumber,
                            licenseExpiration: d.licenseExpiration
                              ? new Date(d.licenseExpiration).toISOString().split('T')[0]
                              : '',
                          });
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDeactivate(d)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"><Power className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-[var(--color-border-glass)]/50 text-[10px] font-mono text-gray-600">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
              {editingDriver ? 'Editar Conductor' : 'Nuevo Conductor'}
            </h2>
            <div className="space-y-3">
              <input className="search-input w-full" placeholder="Nombre *"
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input className="search-input w-full" placeholder="Apellido *"
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              <input className="search-input w-full" placeholder="Número de licencia *"
                value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] block mb-1">
                  Vencimiento de licencia
                </label>
                <input type="date" className="search-input w-full"
                  value={formData.licenseExpiration} onChange={e => setFormData({...formData, licenseExpiration: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !formData.firstName || !formData.lastName || !formData.licenseNumber}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editingDriver ? 'Guardar cambios' : 'Crear conductor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
