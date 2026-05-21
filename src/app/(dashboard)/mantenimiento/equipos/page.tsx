'use client';

import { useState, useEffect, useMemo } from 'react';
import { MOCK_EQUIPMENT } from '../../../../lib/api-client';

interface Equipment {
  id: number;
  code: string;
  name: string;
  imei?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE';
}
import { Cpu, Search, Edit2, Link2, Link2Off, Trash2 } from 'lucide-react';

const STATUS_LABELS: Record<Equipment['status'], string> = {
  AVAILABLE: 'Disponible',
  ASSIGNED: 'Instalado',
  MAINTENANCE: 'Mantenimiento',
};

const STATUS_STYLES: Record<Equipment['status'], string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
  ASSIGNED: 'bg-blue-500/10 text-blue-400',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400',
};

export default function EquiposPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Equipment['status'] | 'all'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', imei: '', status: 'AVAILABLE' });
  const [saving, setSaving] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningEquipment, setAssigningEquipment] = useState<Equipment | null>(null);
  const [activeVehicles, setActiveVehicles] = useState<{ id: number; plate: string; assignments: any[] }[]>([]);

  const loadEquipment = async () => {
    try {
      const res = await fetch('http://localhost:4000/equipment');
      if (res.ok) setEquipment(await res.json());
      else throw new Error();
    } catch {
      setEquipment(MOCK_EQUIPMENT as unknown as Equipment[]);
    } finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch('http://localhost:4000/vehicles');
      let vehs = [];
      if (res.ok) vehs = await res.json();
      else throw new Error();
      setActiveVehicles(vehs.filter((v: any) => v.isActive));
    } catch {
      const { MOCK_VEHICLES } = await import('../../../../lib/api-client');
      setActiveVehicles(MOCK_VEHICLES.filter((v: any) => v.isActive));
    }
  };

  useEffect(() => { loadEquipment(); loadVehicles(); }, []);

  const handleAssign = async (equipment: Equipment, vehicleId: number) => {
    try {
      const res = await fetch('http://localhost:4000/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, equipmentId: equipment.id })
      });
      if (res.ok) {
        await loadEquipment();
        await loadVehicles();
        setAssignModalOpen(false);
        setAssigningEquipment(null);
      } else alert('Error al asignar equipo');
    } catch {
      alert('Error al asignar equipo');
    }
  };

  const handleUnassign = async (equipment: Equipment) => {
    if (!confirm(`¿Desasignar el equipo ${equipment.code}?`)) return;
    try {
      const resAssignments = await fetch('http://localhost:4000/assignments');
      let assignments = [];
      if (resAssignments.ok) assignments = await resAssignments.json();
      else {
        const { getAssignments } = await import('../../../../lib/api-client');
        assignments = await getAssignments();
      }
      const assignment = assignments.find((a: any) => a.equipmentId === equipment.id);
      if (assignment) {
        const resDel = await fetch(`http://localhost:4000/assignments/${assignment.id}`, { method: 'DELETE' });
        if (resDel.ok) { await loadEquipment(); await loadVehicles(); }
        else alert('Error al desasignar equipo');
      } else {
        alert('No se encontró la asignación');
      }
    } catch {
      alert('Error al desasignar equipo');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingEquipment ? `http://localhost:4000/equipment/${editingEquipment.id}` : 'http://localhost:4000/equipment';
      const res = await fetch(url, {
        method: editingEquipment ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.code, name: formData.name, imei: formData.imei || undefined, status: formData.status }),
      });
      if (res.ok) { await loadEquipment(); setModalOpen(false); setEditingEquipment(null); }
      else alert('Error al guardar equipo');
    } finally { setSaving(false); }
  };

  const handleDelete = async (eq: Equipment) => {
    if (!confirm(`¿Eliminar el equipo ${eq.code}?`)) return;
    const res = await fetch(`http://localhost:4000/equipment/${eq.id}`, { method: 'DELETE' });
    if (res.ok) await loadEquipment();
  };

  const counts = useMemo(() => ({
    total: equipment.length,
    available: equipment.filter(e => e.status === 'AVAILABLE').length,
    assigned: equipment.filter(e => e.status === 'ASSIGNED').length,
    maintenance: equipment.filter(e => e.status === 'MAINTENANCE').length,
  }), [equipment]);

  const filtered = useMemo(() => equipment.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.code.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || (e.imei ?? '').includes(q);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  }), [equipment, search, statusFilter]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Inventario de Equipos GPS
          </h1>
          <p className="text-gray-400 text-sm">Control de dispositivos de rastreo, IMEIs y asignaciones.</p>
        </div>
        <button onClick={() => { setEditingEquipment(null); setFormData({ code: '', name: '', imei: '', status: 'AVAILABLE' }); setModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
          + Registrar Equipo
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-white' },
          { label: 'Disponibles', value: counts.available, color: 'text-emerald-400' },
          { label: 'Instalados', value: counts.assigned, color: 'text-blue-400' },
          { label: 'Mantenimiento', value: counts.maintenance, color: 'text-amber-400' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-panel rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar código, nombre, IMEI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border-glass)] rounded-xl text-sm text-white placeholder-gray-500 focus:border-blue-500/50 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 glass-panel rounded-xl">
          {(['all', 'AVAILABLE', 'ASSIGNED', 'MAINTENANCE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Todos' : STATUS_LABELS[f as Equipment['status']]}
            </button>
          ))}
        </div>
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
                {['Código', 'Dispositivo', 'IMEI', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]/50">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-sm">{e.code}</td>
                  <td className="px-6 py-4 font-semibold text-white">{e.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{e.imei ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[e.status]}`}>
                      {STATUS_LABELS[e.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingEquipment(e); setFormData({ code: e.code, name: e.name, imei: e.imei||'', status: e.status }); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      {e.status === 'ASSIGNED' ? (
                        <button onClick={() => handleUnassign(e)} className="p-2 rounded-lg hover:bg-amber-500/10 text-gray-500 hover:text-amber-400 transition-colors" title="Desasignar"><Link2Off className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={() => { setAssigningEquipment(e); setAssignModalOpen(true); }} className="p-2 rounded-lg hover:bg-cyan-500/10 text-gray-500 hover:text-cyan-400 transition-colors" title="Asignar"><Link2 className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleDelete(e)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
              {editingEquipment ? 'Editar Equipo' : 'Registrar Equipo GPS'}
            </h2>
            <div className="space-y-3">
              <input className="search-input w-full" placeholder="Código *" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              <input className="search-input w-full" placeholder="Nombre del dispositivo *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="search-input w-full" placeholder="IMEI" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} />
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] block mb-1">Estado</label>
                <select className="search-input w-full" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="AVAILABLE">Disponible</option>
                  <option value="ASSIGNED">Asignado</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !formData.code || !formData.name}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editingEquipment ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {assignModalOpen && assigningEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
              Asignar Equipo {assigningEquipment.code}
            </h2>
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {activeVehicles.filter(v => !v.assignments || v.assignments.length === 0).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hay vehículos disponibles.</p>
              ) : (
                activeVehicles.filter(v => !v.assignments || v.assignments.length === 0).map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleAssign(assigningEquipment, v.id)}
                    className="w-full text-left p-3 rounded-xl border border-[var(--color-border-glass)] hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors group"
                  >
                    <p className="text-sm font-semibold text-white group-hover:text-blue-400">{v.plate}</p>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => { setAssignModalOpen(false); setAssigningEquipment(null); }} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
