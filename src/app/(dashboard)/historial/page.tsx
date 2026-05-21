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
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  History,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

const TODAY = toISO(new Date());
const YESTERDAY = daysAgo(1);
const TWO_DAYS_AGO = daysAgo(2);
const THREE_DAYS_AGO = daysAgo(3);
const FIVE_DAYS_AGO = daysAgo(5);
const EIGHT_DAYS_AGO = daysAgo(8);
const TEN_DAYS_AGO = daysAgo(10);
const FIFTEEN_DAYS_AGO = daysAgo(15);

// ── Types ─────────────────────────────────────────────────────────────────────
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

type PeriodFilter = "today" | "week" | "month" | "all";

// ── Mock data with dynamic dates ───────────────────────────────────────────────
const MOCK_TRIPS: Trip[] = [
  { id: "trip-1",  vehicleId: "T-01", date: TODAY,            startTime: "07:32", endTime: "08:15", startAddress: "Av. Winston Churchill #45, Ens. Piantini",    endAddress: "Zona Industrial Herrera, Sto. Dgo. Oeste", distanceKm: 18.4, durationMin: 43, maxSpeed: 95,  avgSpeed: 42, fuelUsed: 2.1 },
  { id: "trip-2",  vehicleId: "T-01", date: TODAY,            startTime: "12:10", endTime: "12:45", startAddress: "Zona Industrial Herrera",                       endAddress: "Blue Mall, Av. Churchill",                distanceKm: 15.2, durationMin: 35, maxSpeed: 78,  avgSpeed: 38, fuelUsed: 1.8 },
  { id: "trip-3",  vehicleId: "T-01", date: YESTERDAY,        startTime: "06:50", endTime: "07:40", startAddress: "Res. El Rosal, La Romana",                      endAddress: "Centro Comercial Las Américas",            distanceKm: 22.7, durationMin: 50, maxSpeed: 110, avgSpeed: 55, fuelUsed: 2.9 },
  { id: "trip-4",  vehicleId: "T-02", date: TODAY,            startTime: "08:00", endTime: "09:30", startAddress: "Calle El Conde #12, Zona Colonial",             endAddress: "Aeropuerto Las Américas",                 distanceKm: 28.3, durationMin: 90, maxSpeed: 105, avgSpeed: 48, fuelUsed: 3.5 },
  { id: "trip-5",  vehicleId: "T-02", date: TWO_DAYS_AGO,     startTime: "14:20", endTime: "15:00", startAddress: "Megacentro, Av. San Vicente de Paúl",           endAddress: "Hospital HOMS, Santiago",                 distanceKm: 12.1, durationMin: 40, maxSpeed: 65,  avgSpeed: 32, fuelUsed: 1.4 },
  { id: "trip-6",  vehicleId: "T-04", date: TODAY,            startTime: "09:15", endTime: "10:00", startAddress: "Av. Abraham Lincoln #950",                      endAddress: "UASD Sede Central",                       distanceKm: 8.5,  durationMin: 45, maxSpeed: 55,  avgSpeed: 28, fuelUsed: 1.0 },
  { id: "trip-7",  vehicleId: "T-04", date: THREE_DAYS_AGO,   startTime: "17:30", endTime: "18:20", startAddress: "Plaza Naco",                                    endAddress: "Res. Los Cacicazgos",                     distanceKm: 6.2,  durationMin: 50, maxSpeed: 42,  avgSpeed: 22, fuelUsed: 0.8 },
  { id: "trip-8",  vehicleId: "T-05", date: TODAY,            startTime: "05:45", endTime: "06:50", startAddress: "Gazcue, Sto. Dgo.",                             endAddress: "San Cristóbal Centro",                    distanceKm: 32.0, durationMin: 65, maxSpeed: 115, avgSpeed: 62, fuelUsed: 4.0 },
  { id: "trip-9",  vehicleId: "T-05", date: FIVE_DAYS_AGO,    startTime: "11:00", endTime: "11:35", startAddress: "San Cristóbal",                                 endAddress: "Baní, Peravia",                           distanceKm: 45.5, durationMin: 35, maxSpeed: 120, avgSpeed: 78, fuelUsed: 5.1 },
  { id: "trip-10", vehicleId: "T-03", date: THREE_DAYS_AGO,   startTime: "10:00", endTime: "11:30", startAddress: "Santiago de los Caballeros",                    endAddress: "La Vega Centro",                          distanceKm: 35.0, durationMin: 90, maxSpeed: 90,  avgSpeed: 45, fuelUsed: 3.8 },
  { id: "trip-11", vehicleId: "T-01", date: EIGHT_DAYS_AGO,   startTime: "08:30", endTime: "09:10", startAddress: "Av. Independencia, Sto. Dgo.",                 endAddress: "Plaza Duarte, San Pedro de Macorís",       distanceKm: 58.0, durationMin: 40, maxSpeed: 130, avgSpeed: 87, fuelUsed: 6.2 },
  { id: "trip-12", vehicleId: "T-02", date: TEN_DAYS_AGO,     startTime: "07:00", endTime: "08:20", startAddress: "Centro de los Héroes",                         endAddress: "Autopista Duarte Km 12",                  distanceKm: 12.5, durationMin: 80, maxSpeed: 72,  avgSpeed: 35, fuelUsed: 1.6 },
  { id: "trip-13", vehicleId: "T-03", date: FIFTEEN_DAYS_AGO, startTime: "13:00", endTime: "14:00", startAddress: "Puerto Plata Centro",                          endAddress: "Sosúa, Pto. Plata",                       distanceKm: 28.0, durationMin: 60, maxSpeed: 85,  avgSpeed: 46, fuelUsed: 3.1 },
];

// ── Weekly chart data helper ───────────────────────────────────────────────────
function buildWeeklyChart(trips: Trip[]): { day: string; km: number }[] {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toISO(d);
  });

  return days.map((dayName, index) => {
    const dateStr = weekDates[index];
    const km = trips
      .filter((t) => t.date === dateStr)
      .reduce((sum, t) => sum + t.distanceKm, 0);
    return { day: dayName, km: Number(km.toFixed(1)) };
  });
}

// ── Period filter config ───────────────────────────────────────────────────────
const PERIOD_OPTIONS: { key: PeriodFilter; label: string; icon: React.ElementType; description: string }[] = [
  { key: "today", label: "Hoy",          icon: CalendarCheck, description: "Solo el día de hoy" },
  { key: "week",  label: "Esta Semana",  icon: CalendarDays,  description: "Últimos 7 días"     },
  { key: "month", label: "Este Mes",     icon: CalendarRange, description: "Últimos 30 días"    },
  { key: "all",   label: "Todo",         icon: History,       description: "Sin filtro"         },
];

function getStartDate(period: PeriodFilter): string | null {
  switch (period) {
    case "today": return TODAY;
    case "week":  return daysAgo(6);
    case "month": return daysAgo(29);
    case "all":   return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HistorialPage() {
  const { fleet } = useFleet();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("T-01");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const selectedVehicle = fleet.vehicles.find((v) => v.id === selectedVehicleId);

  const vehicleTrips = useMemo(() => {
    const startDate = getStartDate(periodFilter);
    return MOCK_TRIPS.filter((t) => {
      if (t.vehicleId !== selectedVehicleId) return false;
      if (!startDate) return true;
      if (periodFilter === "today") return t.date === startDate;
      return t.date >= startDate;
    }).sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  }, [selectedVehicleId, periodFilter]);

  const tripDetail = selectedTrip ? MOCK_TRIPS.find((t) => t.id === selectedTrip) : null;
  void tripDetail;

  const totalKm    = useMemo(() => vehicleTrips.reduce((s, t) => s + t.distanceKm, 0), [vehicleTrips]);
  const totalFuel  = useMemo(() => vehicleTrips.reduce((s, t) => s + t.fuelUsed, 0), [vehicleTrips]);
  const topSpeed   = useMemo(() => vehicleTrips.length > 0 ? Math.max(...vehicleTrips.map((t) => t.maxSpeed)) : 0, [vehicleTrips]);
  const WEEKLY_DATA = useMemo(() => buildWeeklyChart(MOCK_TRIPS.filter(t => t.vehicleId === selectedVehicleId)), [selectedVehicleId]);
  const maxBarKm   = Math.max(...WEEKLY_DATA.map((d) => d.km), 1);

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

      {/* ── Period Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-border-glass)] w-fit">
        {PERIOD_OPTIONS.map(({ key, label, icon: Icon }) => {
          const active = periodFilter === key;
          return (
            <button
              key={key}
              onClick={() => { setPeriodFilter(key); setSelectedTrip(null); }}
              title={PERIOD_OPTIONS.find(o => o.key === key)?.description}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {key === "today" && vehicleTrips.length > 0 && periodFilter !== "today" && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          );
        })}
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
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            Viajes — {selectedVehicle?.name}
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border-glass)] text-[10px] font-mono">
              {vehicleTrips.length} resultado{vehicleTrips.length !== 1 ? "s" : ""}
            </span>
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {vehicleTrips.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border-glass)] rounded-xl">
                <Route className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Sin viajes en este período</p>
                <p className="text-xs mt-1 opacity-60">Prueba seleccionando "Todo" para ver el historial completo</p>
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
                      <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                        {trip.date === TODAY ? (
                          <span className="text-blue-400 font-semibold">Hoy</span>
                        ) : trip.date === YESTERDAY ? (
                          <span className="text-[var(--color-text-secondary)]">Ayer</span>
                        ) : (
                          trip.date
                        )}
                      </span>
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
              Resumen del Período
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Total km</span>
                <span className="text-xs font-mono font-bold">{totalKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Total viajes</span>
                <span className="text-xs font-mono font-bold">{vehicleTrips.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Combustible</span>
                <span className="text-xs font-mono font-bold">{totalFuel.toFixed(1)} L</span>
              </div>
              {vehicleTrips.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Promedio km</span>
                  <span className="text-xs font-mono font-bold">
                    {(totalKm / vehicleTrips.length).toFixed(1)} km/viaje
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Period indicator badge */}
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/15">
            {(() => {
              const opt = PERIOD_OPTIONS.find(o => o.key === periodFilter)!;
              const Icon = opt.icon;
              return (
                <>
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">{opt.description}</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
