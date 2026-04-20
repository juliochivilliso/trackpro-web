"use client";

import { useFleet, Vehicle } from "../../hooks/useFleet";
import { useDrivers } from "../../hooks/useDrivers";
import { useState, useMemo } from "react";
import {
  Search,
  Signal,
  Battery,
  Navigation,
  Gauge,
  Thermometer,
  Fuel,
  Filter,
  ArrowUpDown,
  Wifi,
  WifiOff,
  Radio,
  Cpu,
  UserCircle,
} from "lucide-react";
import Link from "next/link";

type SortKey = "name" | "speed" | "battery" | "status";
type StatusFilter = "all" | "online" | "offline";

export default function FlotaPage() {
  const { fleet } = useFleet();
  const { getDriverByVehicle } = useDrivers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const vehicles = fleet.vehicles;

  const onlineCount = useMemo(() => vehicles.filter((v) => v.status === "online").length, [vehicles]);
  const offlineCount = useMemo(() => vehicles.filter((v) => v.status === "offline").length, [vehicles]);
  const avgSpeed = useMemo(() => {
    const online = vehicles.filter((v) => v.status === "online");
    return online.length > 0 ? Math.round(online.reduce((s, v) => s + v.speed, 0) / online.length) : 0;
  }, [vehicles]);

  const filtered = useMemo(() => {
    let result = vehicles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.plate.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((v) => v.status === statusFilter);
    }
    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "speed": cmp = a.speed - b.speed; break;
        case "battery": cmp = a.battery - b.battery; break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [vehicles, search, statusFilter, sortBy, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="page-container custom-scrollbar">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Flota de Vehículos</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gestión y monitoreo de todos los vehículos registrados
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stats-card">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">Total Vehículos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{vehicles.length}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">unidades</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="text-xs text-green-400 font-medium flex items-center gap-1.5">
            <Wifi className="w-3 h-3" /> En Línea
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{onlineCount}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">activos</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
            <Gauge className="w-3 h-3" /> Velocidad Promedio
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{avgSpeed}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">km/h</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="text-xs text-red-400 font-medium flex items-center gap-1.5">
            <WifiOff className="w-3 h-3" /> Fuera de Línea
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">{offlineCount}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">inactivos</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, placa o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input w-full pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
          {(["all", "online", "offline"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`filter-pill ${statusFilter === f ? `active active-${f === "all" ? "all" : f === "online" ? "info" : "critical"}` : ""}`}
            >
              {f === "all" ? "Todos" : f === "online" ? "En Línea" : "Fuera de Línea"}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
          {(["name", "speed", "battery", "status"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`filter-pill ${sortBy === key ? "active active-all" : ""}`}
            >
              {key === "name" ? "Nombre" : key === "speed" ? "Velocidad" : key === "battery" ? "Batería" : "Estado"}
              {sortBy === key && (sortAsc ? " ↑" : " ↓")}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        {filtered.map((v) => (
          <FleetVehicleCard key={v.id} vehicle={v} driver={getDriverByVehicle(v.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--color-text-secondary)]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No se encontraron vehículos con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceStatusDot({ status }: { status: 'connected' | 'disconnected' | 'warning' }) {
  const color = status === 'connected' ? 'bg-green-400' : status === 'warning' ? 'bg-yellow-400' : 'bg-red-400';
  return <div className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

function FleetVehicleCard({ vehicle, driver }: { vehicle: Vehicle; driver: ReturnType<typeof import('../../hooks/useDrivers').useDrivers>['getDriverByVehicle'] extends (id: string) => infer R ? R : never }) {
  const isOnline = vehicle.status === "online";

  return (
    <Link href={`/?vehicle=${vehicle.id}`} className="no-underline">
      <div
        className={`stats-card hover:border-blue-500/30 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isOnline ? "" : "opacity-60"
        }`}
      >
        {/* Header row */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
              {vehicle.name}{" "}
              <span className="text-[var(--color-text-secondary)] font-mono text-xs font-normal">
                ({vehicle.id})
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">{vehicle.plate}</p>
          </div>
          <div className="flex items-center gap-2">
            {vehicle.hasAlert && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-green-500 shadow-[0_0_6px_#22c55e]" : "bg-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Live stats row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Navigation className={`w-3 h-3 ${isOnline && vehicle.speed > 0 ? "text-blue-400" : "text-gray-500"}`} />
            <span className="text-xs font-mono">{vehicle.speed} km/h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className={`w-3 h-3 ${vehicle.battery < 30 ? "text-red-400" : "text-green-400"}`} />
            <span className="text-xs font-mono">{vehicle.battery}%</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Signal className={`w-3 h-3 ${isOnline ? "text-cyan-400" : "text-gray-500"}`} />
          </div>
        </div>

        {/* Devices section */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-glass)] to-transparent mb-3" />
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)]">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{vehicle.devices.gps.model}</span>
            <DeviceStatusDot status={vehicle.devices.gps.status} />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)]">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{vehicle.devices.obd.model}</span>
            <DeviceStatusDot status={vehicle.devices.obd.status} />
          </div>
        </div>

        {/* Driver section */}
        {driver && (
          <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
              {driver.avatar}
            </div>
            <span className="text-[11px] text-[var(--color-text-primary)] font-medium">{driver.name}</span>
            <span className="text-[9px] text-blue-400 font-medium ml-auto px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">Conductor activo</span>
          </div>
        )}

        {/* OBD summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
              {vehicle.obd.rpm} RPM
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
              {vehicle.obd.engineTemp}°C
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
              {Math.round(vehicle.obd.fuelLevel)}%
            </span>
          </div>
        </div>

        {/* DTC codes */}
        {vehicle.obd.dtcCodes.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {vehicle.obd.dtcCodes.map((code) => (
              <span
                key={code}
                className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded"
              >
                {code}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

