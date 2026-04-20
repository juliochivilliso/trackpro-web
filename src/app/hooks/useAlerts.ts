"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertCategory = 'obd' | 'geofence' | 'speed' | 'battery' | 'engine' | 'device';

export type Alert = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  timestamp: Date;
  severity: AlertSeverity;
  category: AlertCategory;
  code: string;
  title: string;
  description: string;
  acknowledged: boolean;
  location: { lat: number; lng: number };
};

// Realistic OBD & fleet alert templates
const ALERT_TEMPLATES: Omit<Alert, 'id' | 'timestamp' | 'vehicleId' | 'vehicleName' | 'acknowledged' | 'location'>[] = [
  { severity: 'critical', category: 'obd', code: 'P0301', title: 'Fallo cilindro 1', description: 'Se detectó fallo en el encendido del cilindro 1. Puede causar daño al catalizador si persiste.' },
  { severity: 'critical', category: 'engine', code: 'P0217', title: 'Sobrecalentamiento del motor', description: 'La temperatura del refrigerante excede el límite seguro (110°C). Apagar el motor inmediatamente.' },
  { severity: 'critical', category: 'obd', code: 'P0420', title: 'Catalizador deficiente', description: 'El catalizador del banco 1 está por debajo del umbral de eficiencia.' },
  { severity: 'warning', category: 'speed', code: 'SPD-001', title: 'Exceso de velocidad', description: 'El vehículo supera el límite de 80 km/h en zona urbana. Velocidad actual: 98 km/h.' },
  { severity: 'warning', category: 'battery', code: 'BAT-LOW', title: 'Batería baja', description: 'El nivel de batería del dispositivo GPS está por debajo del 20%. Riesgo de pérdida de señal.' },
  { severity: 'warning', category: 'obd', code: 'P0171', title: 'Mezcla pobre (Banco 1)', description: 'El sensor de oxígeno reporta mezcla aire-combustible pobre. Revisar inyectores y filtro de aire.' },
  { severity: 'warning', category: 'geofence', code: 'GEO-EXIT', title: 'Salida de geocerca', description: 'El vehículo abandonó la zona autorizada "Santo Domingo Centro".' },
  { severity: 'info', category: 'engine', code: 'ENG-START', title: 'Motor encendido', description: 'El motor ha sido encendido. Inicio de viaje registrado.' },
  { severity: 'info', category: 'engine', code: 'ENG-STOP', title: 'Motor apagado', description: 'El motor ha sido apagado. Fin de viaje registrado.' },
  { severity: 'info', category: 'geofence', code: 'GEO-ENTER', title: 'Entrada a geocerca', description: 'El vehículo ingresó a la zona "Condominio El Rosal".' },
  { severity: 'warning', category: 'obd', code: 'P0455', title: 'Fuga sistema EVAP (grande)', description: 'Se detectó una fuga grande en el sistema de emisiones evaporativas. Revisar tapa de combustible.' },
  { severity: 'critical', category: 'obd', code: 'P0128', title: 'Termostato defectuoso', description: 'La temperatura del refrigerante no alcanza el nivel operativo en tiempo esperado.' },
  { severity: 'warning', category: 'speed', code: 'SPD-BRAKE', title: 'Frenado brusco detectado', description: 'Se registró una desaceleración abrupta de 85 km/h a 12 km/h en 2.3 segundos.' },
  { severity: 'info', category: 'obd', code: 'P0000', title: 'Diagnóstico limpio', description: 'Todos los sistemas del vehículo reportan operación normal. Sin códigos activos.' },
  { severity: 'critical', category: 'battery', code: 'BAT-DISC', title: 'GPS desconectado', description: 'El dispositivo GPS perdió energía. Posible desconexión intencional o fallo eléctrico.' },
];

const VEHICLE_REFS = [
  { id: 'T-01', name: 'Honda Civic 2021', lat: 18.4861, lng: -69.9312 },
  { id: 'T-02', name: 'Toyota Hilux', lat: 18.4890, lng: -69.9250 },
  { id: 'T-03', name: 'Nissan Frontier', lat: 18.4820, lng: -69.9400 },
  { id: 'T-04', name: 'Hyundai Sonata', lat: 18.4780, lng: -69.9320 },
  { id: 'T-05', name: 'Suzuki Grand Vitara', lat: 18.4910, lng: -69.9420 },
];

let alertIdCounter = 0;
function generateAlertId() {
  return `ALT-${String(++alertIdCounter).padStart(4, '0')}`;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createRandomAlert(minutesAgo: number = 0): Alert {
  const template = randomPick(ALERT_TEMPLATES);
  const vehicle = randomPick(VEHICLE_REFS);
  const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
  return {
    ...template,
    id: generateAlertId(),
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    timestamp,
    acknowledged: false,
    location: {
      lat: vehicle.lat + (Math.random() - 0.5) * 0.005,
      lng: vehicle.lng + (Math.random() - 0.5) * 0.005,
    },
  };
}

// Pre-seed historical alerts
function createInitialAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const minutesBackSchedule = [120, 85, 62, 37, 18, 8, 3, 1];
  for (const min of minutesBackSchedule) {
    const alert = createRandomAlert(min);
    // Older alerts are more likely to be acknowledged
    alert.acknowledged = min > 30 ? Math.random() > 0.3 : false;
    alerts.push(alert);
  }
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => createInitialAlerts());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate new alerts every 8-15 seconds
  useEffect(() => {
    function scheduleNext() {
      const delay = 8000 + Math.random() * 7000; // 8-15s
      intervalRef.current = setTimeout(() => {
        const newAlert = createRandomAlert(0);
        setAlerts(prev => [newAlert, ...prev]);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const clearAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAlertsByVehicle = useCallback(
    (vehicleId: string) => alerts.filter(a => a.vehicleId === vehicleId),
    [alerts]
  );

  const addCrossDeviceAlert = useCallback((vehicleId: string, vehicleName: string, device: 'gps' | 'obd') => {
    const newAlert: Alert = {
      id: generateAlertId(),
      vehicleId,
      vehicleName,
      timestamp: new Date(),
      severity: device === 'gps' ? 'critical' : 'warning',
      category: 'device',
      code: device === 'gps' ? 'DEV-GPS-OFF' : 'DEV-OBD-OFF',
      title: device === 'gps'
        ? 'GPS Sinotrap desconectado'
        : 'Scanner OBD desconectado',
      description: device === 'gps'
        ? `El dispositivo GPS Sinotrap ST-910 de ${vehicleName} perdió conexión. El Scanner OBD reporta el vehículo en operación. Posible sabotaje o falla eléctrica.`
        : `El Scanner OBD Pro de ${vehicleName} se desconectó. GPS Sinotrap confirma que el vehículo sigue en movimiento. Revisar conexión OBD-II.`,
      acknowledged: false,
      location: {
        lat: 18.486 + (Math.random() - 0.5) * 0.01,
        lng: -69.931 + (Math.random() - 0.5) * 0.01,
      },
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  // Derived stats
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
  const infoCount = alerts.filter(a => a.severity === 'info' && !a.acknowledged).length;
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return {
    alerts,
    acknowledgeAlert,
    clearAlert,
    getAlertsByVehicle,
    addCrossDeviceAlert,
    criticalCount,
    warningCount,
    infoCount,
    unacknowledgedCount,
    totalCount: alerts.length,
  };
}
