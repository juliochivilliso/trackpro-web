'use client';

import { useState, useEffect, useMemo } from 'react';
import { MOCK_VEHICLES } from '../../../../lib/api-client';
import { Car, Search, Edit2, Power, Cpu, AlertCircle, Link2, Link2Off, ChevronUp, ChevronDown } from 'lucide-react';

interface Vehicle {
  id: number;
  plate: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  isActive: boolean;
  assignments?: { id: number; equipment?: { name: string; code: string } | null }[];
}

type SortField = 'plate' | 'make' | 'year';

export default function VehiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLive, setApiLive] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('plate');
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({ plate: '', make: '', model: '', year: '', color: '', vin: '' });
  const [saving, setSaving] = useState(false);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingVehicle, setLinkingVehicle] = useState<Vehicle | null>(null);
  const [availableEquipment, setAvailableEquipment] = useState<{ id: number; name: string; code: string }[]>([]);

  const loadVehicles = async () => {
    try {
      const res = await fetch('http://localhost:4000/vehicles');
      if (res.ok) { setVehicles(await res.json()); setApiLive(true); }
      else throw new Error();
    } catch {
      setVehicles(MOCK_VEHICLES as unknown as Vehicle[]);
      setApiLive(false);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadVehicles(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingVehicle ? `http://localhost:4000/vehicles/${editingVehicle.id}` : 'http://localhost:4000/vehicles';
      const res = await fetch(url, {
        method: editingVehicle ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate: formData.plate,
          make: formData.make || undefined,
          model: formData.model || undefined,
          year: formData.year ? parseInt(formData.year) : undefined,
          color: formData.color || undefined,
          vin: formData.vin || undefined,
        }),
      });
      if (res.ok) { await loadVehicles(); setModalOpen(false); setEditingVehicle(null); }
      else alert('Error al guardar vehículo');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (v: Vehicle) => {
    if (!confirm(`¿Desactivar el vehículo ${v.plate}?`)) return;
    const res = await fetch(`http://localhost:4000/vehicles/${v.id}`, { method: 'DELETE' });
    if (res.ok) await loadVehicles();
  };

  const openLinkModal = async (vehicle: Vehicle) => {
    try {
      const res = await fetch('http://localhost:4000/equipment');
      let equip = [];
      if (res.ok) {
        equip = await res.json();
      } else throw new Error();
      setAvailableEquipment(equip.filter((e: any) => e.status === 'AVAILABLE'));
    } catch {
      const { MOCK_EQUIPMENT } = await import('../../../../lib/api-client');
      setAvailableEquipment(MOCK_EQUIPMENT.filter((e: any) => e.status === 'AVAILABLE'));
    }
    setLinkingVehicle(vehicle);
    setLinkModalOpen(true);
  };

  const handleLink = async (vehicleId: number, equipmentId: number) => {
    try {
      const res = await fetch('http://localhost:4000/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, equipmentId })
      });
      if (res.ok) {
        await loadVehicles();
        setLinkModalOpen(false);
        setLinkingVehicle(null);
      } else alert('Error al vincular. Verifica que la API esté activa.');
    } catch {
      alert('Error al vincular. Verifica que la API esté activa.');
    }
  };

  const handleUnlink = async (assignmentId: number) => {
    if (!confirm('¿Desvincular equipo?')) return;
    try {
      const res = await fetch(`http://localhost:4000/assignments/${assignmentId}`, { method: 'DELETE' });
      if (res.ok) await loadVehicles();
      else alert('Error al desvincular. Verifica que la API esté activa.');
    } catch {
      alert('Error al desvincular. Verifica que la API esté activa.');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = useMemo(() => {
    return vehicles
      .filter(v => {
        const q = search.toLowerCase();
        const matchSearch = !q || v.plate.toLowerCase().includes(q) || (v.make ?? '').toLowerCase().includes(q) || (v.model ?? '').toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? v.isActive : !v.isActive);
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'plate') diff = a.plate.localeCompare(b.plate);
        else if (sortField === 'make') diff = (a.make ?? '').localeCompare(b.make ?? '');
        else if (sortField === 'year') diff = (a.year ?? 0) - (b.year ?? 0);
        return sortAsc ? diff : -diff;
      });
  }, [vehicles, search, statusFilter, sortField, sortAsc]);

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col -space-y-1 ml-1">
      <ChevronUp className={`w-2 h-2 ${sortField === field && sortAsc ? 'text-blue-400' : 'text-gray-600'}`} />
      <ChevronDown className={`w-2 h-2 ${sortField === field && !sortAsc ? 'text-blue-400' : 'text-gray-600'}`} />
    </span>
  );

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-400" />
            Gestión de Vehículos
          </h1>
          <p className="text-gray-400 text-sm">Alta, edición y control de unidades de la flota.</p>
        </div>
        <button onClick={() => { setEditingVehicle(null); setFormData({ plate:'', make:'', model:'', year:'', color:'', vin:'' }); setModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
          + Registrar Vehículo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar placa, marca, modelo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border-glass)] rounded-xl text-sm text-white placeholder-gray-500 focus:border-blue-500/50 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 glass-panel rounded-xl">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
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
                {[
                  { field: 'plate' as SortField, label: 'Placa' },
                  { field: 'make' as SortField, label: 'Marca / Modelo' },
                  { field: 'year' as SortField, label: 'Año' },
                ].map(({ field, label }) => (
                  <th key={field} className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort(field)}
                      className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      {label}<SortIcon field={field} />
                    </button>
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Equipo GPS</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Estado</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]/50">
              {filtered.map(v => {
                const assignment = v.assignments?.[0];
                const gps = assignment?.equipment ?? null;
                return (
                  <tr key={v.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white text-sm">{v.plate}</span>
                      {v.vin && <p className="text-[10px] text-gray-500 font-mono mt-0.5">{v.vin}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{v.make} {v.model}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-400">{v.year ?? '—'}</td>
                    <td className="px-6 py-4">
                      {gps ? (
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{gps.name}</p>
                            <p className="text-[10px] font-mono text-gray-500">{gps.code}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">Sin equipo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        v.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {v.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingVehicle(v); setFormData({ plate: v.plate, make: v.make||'', model: v.model||'', year: v.year?.toString()||'', color: v.color||'', vin: v.vin||'' }); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {assignment ? (
                          <button onClick={() => handleUnlink(assignment.id)} className="p-2 rounded-lg hover:bg-amber-500/10 text-gray-500 hover:text-amber-400 transition-colors" title="Desvincular equipo">
                            <Link2Off className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => openLinkModal(v)} className="p-2 rounded-lg hover:bg-cyan-500/10 text-gray-500 hover:text-cyan-400 transition-colors" title="Vincular equipo">
                            <Link2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDeactivate(v)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors" title="Dar de baja">
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
              {editingVehicle ? 'Editar Vehículo' : 'Registrar Vehículo'}
            </h2>
            <div className="space-y-3">
              <input className="search-input w-full" placeholder="Placa *" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input className="search-input w-full" placeholder="Marca" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                <input className="search-input w-full" placeholder="Modelo" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                <input className="search-input w-full" placeholder="Año" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                <input className="search-input w-full" placeholder="Color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              </div>
              <input className="search-input w-full" placeholder="VIN / Chasis" value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !formData.plate}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editingVehicle ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {linkModalOpen && linkingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
              Vincular Equipo a {linkingVehicle.plate}
            </h2>
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {availableEquipment.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hay equipos disponibles.</p>
              ) : (
                availableEquipment.map(eq => (
                  <button
                    key={eq.id}
                    onClick={() => handleLink(linkingVehicle.id, eq.id)}
                    className="w-full text-left p-3 rounded-xl border border-[var(--color-border-glass)] hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors group"
                  >
                    <p className="text-sm font-semibold text-white group-hover:text-blue-400">{eq.name}</p>
                    <p className="text-[10px] font-mono text-gray-400">{eq.code}</p>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => { setLinkModalOpen(false); setLinkingVehicle(null); }} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
