"use client";

import { useState, useCallback } from 'react';

export type Driver = {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  licenseType: 'A' | 'B' | 'C';
  licenseExpiration: string;
  status: 'available' | 'assigned' | 'off-duty';
  assignedVehicleId: string | null;
  totalTrips: number;
  score: number;
  joinDate: string;
  avatar: string;
};

export type AssignmentRecord = {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleName: string;
  startTime: Date;
  endTime: Date | null;
  status: 'active' | 'completed';
};

const INITIAL_DRIVERS: Driver[] = [
  { id: 'D-01', name: 'Carlos Méndez', cedula: '001-1234567-8', phone: '+1 (809) 555-0101', licenseType: 'B', licenseExpiration: '2026-12-15', status: 'assigned', assignedVehicleId: 'T-01', totalTrips: 342, score: 91, joinDate: '2021-06-10', avatar: 'CM' },
  { id: 'D-02', name: 'María Santos', cedula: '001-9876543-2', phone: '+1 (829) 555-0202', licenseType: 'B', licenseExpiration: '2026-05-20', status: 'assigned', assignedVehicleId: 'T-02', totalTrips: 218, score: 87, joinDate: '2022-01-15', avatar: 'MS' },
  { id: 'D-03', name: 'José Rodríguez', cedula: '001-5555555-5', phone: '+1 (849) 555-0303', licenseType: 'C', licenseExpiration: '2025-11-30', status: 'off-duty', assignedVehicleId: null, totalTrips: 520, score: 79, joinDate: '2020-03-22', avatar: 'JR' },
  { id: 'D-04', name: 'Ana Guzmán', cedula: '001-7777777-7', phone: '+1 (809) 555-0404', licenseType: 'B', licenseExpiration: '2027-08-10', status: 'assigned', assignedVehicleId: 'T-04', totalTrips: 156, score: 95, joinDate: '2023-02-08', avatar: 'AG' },
  { id: 'D-05', name: 'Pedro Fernández', cedula: '001-3333333-3', phone: '+1 (829) 555-0505', licenseType: 'B', licenseExpiration: '2026-04-01', status: 'available', assignedVehicleId: null, totalTrips: 89, score: 82, joinDate: '2023-09-01', avatar: 'PF' },
  { id: 'D-06', name: 'Luisa Pérez', cedula: '001-4444444-4', phone: '+1 (849) 555-0606', licenseType: 'A', licenseExpiration: '2028-01-20', status: 'available', assignedVehicleId: null, totalTrips: 45, score: 88, joinDate: '2024-01-20', avatar: 'LP' },
];

const INITIAL_HISTORY: AssignmentRecord[] = [
  { id: 'AR-001', driverId: 'D-01', driverName: 'Carlos Méndez', vehicleId: 'T-01', vehicleName: 'Honda Civic 2021', startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), endTime: null, status: 'active' },
  { id: 'AR-002', driverId: 'D-02', driverName: 'María Santos', vehicleId: 'T-02', vehicleName: 'Toyota Hilux', startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), endTime: null, status: 'active' },
  { id: 'AR-003', driverId: 'D-04', driverName: 'Ana Guzmán', vehicleId: 'T-04', vehicleName: 'Hyundai Sonata', startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), endTime: null, status: 'active' },
  { id: 'AR-004', driverId: 'D-03', driverName: 'José Rodríguez', vehicleId: 'T-03', vehicleName: 'Nissan Frontier', startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), endTime: new Date(Date.now() - 16 * 60 * 60 * 1000), status: 'completed' },
  { id: 'AR-005', driverId: 'D-05', driverName: 'Pedro Fernández', vehicleId: 'T-05', vehicleName: 'Suzuki Grand Vitara', startTime: new Date(Date.now() - 48 * 60 * 60 * 1000), endTime: new Date(Date.now() - 40 * 60 * 60 * 1000), status: 'completed' },
  { id: 'AR-006', driverId: 'D-01', driverName: 'Carlos Méndez', vehicleId: 'T-02', vehicleName: 'Toyota Hilux', startTime: new Date(Date.now() - 72 * 60 * 60 * 1000), endTime: new Date(Date.now() - 64 * 60 * 60 * 1000), status: 'completed' },
  { id: 'AR-007', driverId: 'D-06', driverName: 'Luisa Pérez', vehicleId: 'T-01', vehicleName: 'Honda Civic 2021', startTime: new Date(Date.now() - 96 * 60 * 60 * 1000), endTime: new Date(Date.now() - 88 * 60 * 60 * 1000), status: 'completed' },
  { id: 'AR-008', driverId: 'D-02', driverName: 'María Santos', vehicleId: 'T-04', vehicleName: 'Hyundai Sonata', startTime: new Date(Date.now() - 120 * 60 * 60 * 1000), endTime: new Date(Date.now() - 112 * 60 * 60 * 1000), status: 'completed' },
];

let recordCounter = 9;

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentRecord[]>(INITIAL_HISTORY);

  const assignDriver = useCallback((driverId: string, vehicleId: string, vehicleName: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        return { ...d, status: 'assigned' as const, assignedVehicleId: vehicleId };
      }
      // If another driver was assigned to this vehicle, unassign them
      if (d.assignedVehicleId === vehicleId && d.id !== driverId) {
        return { ...d, status: 'available' as const, assignedVehicleId: null };
      }
      return d;
    }));

    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      const newRecord: AssignmentRecord = {
        id: `AR-${String(recordCounter++).padStart(3, '0')}`,
        driverId,
        driverName: driver.name,
        vehicleId,
        vehicleName,
        startTime: new Date(),
        endTime: null,
        status: 'active',
      };
      setAssignmentHistory(prev => [newRecord, ...prev]);
    }
  }, [drivers]);

  const unassignDriver = useCallback((driverId: string) => {
    setDrivers(prev => prev.map(d =>
      d.id === driverId ? { ...d, status: 'available' as const, assignedVehicleId: null } : d
    ));

    // Close the active assignment record
    setAssignmentHistory(prev => prev.map(r =>
      r.driverId === driverId && r.status === 'active'
        ? { ...r, endTime: new Date(), status: 'completed' as const }
        : r
    ));
  }, []);

  const getDriverByVehicle = useCallback((vehicleId: string): Driver | null => {
    return drivers.find(d => d.assignedVehicleId === vehicleId) || null;
  }, [drivers]);

  const getAvailableDrivers = useCallback((): Driver[] => {
    return drivers.filter(d => d.status === 'available');
  }, [drivers]);

  return {
    drivers,
    assignmentHistory,
    assignDriver,
    unassignDriver,
    getDriverByVehicle,
    getAvailableDrivers,
  };
}
