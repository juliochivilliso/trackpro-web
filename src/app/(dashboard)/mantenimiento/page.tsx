'use client';

import { useState, useEffect } from 'react';
import { getVehicles, getDrivers, getEquipment, MOCK_VEHICLES, MOCK_DRIVERS, MOCK_EQUIPMENT } from '../../../lib/api-client';
import type { ApiVehicle, ApiDriver, ApiEquipment } from '../../../lib/api-client';
import {
  Car, Users, Cpu, AlertCircle, CheckCircle2, Package, ArrowRight, Wrench,
} from 'lucide-react';
import Link from 'next/link';

export default function MantenimientoPage() {
  const [vehicles, setVehicles] = useState<ApiVehicle[]>(MOCK_VEHICLES);
  const [drivers, setDrivers] = useState<ApiDriver[]>(MOCK_DRIVERS);
  const [equipment, setEquipment] = useState<ApiEquipment[]>(MOCK_EQUIPMENT);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    Promise.all([getVehicles(), getDrivers(), getEquipment()]).then(
      ([v, d, e]) => {
        setVehicles(v);
        setDrivers(d);
        setEquipment(e);
        // Si los datos difieren del mock, la API está activa
        setIsLive(v !== MOCK_VEHICLES);
      }
    );
  }, []);

  const today = Date.now();
  const daysUntil = (d?: string | null) => d ? Math.ceil((new Date(d).getTime() - today) / 86_400_000) : null;

  const activeVehicles = vehicles.filter(v => v.isActive).length;
  const orphanVehicles = vehicles.filter(v => v.isActive && !v.assignments.length).length;
  const expiredLicenses = drivers.filter(d => { const days = daysUntil(d.licenseExpiration); return days !== null && days < 0; }).length;
  const expiringLicenses = drivers.filter(d => { const days = daysUntil(d.licenseExpiration); return days !== null && days >= 0 && days <= 30; }).length;
  const availableEquipment = equipment.filter(e => e.status === 'AVAILABLE').length;

  const SUBMODULES = [
    {
      href: '/mantenimiento/vehiculos',
      icon: Car,
      title: 'Vehículos',
      description: 'Alta, edición y baja de unidades. Vinculación con dispositivos GPS.',
      badge: orphanVehicles > 0 ? `${orphanVehicles} sin GPS` : null,
      accent: 'border-blue-500/20 hover:border-blue-500/40 from-blue-500/10 to-blue-600/5',
      iconBg: 'bg-blue-500/10 text-blue-400',
    },
    {
      href: '/mantenimiento/conductores',
      icon: Users,
      title: 'Conductores',
      description: 'Expedientes de conductores, licencias y fechas de vencimiento.',
      badge: (expiredLicenses + expiringLicenses) > 0 ? `${expiredLicenses + expiringLicenses} alerta(s)` : null,
      accent: 'border-purple-500/20 hover:border-purple-500/40 from-purple-500/10 to-purple-600/5',
      iconBg: 'bg-purple-500/10 text-purple-400',
    },
    {
      href: '/mantenimiento/equipos',
      icon: Cpu,
      title: 'Equipos GPS',
      description: 'Inventario de dispositivos de rastreo, SIM cards e IMEI.',
      badge: null,
      accent: 'border-cyan-500/20 hover:border-cyan-500/40 from-cyan-500/10 to-cyan-600/5',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
    },
  ];

  const HEALTH = [
    { label: 'Vehículos activos', value: activeVehicles, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Sin GPS asignado', value: orphanVehicles, icon: AlertCircle, color: orphanVehicles > 0 ? 'text-amber-400' : 'text-emerald-400' },
    { label: 'Licencias por vencer', value: expiredLicenses + expiringLicenses, icon: AlertCircle, color: (expiredLicenses + expiringLicenses) > 0 ? 'text-red-400' : 'text-emerald-400' },
    { label: 'Equipos disponibles', value: availableEquipment, icon: Package, color: 'text-cyan-400' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Centro de Mantenimiento</h1>
          </div>
          <p className="text-sm text-gray-400 pl-9">
            Gestión centralizada de vehículos, conductores y equipos GPS.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border ${
          isLive
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {isLive ? 'API Conectada' : 'Modo Local'}
        </div>
      </div>

      {/* Health KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {HEALTH.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {item.label}
                </span>
              </div>
              <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
            </div>
          );
        })}
      </div>

      {/* Sub-modules */}
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Submódulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SUBMODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`group relative glass-panel rounded-2xl p-7 border bg-gradient-to-br backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${mod.accent}`}
              >
                {mod.badge && (
                  <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest">
                    {mod.badge}
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${mod.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight mb-2">{mod.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{mod.description}</p>
                <div className="flex items-center gap-2 mt-5 text-gray-500 group-hover:text-blue-400 transition-colors">
                  <span className="text-[11px] font-black uppercase tracking-widest">Abrir módulo</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
