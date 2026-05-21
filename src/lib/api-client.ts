// ─── TrackPro API Client ────────────────────────────────────────────────────
// Intentará conectarse a la trackpro-api. Si falla, devuelve datos locales.
// Ninguna página depende de que el backend esté activo.
// ────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: AbortSignal.timeout(3000), // 3 s timeout
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null; // API caída → devuelve null, la capa de datos usa el mock
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type ApiVehicle = {
  id: number;
  plate: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  isActive: boolean;
  assignments: { id: number; equipment: { code: string; name: string } | null }[];
};

export type ApiDriver = {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiration: string | null;
  isActive: boolean;
};

export type ApiEquipment = {
  id: number;
  code: string;
  name: string;
  imei: string | null;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE';
};

export type ApiAssignment = { id: number; vehicleId: number; equipmentId: number };

// ─── Mock Data (Fallback) ────────────────────────────────────────────────────

const today = new Date();
const addDays = (d: number) =>
  new Date(today.getTime() + d * 86_400_000).toISOString().slice(0, 10);

export const MOCK_VEHICLES: ApiVehicle[] = [
  { id: 1, plate: 'A123456', make: 'Honda', model: 'Civic', year: 2021, vin: '1HGBH41JXMN109186', isActive: true, assignments: [{ id: 1, equipment: { code: 'GPS-001', name: 'Sinotrap ST-910' } }] },
  { id: 2, plate: 'L987654', make: 'Toyota', model: 'Hilux', year: 2020, vin: 'MR0FR22G200470478', isActive: true, assignments: [] },
  { id: 3, plate: 'L112233', make: 'Nissan', model: 'Frontier', year: 2019, vin: '3N6PD23Y9ZK000471', isActive: false, assignments: [{ id: 2, equipment: { code: 'GPS-003', name: 'Coban TK103' } }] },
  { id: 4, plate: 'A445566', make: 'Hyundai', model: 'Sonata', year: 2022, vin: '5NPE24AF8FH105887', isActive: true, assignments: [{ id: 3, equipment: { code: 'GPS-004', name: 'Queclink GV300' } }] },
  { id: 5, plate: 'G778899', make: 'Suzuki', model: 'Grand Vitara', year: 2021, vin: 'JS3TD941614100253', isActive: true, assignments: [] },
];

export const MOCK_DRIVERS: ApiDriver[] = [
  { id: 1, firstName: 'Juan', lastName: 'Pérez', licenseNumber: 'DL-12345', licenseExpiration: addDays(120), isActive: true },
  { id: 2, firstName: 'María', lastName: 'Rodríguez', licenseNumber: 'DL-67890', licenseExpiration: addDays(15), isActive: true },
  { id: 3, firstName: 'Carlos', lastName: 'Gómez', licenseNumber: 'DL-11223', licenseExpiration: addDays(-5), isActive: true },
  { id: 4, firstName: 'Laura', lastName: 'Martínez', licenseNumber: 'DL-44556', licenseExpiration: addDays(250), isActive: false },
  { id: 5, firstName: 'Roberto', lastName: 'Díaz', licenseNumber: 'DL-77889', licenseExpiration: addDays(8), isActive: true },
];

export const MOCK_EQUIPMENT: ApiEquipment[] = [
  { id: 1, code: 'GPS-001', name: 'Sinotrap ST-910', imei: '123456789012345', status: 'ASSIGNED' },
  { id: 2, code: 'GPS-002', name: 'Queclink GV300', imei: '987654321098765', status: 'AVAILABLE' },
  { id: 3, code: 'GPS-003', name: 'Coban TK103', imei: '111222333444555', status: 'ASSIGNED' },
  { id: 4, code: 'GPS-004', name: 'Queclink GL300', imei: '222333444555666', status: 'ASSIGNED' },
  { id: 5, code: 'GPS-005', name: 'Teltonika FMB920', imei: '333444555666777', status: 'AVAILABLE' },
  { id: 6, code: 'GPS-006', name: 'Teltonika FMB003', imei: '444555666777888', status: 'MAINTENANCE' },
];

// ─── API Functions with Fallback ─────────────────────────────────────────────

export async function getVehicles(): Promise<ApiVehicle[]> {
  const data = await apiFetch<ApiVehicle[]>('/vehicles');
  return data ?? MOCK_VEHICLES;
}

export async function getDrivers(): Promise<ApiDriver[]> {
  const data = await apiFetch<ApiDriver[]>('/drivers');
  return data ?? MOCK_DRIVERS;
}

export async function getEquipment(): Promise<ApiEquipment[]> {
  const data = await apiFetch<ApiEquipment[]>('/equipment');
  return data ?? MOCK_EQUIPMENT;
}

export async function getAssignments(): Promise<ApiAssignment[]> {
  const data = await apiFetch<ApiAssignment[]>('/assignments');
  return data ?? [];
}
