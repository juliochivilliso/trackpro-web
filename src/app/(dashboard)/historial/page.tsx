"use client";

import { useState, useMemo } from "react";
import { useFleet } from "../../hooks/useFleet";
import {
  MapPin,
  Clock,
  Fuel,
  Gauge,
  Calendar,
  ChevronRight,
  Route,
  Timer,
  TrendingUp,
  Car,
} from "lucide-react";

// Mock trip data
type Trip = {
  id: string;
  vehicleId: string;
  date: string;
  startTime: string;
  endTime: string;
  startAddress: string;
  endAddress: string;
  distanceKm: number;
  durationMin: number;
  maxSpeed: number;
  avgSpeed: number;
  fuelUsed: number;
};

const MOCK_TRIPS: Trip[] = [
  { id: "trip-1", vehicleId: "T-01", date: "2026-04-15", startTime: "07:32", endTime: "08:15", startAddress: "Av. Winston Churchill #45, Ens. Piantini", endAddress: "Zona Industrial Herrera, Sto. Dgo. Oeste", distanceKm: 18.4, durationMin: 43, maxSpeed: 95, avgSpeed: 42, fuelUsed: 2.1 },
  { id: "trip-2", vehicleId: "T-01", date: "2026-04-15", startTime: "12:10", endTime: "12:45", startAddress: "Zona Industrial Herrera", endAddress: "Blue Mall, Av. Churchill", distanceKm: 15.2, durationMin: 35, maxSpeed: 78, avgSpeed: 38, fuelUsed: 1.8 },
  { id: "trip-3", vehicleId: "T-01", date: "2026-04-14", startTime: "06:50", endTime: "07:40", startAddress: "Res. El Rosal, La Romana", endAddress: "Centro Comercial Las Américas", distanceKm: 22.7, durationMin: 50, maxSpeed: 110, avgSpeed: 55, fuelUsed: 2.9 },
  { id: "trip-4", vehicleId: "T-02", date: "2026-04-15", startTime: "08:00", endTime: "09:30", startAddress: "Calle El Conde #12, Zona Colonial", endAddress: "Aeropuerto Las Américas", distanceKm: 28.3, durationMin: 90, maxSpeed: 105, avgSpeed: 48, fuelUsed: 3.5 },
  { id: "trip-5", vehicleId: "T-02", date: "2026-04-14", startTime: "14:20", endTime: "15:00", startAddress: "Megacentro, Av. San Vicente de Paúl", endAddress: "Hospital HOMS, Santiago", distanceKm: 12.1, durationMin: 40, maxSpeed: 65, avgSpeed: 32, fuelUsed: 1.4 },
  { id: "trip-6", vehicleId: "T-04", date: "2026-04-15", startTime: "09:15", endTime: "10:00", startAddress: "Av. Abraham Lincoln #950", endAddress: "UASD Sede Central", distanceKm: 8.5, durationMin: 45, maxSpeed: 55, avgSpeed: 28, fuelUsed: 1.0 },
  { id: "trip-7", vehicleId: "T-04", date: "2026-04-14", startTime: "17:30", endTime: "18:20", startAddress: "Plaza Naco", endAddress: "Res. Los Cacicazgos", distanceKm: 6.2, durationMin: 50, maxSpeed: 42, avgSpeed: 22, fuelUsed: 0.8 },
  { id: "trip-8", vehicleId: "T-05", date: "2026-04-15", startTime: "05:45", endTime: "06:50", startAddress: "Gazcue, Sto. Dgo.", endAddress: "San Cristóbal Centro", distanceKm: 32.0, durationMin: 65, maxSpeed: 115, avgSpeed: 62, fuelUsed: 4.0 },
  { id: "trip-9", vehicleId: "T-05", date: "2026-04-14", startTime: "11:00", endTime: "11:35", startAddress: "San Cristóbal", endAddress: "Baní, Peravia", distanceKm: 45.5, durationMin: 35, maxSpeed: 120, avgSpeed: 78, fuelUsed: 5.1 },
  { id: "trip-10", vehicleId: "T-03", date: "2026-04-13", startTime: "10:00", endTime: "11:30", startAddress: "Santiago de los Caballeros", endAddress: "La Vega Centro", distanceKm: 35.0, durationMin: 90, maxSpeed: 90, avgSpeed: 45, fuelUsed: 3.8 },
];

// Weekly km data for chart
const WEEKLY_DATA = [
  { day: "Lun", km: 85 },
  { day: "Mar", km: 120 },
  { day: "Mié", km: 45 },
  { day: "Jue", km: 95 },
  { day: "Vie", km: 150 },
  { day: "Sáb", km: 60 },
  { day: "Dom", km: 20 },
];

export default function HistorialPage() {
  const { fleet } = useFleet();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("T-01");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const selectedVehicle = fleet.vehicles.find((v) => v.id === selectedVehicleId);

  const vehicleTrips = useMemo(
    () => MOCK_TRIPS.filter((t) => t.vehicleId === selectedVehicleId),
    [selectedVehicleId]
  );

  const tripDetail = selectedTrip ? MOCK_TRIPS.find((t) => t.id === selectedTrip) : null;

  const totalKm = useMemo(() => vehicleTrips.reduce((s, t) => s + t.distanceKm, 0), [vehicleTrips]);
  const totalFuel = useMemo(() => vehicleTrips.reduce((s, t) => s + t.fuelUsed, 0), [vehicleTrips]);
  const topSpeed = useMemo(() => Math.max(...vehicleTrips.map((t) => t.maxSpeed), 0), [vehicleTrips]);
  const maxBarKm = Math.max(...WEEKLY_DATA.map((d) => d.km));

  return (
    <div className="page-container custom-scrollbar">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Viajes</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Registro de recorridos y estadísticas de uso
          </p>
        </div>
        {/* Vehicle selector */}
        <div className="flex items-center gap-3">
          <Car className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <select
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value);
              setSelectedTrip(null);
            }}
            className="search-input cursor-pointer pr-8"
          >
            {fleet.vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stats-card">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
            <Route className="w-3 h-3" /> Distancia Total
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalKm.toFixed(1)}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">km</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Total Viajes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{vehicleTrips.length}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">registros</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
            <Fuel className="w-3 h-3 text-emerald-400" /> Combustible
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalFuel.toFixed(1)}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">litros</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-red-400" /> Vel. Máxima
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{topSpeed}</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">km/h</span>
          </div>
        </div>
      </div>

      {/* Main content: Trip list + Detail/Chart */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Trip Timeline */}
        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Viajes Recientes — {selectedVehicle?.name}
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {vehicleTrips.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-secondary)]">
                <Route className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No hay viajes registrados para este vehículo.</p>
              </div>
            ) : (
              vehicleTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
                  className={`alert-card alert-card-info text-left w-full transition-all ${
                    selectedTrip === trip.id ? "border-blue-500/40 shadow-lg" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-mono text-[var(--color-text-secondary)]">{trip.date}</span>
                      <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                        {trip.startTime} → {trip.endTime}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${
                        selectedTrip === trip.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex flex-col items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="w-px h-6 bg-[var(--color-border-glass)]" />
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <span className="text-xs text-[var(--color-text-primary)] truncate">{trip.startAddress}</span>
                      <span className="text-xs text-[var(--color-text-primary)] truncate">{trip.endAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1">
                      <Route className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{trip.distanceKm} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{trip.durationMin} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      <span className="text-[10px] font-mono">máx {trip.maxSpeed} km/h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{trip.fuelUsed}L</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedTrip === trip.id && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-border-glass)] grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Velocidad Promedio</p>
                        <p className="text-sm font-mono font-bold text-blue-400">{trip.avgSpeed} km/h</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Consumo</p>
                        <p className="text-sm font-mono font-bold text-emerald-400">
                          {(trip.fuelUsed / trip.distanceKm * 100).toFixed(1)} L/100km
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Duración</p>
                        <p className="text-sm font-mono font-bold">
                          {Math.floor(trip.durationMin / 60)}h {trip.durationMin % 60}min
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Vel. Máxima</p>
                        <p className={`text-sm font-mono font-bold ${trip.maxSpeed > 100 ? "text-red-400" : "text-[var(--color-text-primary)]"}`}>
                          {trip.maxSpeed} km/h
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Weekly Chart */}
        <div className="w-80 flex flex-col gap-4">
          <div className="stats-card flex-1">
            <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
              Kilómetros / Día (Semana Actual)
            </h3>
            <div className="flex items-end gap-3 h-40 px-2">
              {WEEKLY_DATA.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{d.km}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500 min-h-[4px]"
                    style={{
                      height: `${(d.km / maxBarKm) * 100}%`,
                      background: `linear-gradient(to top, var(--color-accent-blue), rgba(59, 130, 246, 0.4))`,
                    }}
                  />
                  <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-card">
            <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              Resumen Semanal
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Total km</span>
                <span className="text-xs font-mono font-bold">{WEEKLY_DATA.reduce((s, d) => s + d.km, 0)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Promedio diario</span>
                <span className="text-xs font-mono font-bold">
                  {Math.round(WEEKLY_DATA.reduce((s, d) => s + d.km, 0) / 7)} km
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Día más activo</span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {WEEKLY_DATA.reduce((max, d) => (d.km > max.km ? d : max), WEEKLY_DATA[0]).day} ({Math.max(...WEEKLY_DATA.map(d => d.km))} km)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

