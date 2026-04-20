"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export type DeviceUnit = {
  model: string;
  status: 'connected' | 'disconnected' | 'warning';
  signal: number;
  battery: number;
  lastPing: Date;
  firmware: string;
};

export type VehicleOBD = {
  rpm: number;
  engineTemp: number;
  fuelLevel: number;
  odometer: number;
  dtcCodes: string[];
};

export type Vehicle = {
  id: string;
  name: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  heading: number;
  status: 'online' | 'offline';
  hasAlert: boolean;
  path: { lat: number; lng: number }[];
  obd: VehicleOBD;
  vin: string;
  driverId: string | null;
  devices: {
    gps: DeviceUnit;
    obd: DeviceUnit;
  };
};

export type FleetState = {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  followVehicle: boolean;
};

const INITIAL_VEHICLES: Omit<Vehicle, 'path'>[] = [
  {
    id: 'T-01', name: 'Honda Civic 2021', plate: 'A123456', lat: 18.486098, lng: -69.934878, speed: 0, battery: 95, heading: 45, status: 'online', hasAlert: false,
    vin: '1HGBH41JXMN109186', driverId: 'D-01',
    obd: { rpm: 2800, engineTemp: 92, fuelLevel: 72, odometer: 45230, dtcCodes: [] },
    devices: {
      gps: { model: 'Sinotrap ST-910', status: 'connected', signal: 5, battery: 92, lastPing: new Date(), firmware: 'v2.4.1' },
      obd: { model: 'OBD Scanner Pro', status: 'connected', signal: 4, battery: 88, lastPing: new Date(), firmware: 'v1.8.3' },
    },
  },
  {
    id: 'T-02', name: 'Toyota Hilux', plate: 'L987654', lat: 18.472018, lng: -69.935264, speed: 0, battery: 82, heading: 120, status: 'online', hasAlert: false,
    vin: 'MR0FR22G200470478', driverId: 'D-02',
    obd: { rpm: 800, engineTemp: 85, fuelLevel: 55, odometer: 78100, dtcCodes: ['P0171'] },
    devices: {
      gps: { model: 'Sinotrap ST-910', status: 'connected', signal: 4, battery: 78, lastPing: new Date(), firmware: 'v2.4.1' },
      obd: { model: 'OBD Scanner Pro', status: 'warning', signal: 2, battery: 45, lastPing: new Date(), firmware: 'v1.8.3' },
    },
  },
  {
    id: 'T-03', name: 'Nissan Frontier', plate: 'L112233', lat: 18.4820, lng: -69.9400, speed: 0, battery: 20, heading: 270, status: 'offline', hasAlert: true,
    vin: '3N6PD23Y9ZK000471', driverId: null,
    obd: { rpm: 0, engineTemp: 35, fuelLevel: 12, odometer: 112400, dtcCodes: ['P0301', 'P0420'] },
    devices: {
      gps: { model: 'Sinotrap ST-910', status: 'disconnected', signal: 0, battery: 18, lastPing: new Date(), firmware: 'v2.3.0' },
      obd: { model: 'OBD Scanner Pro', status: 'disconnected', signal: 0, battery: 0, lastPing: new Date(), firmware: 'v1.7.1' },
    },
  },
  {
    id: 'T-04', name: 'Hyundai Sonata', plate: 'A445566', lat: 18.485896, lng: -69.919387, speed: 0, battery: 68, heading: 180, status: 'online', hasAlert: false,
    vin: '5NPE24AF8FH105887', driverId: 'D-04',
    obd: { rpm: 2200, engineTemp: 88, fuelLevel: 40, odometer: 33500, dtcCodes: [] },
    devices: {
      gps: { model: 'Sinotrap ST-910', status: 'connected', signal: 5, battery: 65, lastPing: new Date(), firmware: 'v2.4.1' },
      obd: { model: 'OBD Scanner Pro', status: 'connected', signal: 3, battery: 72, lastPing: new Date(), firmware: 'v1.8.3' },
    },
  },
  {
    id: 'T-05', name: 'Suzuki Grand Vitara', plate: 'G778899', lat: 18.49219, lng: -69.93521, speed: 0, battery: 88, heading: 310, status: 'online', hasAlert: false,
    vin: 'JS3TD941614100253', driverId: null,
    obd: { rpm: 1200, engineTemp: 78, fuelLevel: 90, odometer: 15200, dtcCodes: ['P0455'] },
    devices: {
      gps: { model: 'Sinotrap ST-910', status: 'connected', signal: 4, battery: 88, lastPing: new Date(), firmware: 'v2.4.1' },
      obd: { model: 'OBD Scanner Pro', status: 'connected', signal: 5, battery: 95, lastPing: new Date(), firmware: 'v1.8.3' },
    },
  },
];

// ─── Road-snapped waypoint routes from Mapbox Directions API ─── //
// Each route follows actual street geometry in Santo Domingo, DR
const ROUTES: Record<string, { lat: number; lng: number }[]> = {

  // T-01 Honda Civic — Churchill → East on secondary streets → South via Máximo Gómez → 27 de Feb → Lincoln → back north
  'T-01': [
    { lat: 18.486098, lng: -69.934878 },
    { lat: 18.486953, lng: -69.933985 },
    { lat: 18.486963, lng: -69.933191 },
    { lat: 18.486975, lng: -69.932639 },
    { lat: 18.487119, lng: -69.930591 },
    { lat: 18.486688, lng: -69.929462 },
    { lat: 18.486188, lng: -69.929355 },
    { lat: 18.486291, lng: -69.928016 },
    { lat: 18.486374, lng: -69.926913 },
    { lat: 18.486435, lng: -69.926111 },
    { lat: 18.487515, lng: -69.925024 },
    { lat: 18.488358, lng: -69.925077 },
    { lat: 18.489358, lng: -69.924236 },
    { lat: 18.490118, lng: -69.923581 },
    { lat: 18.490560, lng: -69.923201 },
    { lat: 18.490799, lng: -69.922868 },
    { lat: 18.491002, lng: -69.922327 },
    { lat: 18.491057, lng: -69.921489 },
    { lat: 18.490736, lng: -69.921463 },
    { lat: 18.490365, lng: -69.921387 },
    { lat: 18.490207, lng: -69.921296 },
    { lat: 18.489606, lng: -69.920866 },
    { lat: 18.489400, lng: -69.920766 },
    { lat: 18.488988, lng: -69.920699 },
    { lat: 18.488582, lng: -69.920784 },
    { lat: 18.488163, lng: -69.921027 },
    { lat: 18.487844, lng: -69.921159 },
    { lat: 18.487405, lng: -69.921164 },
    { lat: 18.486808, lng: -69.921117 },
    { lat: 18.486885, lng: -69.919984 },
    { lat: 18.486943, lng: -69.918904 },
    { lat: 18.485927, lng: -69.918852 },
    { lat: 18.485866, lng: -69.919919 },
    { lat: 18.485798, lng: -69.921070 },
    { lat: 18.485185, lng: -69.921025 },
    { lat: 18.483530, lng: -69.920929 },
    { lat: 18.482707, lng: -69.920887 },
    { lat: 18.482141, lng: -69.920854 },
    { lat: 18.481735, lng: -69.920814 },
    { lat: 18.481550, lng: -69.920787 },
    { lat: 18.481259, lng: -69.920734 },
    { lat: 18.480502, lng: -69.920703 },
    { lat: 18.480491, lng: -69.920438 },
    { lat: 18.480643, lng: -69.920269 },
    { lat: 18.480818, lng: -69.920078 },
    { lat: 18.480861, lng: -69.919836 },
    { lat: 18.481126, lng: -69.919642 },
    { lat: 18.481512, lng: -69.919342 },
    { lat: 18.481648, lng: -69.918659 },
    { lat: 18.481923, lng: -69.918643 },
    { lat: 18.482064, lng: -69.918275 },
    { lat: 18.482026, lng: -69.917747 },
    { lat: 18.482007, lng: -69.917386 },
    { lat: 18.481958, lng: -69.916417 },
    { lat: 18.481820, lng: -69.915521 },
    { lat: 18.481739, lng: -69.914858 },
    { lat: 18.481552, lng: -69.914561 },
    { lat: 18.481381, lng: -69.914412 },
    { lat: 18.481163, lng: -69.914306 },
    { lat: 18.480232, lng: -69.914166 },
    { lat: 18.479730, lng: -69.914118 },
    { lat: 18.479281, lng: -69.914069 },
    { lat: 18.477971, lng: -69.913883 },
    { lat: 18.476996, lng: -69.913689 },
    { lat: 18.476591, lng: -69.913740 },
    { lat: 18.476398, lng: -69.913875 },
    { lat: 18.476290, lng: -69.914000 },
    { lat: 18.476046, lng: -69.914669 },
    { lat: 18.475780, lng: -69.915330 },
    { lat: 18.475669, lng: -69.915574 },
    { lat: 18.475292, lng: -69.916177 },
    { lat: 18.475055, lng: -69.916470 },
    { lat: 18.474792, lng: -69.916752 },
    { lat: 18.474309, lng: -69.917392 },
    { lat: 18.473580, lng: -69.918261 },
    { lat: 18.473236, lng: -69.918698 },
    { lat: 18.472693, lng: -69.919367 },
    { lat: 18.471969, lng: -69.920169 },
    { lat: 18.471102, lng: -69.921081 },
    { lat: 18.470402, lng: -69.921869 },
    { lat: 18.470023, lng: -69.922335 },
    { lat: 18.469665, lng: -69.922792 },
    { lat: 18.468969, lng: -69.923727 },
    { lat: 18.468341, lng: -69.924898 },
    { lat: 18.467991, lng: -69.925759 },
    { lat: 18.467847, lng: -69.926044 },
    { lat: 18.467318, lng: -69.927086 },
    { lat: 18.466887, lng: -69.927946 },
    { lat: 18.466634, lng: -69.928450 },
    { lat: 18.466218, lng: -69.929281 },
    { lat: 18.465717, lng: -69.930278 },
    { lat: 18.465984, lng: -69.930429 },
    { lat: 18.467972, lng: -69.931549 },
    { lat: 18.468402, lng: -69.931721 },
    { lat: 18.469276, lng: -69.931676 },
    { lat: 18.469412, lng: -69.931654 },
    { lat: 18.470131, lng: -69.931600 },
    { lat: 18.470809, lng: -69.931552 },
    { lat: 18.471896, lng: -69.931504 },
    { lat: 18.472365, lng: -69.931480 },
    { lat: 18.473560, lng: -69.931436 },
    { lat: 18.474433, lng: -69.931389 },
    { lat: 18.475475, lng: -69.931350 },
    { lat: 18.475409, lng: -69.930346 },
    { lat: 18.475376, lng: -69.929188 },
    { lat: 18.475384, lng: -69.927998 },
    { lat: 18.475388, lng: -69.927477 },
    { lat: 18.475426, lng: -69.926809 },
    { lat: 18.475125, lng: -69.926676 },
    { lat: 18.474308, lng: -69.926350 },
    { lat: 18.474307, lng: -69.927185 },
    { lat: 18.474284, lng: -69.928168 },
    { lat: 18.474305, lng: -69.928714 },
    { lat: 18.474397, lng: -69.930616 },
    { lat: 18.474433, lng: -69.931466 },
    { lat: 18.474471, lng: -69.932593 },
    { lat: 18.474483, lng: -69.933070 },
    { lat: 18.474464, lng: -69.933202 },
    { lat: 18.474397, lng: -69.933424 },
    { lat: 18.474079, lng: -69.934061 },
    { lat: 18.473730, lng: -69.934762 },
    { lat: 18.474293, lng: -69.935061 },
    { lat: 18.474907, lng: -69.935386 },
    { lat: 18.475406, lng: -69.935674 },
    { lat: 18.476283, lng: -69.936180 },
    { lat: 18.476671, lng: -69.936404 },
    { lat: 18.477325, lng: -69.936773 },
    { lat: 18.477660, lng: -69.936960 },
    { lat: 18.478585, lng: -69.937477 },
    { lat: 18.478634, lng: -69.937505 },
    { lat: 18.480560, lng: -69.938560 },
    { lat: 18.481220, lng: -69.938922 },
    { lat: 18.481386, lng: -69.938592 },
    { lat: 18.481704, lng: -69.937962 },
    { lat: 18.480719, lng: -69.937393 },
    { lat: 18.480992, lng: -69.936758 },
    { lat: 18.481227, lng: -69.935956 },
    { lat: 18.481176, lng: -69.935861 },
    { lat: 18.481069, lng: -69.935821 },
    { lat: 18.481020, lng: -69.935748 },
    { lat: 18.480952, lng: -69.935492 },
    { lat: 18.480856, lng: -69.935464 },
    { lat: 18.480122, lng: -69.935592 },
    { lat: 18.479431, lng: -69.935537 },
    { lat: 18.479344, lng: -69.936056 },
    { lat: 18.479152, lng: -69.936543 },
    { lat: 18.478680, lng: -69.937418 },
    { lat: 18.478711, lng: -69.937547 },
    { lat: 18.480693, lng: -69.938633 },
    { lat: 18.481334, lng: -69.938984 },
    { lat: 18.481538, lng: -69.939095 },
    { lat: 18.482258, lng: -69.939487 },
    { lat: 18.483255, lng: -69.940029 },
    { lat: 18.483794, lng: -69.940303 },
    { lat: 18.484209, lng: -69.940529 },
    { lat: 18.485103, lng: -69.941057 },
    { lat: 18.485277, lng: -69.941155 },
    { lat: 18.485603, lng: -69.941361 },
    { lat: 18.485886, lng: -69.941513 },
    { lat: 18.486323, lng: -69.941746 },
    { lat: 18.486622, lng: -69.941918 },
    { lat: 18.486965, lng: -69.942115 },
    { lat: 18.486955, lng: -69.941263 },
    { lat: 18.486954, lng: -69.940697 },
    { lat: 18.486959, lng: -69.940166 },
    { lat: 18.486962, lng: -69.939819 },
    { lat: 18.486972, lng: -69.938777 },
    { lat: 18.486953, lng: -69.937783 },
    { lat: 18.486954, lng: -69.936458 },
    { lat: 18.486954, lng: -69.936215 },
    { lat: 18.486972, lng: -69.934879 },
    { lat: 18.486526, lng: -69.934876 },
  ],

  // T-02 Toyota Hilux — Southern loop via Tiradentes → 27 de Febrero → Lincoln
  'T-02': [
    { lat: 18.472018, lng: -69.935264 },
    { lat: 18.472419, lng: -69.935018 },
    { lat: 18.472768, lng: -69.934339 },
    { lat: 18.471831, lng: -69.933856 },
    { lat: 18.472152, lng: -69.933221 },
    { lat: 18.472334, lng: -69.932817 },
    { lat: 18.472376, lng: -69.932630 },
    { lat: 18.472365, lng: -69.931480 },
    { lat: 18.472358, lng: -69.931200 },
    { lat: 18.472345, lng: -69.930885 },
    { lat: 18.472322, lng: -69.930507 },
    { lat: 18.472276, lng: -69.929656 },
    { lat: 18.472238, lng: -69.927994 },
    { lat: 18.472234, lng: -69.927654 },
    { lat: 18.472337, lng: -69.926947 },
    { lat: 18.472460, lng: -69.926217 },
    { lat: 18.472060, lng: -69.925393 },
    { lat: 18.471138, lng: -69.925025 },
    { lat: 18.470586, lng: -69.924796 },
    { lat: 18.470058, lng: -69.924387 },
    { lat: 18.469809, lng: -69.924201 },
    { lat: 18.469055, lng: -69.923712 },
    { lat: 18.468806, lng: -69.923485 },
    { lat: 18.468353, lng: -69.922967 },
    { lat: 18.467941, lng: -69.922502 },
    { lat: 18.467997, lng: -69.922416 },
    { lat: 18.468499, lng: -69.922978 },
    { lat: 18.468626, lng: -69.923087 },
    { lat: 18.468767, lng: -69.923132 },
    { lat: 18.468951, lng: -69.923137 },
    { lat: 18.469136, lng: -69.923091 },
    { lat: 18.469344, lng: -69.922923 },
    { lat: 18.469950, lng: -69.922174 },
    { lat: 18.470191, lng: -69.921915 },
    { lat: 18.470339, lng: -69.921803 },
    { lat: 18.470760, lng: -69.921310 },
    { lat: 18.471207, lng: -69.920723 },
    { lat: 18.471543, lng: -69.920330 },
    { lat: 18.472188, lng: -69.919580 },
    { lat: 18.472559, lng: -69.919216 },
    { lat: 18.472934, lng: -69.918844 },
    { lat: 18.473370, lng: -69.918329 },
    { lat: 18.474124, lng: -69.917434 },
    { lat: 18.474578, lng: -69.916801 },
    { lat: 18.474817, lng: -69.916462 },
    { lat: 18.474993, lng: -69.916172 },
    { lat: 18.475421, lng: -69.915513 },
    { lat: 18.475719, lng: -69.914892 },
    { lat: 18.475878, lng: -69.915100 },
    { lat: 18.475669, lng: -69.915574 },
    { lat: 18.475292, lng: -69.916177 },
    { lat: 18.475055, lng: -69.916470 },
    { lat: 18.474792, lng: -69.916752 },
    { lat: 18.474309, lng: -69.917392 },
    { lat: 18.473580, lng: -69.918261 },
    { lat: 18.473236, lng: -69.918698 },
    { lat: 18.472693, lng: -69.919367 },
    { lat: 18.471969, lng: -69.920169 },
    { lat: 18.471102, lng: -69.921081 },
    { lat: 18.470402, lng: -69.921869 },
    { lat: 18.470023, lng: -69.922335 },
    { lat: 18.469665, lng: -69.922792 },
    { lat: 18.468969, lng: -69.923727 },
    { lat: 18.468341, lng: -69.924898 },
    { lat: 18.467991, lng: -69.925759 },
    { lat: 18.467847, lng: -69.926044 },
    { lat: 18.467318, lng: -69.927086 },
    { lat: 18.466887, lng: -69.927946 },
    { lat: 18.466634, lng: -69.928450 },
    { lat: 18.466218, lng: -69.929281 },
    { lat: 18.465717, lng: -69.930278 },
    { lat: 18.465984, lng: -69.930429 },
    { lat: 18.467972, lng: -69.931549 },
    { lat: 18.468402, lng: -69.931721 },
    { lat: 18.469276, lng: -69.931676 },
    { lat: 18.469666, lng: -69.931632 },
    { lat: 18.470282, lng: -69.931589 },
    { lat: 18.471334, lng: -69.931533 },
    { lat: 18.472071, lng: -69.931495 },
    { lat: 18.472794, lng: -69.931467 },
    { lat: 18.474108, lng: -69.931410 },
    { lat: 18.475475, lng: -69.931350 },
    { lat: 18.475409, lng: -69.930346 },
    { lat: 18.475376, lng: -69.929188 },
    { lat: 18.475384, lng: -69.927998 },
    { lat: 18.475420, lng: -69.927071 },
    { lat: 18.475367, lng: -69.926782 },
    { lat: 18.474308, lng: -69.926350 },
    { lat: 18.474305, lng: -69.926557 },
    { lat: 18.474283, lng: -69.927571 },
    { lat: 18.474294, lng: -69.928418 },
    { lat: 18.474332, lng: -69.929484 },
    { lat: 18.474433, lng: -69.931389 },
    { lat: 18.474451, lng: -69.932094 },
    { lat: 18.474486, lng: -69.932960 },
    { lat: 18.474475, lng: -69.933137 },
    { lat: 18.474436, lng: -69.933318 },
    { lat: 18.474313, lng: -69.933588 },
    { lat: 18.473730, lng: -69.934762 },
    { lat: 18.474027, lng: -69.934919 },
    { lat: 18.474571, lng: -69.935208 },
    { lat: 18.474927, lng: -69.935397 },
    { lat: 18.475406, lng: -69.935674 },
    { lat: 18.476283, lng: -69.936180 },
    { lat: 18.476521, lng: -69.936318 },
    { lat: 18.476800, lng: -69.936479 },
    { lat: 18.476753, lng: -69.936577 },
    { lat: 18.476243, lng: -69.936290 },
    { lat: 18.475744, lng: -69.936011 },
    { lat: 18.475462, lng: -69.935844 },
    { lat: 18.474879, lng: -69.935500 },
    { lat: 18.474142, lng: -69.935110 },
    { lat: 18.473686, lng: -69.934854 },
    { lat: 18.473082, lng: -69.934515 },
    { lat: 18.472768, lng: -69.934339 },
    { lat: 18.472512, lng: -69.934837 },
    { lat: 18.472232, lng: -69.935383 },
  ],

  // T-04 Hyundai Sonata — Eastern loop: Peña Batlle → Máximo Gómez → 27 de Feb → Lope de Vega area → back north
  'T-04': [
    { lat: 18.485896, lng: -69.919387 },
    { lat: 18.485866, lng: -69.919919 },
    { lat: 18.486943, lng: -69.918904 },
    { lat: 18.487014, lng: -69.917832 },
    { lat: 18.484978, lng: -69.917693 },
    { lat: 18.484993, lng: -69.917410 },
    { lat: 18.485085, lng: -69.915534 },
    { lat: 18.485162, lng: -69.914396 },
    { lat: 18.485209, lng: -69.913357 },
    { lat: 18.485284, lng: -69.911018 },
    { lat: 18.485302, lng: -69.909918 },
    { lat: 18.486100, lng: -69.909923 },
    { lat: 18.486324, lng: -69.911015 },
    { lat: 18.486309, lng: -69.912348 },
    { lat: 18.486250, lng: -69.913448 },
    { lat: 18.486199, lng: -69.914355 },
    { lat: 18.486191, lng: -69.914558 },
    { lat: 18.485158, lng: -69.914503 },
    { lat: 18.484058, lng: -69.914430 },
    { lat: 18.483532, lng: -69.914384 },
    { lat: 18.483001, lng: -69.914330 },
    { lat: 18.482013, lng: -69.914269 },
    { lat: 18.481759, lng: -69.914271 },
    { lat: 18.481742, lng: -69.913572 },
    { lat: 18.481689, lng: -69.912622 },
    { lat: 18.481664, lng: -69.912178 },
    { lat: 18.481696, lng: -69.911993 },
    { lat: 18.481598, lng: -69.910651 },
    { lat: 18.480493, lng: -69.910747 },
    { lat: 18.480161, lng: -69.910547 },
    { lat: 18.480139, lng: -69.910293 },
    { lat: 18.479998, lng: -69.910158 },
    { lat: 18.479884, lng: -69.910100 },
    { lat: 18.479789, lng: -69.910124 },
    { lat: 18.479793, lng: -69.910808 },
    { lat: 18.479787, lng: -69.911392 },
    { lat: 18.479759, lng: -69.913023 },
    { lat: 18.479754, lng: -69.913248 },
    { lat: 18.479750, lng: -69.913448 },
    { lat: 18.479730, lng: -69.914118 },
    { lat: 18.479281, lng: -69.914069 },
    { lat: 18.477971, lng: -69.913883 },
    { lat: 18.476996, lng: -69.913689 },
    { lat: 18.476332, lng: -69.913547 },
    { lat: 18.476181, lng: -69.913087 },
    { lat: 18.476211, lng: -69.912662 },
    { lat: 18.476215, lng: -69.912406 },
    { lat: 18.476202, lng: -69.912060 },
    { lat: 18.476079, lng: -69.910931 },
    { lat: 18.476037, lng: -69.910583 },
    { lat: 18.475462, lng: -69.910277 },
    { lat: 18.475858, lng: -69.909353 },
    { lat: 18.475754, lng: -69.908637 },
    { lat: 18.475644, lng: -69.907721 },
    { lat: 18.475621, lng: -69.907333 },
    { lat: 18.475647, lng: -69.907266 },
    { lat: 18.475699, lng: -69.907255 },
    { lat: 18.475727, lng: -69.907269 },
    { lat: 18.475759, lng: -69.907326 },
    { lat: 18.475834, lng: -69.907692 },
    { lat: 18.476042, lng: -69.909142 },
    { lat: 18.476216, lng: -69.910324 },
    { lat: 18.476408, lng: -69.911837 },
    { lat: 18.476442, lng: -69.912582 },
    { lat: 18.476393, lng: -69.913134 },
    { lat: 18.476347, lng: -69.913430 },
    { lat: 18.476255, lng: -69.913934 },
    { lat: 18.476046, lng: -69.914669 },
    { lat: 18.475780, lng: -69.915330 },
    { lat: 18.475669, lng: -69.915574 },
    { lat: 18.475292, lng: -69.916177 },
    { lat: 18.475055, lng: -69.916470 },
    { lat: 18.474792, lng: -69.916752 },
    { lat: 18.474309, lng: -69.917392 },
    { lat: 18.473580, lng: -69.918261 },
    { lat: 18.473331, lng: -69.918557 },
    { lat: 18.473199, lng: -69.918933 },
    { lat: 18.473181, lng: -69.919158 },
    { lat: 18.473242, lng: -69.919402 },
    { lat: 18.473354, lng: -69.919550 },
    { lat: 18.473547, lng: -69.919691 },
    { lat: 18.473761, lng: -69.919772 },
    { lat: 18.474133, lng: -69.919894 },
    { lat: 18.474737, lng: -69.920075 },
    { lat: 18.475119, lng: -69.920180 },
    { lat: 18.475853, lng: -69.920342 },
    { lat: 18.476253, lng: -69.920448 },
    { lat: 18.476713, lng: -69.920472 },
    { lat: 18.477443, lng: -69.920512 },
    { lat: 18.478605, lng: -69.920583 },
    { lat: 18.479727, lng: -69.920642 },
    { lat: 18.480502, lng: -69.920703 },
    { lat: 18.480451, lng: -69.920282 },
    { lat: 18.480124, lng: -69.920230 },
    { lat: 18.480028, lng: -69.920064 },
    { lat: 18.480012, lng: -69.919917 },
    { lat: 18.479820, lng: -69.919712 },
    { lat: 18.479526, lng: -69.919584 },
    { lat: 18.479197, lng: -69.919384 },
    { lat: 18.479012, lng: -69.919107 },
    { lat: 18.478901, lng: -69.918879 },
    { lat: 18.478897, lng: -69.918402 },
    { lat: 18.479013, lng: -69.918147 },
    { lat: 18.479036, lng: -69.918112 },
    { lat: 18.479298, lng: -69.917896 },
    { lat: 18.479322, lng: -69.917892 },
    { lat: 18.479949, lng: -69.917825 },
    { lat: 18.480207, lng: -69.917800 },
    { lat: 18.480851, lng: -69.917742 },
    { lat: 18.481022, lng: -69.917787 },
    { lat: 18.481275, lng: -69.917910 },
    { lat: 18.481363, lng: -69.917700 },
    { lat: 18.481848, lng: -69.917745 },
    { lat: 18.482026, lng: -69.917747 },
    { lat: 18.482007, lng: -69.917386 },
    { lat: 18.481958, lng: -69.916417 },
    { lat: 18.481820, lng: -69.915521 },
    { lat: 18.481772, lng: -69.914544 },
    { lat: 18.481752, lng: -69.914154 },
    { lat: 18.482010, lng: -69.914155 },
    { lat: 18.482500, lng: -69.914174 },
    { lat: 18.482860, lng: -69.914220 },
    { lat: 18.484557, lng: -69.914355 },
    { lat: 18.484609, lng: -69.914936 },
    { lat: 18.484762, lng: -69.916559 },
    { lat: 18.484916, lng: -69.917866 },
    { lat: 18.484963, lng: -69.918440 },
    { lat: 18.485412, lng: -69.918813 },
    { lat: 18.485927, lng: -69.918852 },
  ],

  // T-05 Suzuki Grand Vitara — Northern Churchill → JFK → Próceres → back north
  'T-05': [
    { lat: 18.492190, lng: -69.935210 },
    { lat: 18.492040, lng: -69.934973 },
    { lat: 18.491787, lng: -69.934897 },
    { lat: 18.491012, lng: -69.934875 },
    { lat: 18.489923, lng: -69.934875 },
    { lat: 18.489683, lng: -69.934875 },
    { lat: 18.489076, lng: -69.934867 },
    { lat: 18.488853, lng: -69.934875 },
    { lat: 18.488204, lng: -69.934875 },
    { lat: 18.487547, lng: -69.934878 },
    { lat: 18.487076, lng: -69.934879 },
    { lat: 18.486972, lng: -69.934879 },
    { lat: 18.486098, lng: -69.934878 },
    { lat: 18.485526, lng: -69.934881 },
    { lat: 18.485242, lng: -69.934882 },
    { lat: 18.483819, lng: -69.934890 },
    { lat: 18.483319, lng: -69.934878 },
    { lat: 18.483342, lng: -69.934960 },
    { lat: 18.483430, lng: -69.935302 },
    { lat: 18.483622, lng: -69.936065 },
    { lat: 18.483751, lng: -69.936395 },
    { lat: 18.483922, lng: -69.937007 },
    { lat: 18.484148, lng: -69.937816 },
    { lat: 18.484331, lng: -69.938476 },
    { lat: 18.484423, lng: -69.938845 },
    { lat: 18.484515, lng: -69.939379 },
    { lat: 18.484539, lng: -69.939849 },
    { lat: 18.484559, lng: -69.940194 },
    { lat: 18.484668, lng: -69.940526 },
    { lat: 18.484859, lng: -69.940835 },
    { lat: 18.485103, lng: -69.941057 },
    { lat: 18.485277, lng: -69.941155 },
    { lat: 18.485603, lng: -69.941361 },
    { lat: 18.485886, lng: -69.941513 },
    { lat: 18.486323, lng: -69.941746 },
    { lat: 18.486622, lng: -69.941918 },
    { lat: 18.486965, lng: -69.942115 },
    { lat: 18.486973, lng: -69.942286 },
    { lat: 18.486170, lng: -69.941855 },
    { lat: 18.486139, lng: -69.941838 },
    { lat: 18.485310, lng: -69.941401 },
    { lat: 18.484838, lng: -69.941119 },
    { lat: 18.484298, lng: -69.940765 },
    { lat: 18.484002, lng: -69.940588 },
    { lat: 18.484062, lng: -69.940438 },
    { lat: 18.484349, lng: -69.940604 },
    { lat: 18.485103, lng: -69.941057 },
    { lat: 18.485342, lng: -69.941193 },
    { lat: 18.485786, lng: -69.941459 },
    { lat: 18.486398, lng: -69.941789 },
    { lat: 18.486965, lng: -69.942115 },
    { lat: 18.487151, lng: -69.942236 },
    { lat: 18.487365, lng: -69.942404 },
    { lat: 18.487611, lng: -69.942709 },
    { lat: 18.487828, lng: -69.943114 },
    { lat: 18.488043, lng: -69.943627 },
    { lat: 18.488745, lng: -69.943631 },
    { lat: 18.490183, lng: -69.943641 },
    { lat: 18.490558, lng: -69.943310 },
    { lat: 18.490575, lng: -69.942718 },
    { lat: 18.490621, lng: -69.942670 },
    { lat: 18.491243, lng: -69.942613 },
    { lat: 18.491676, lng: -69.942579 },
    { lat: 18.492142, lng: -69.942560 },
    { lat: 18.492147, lng: -69.942001 },
    { lat: 18.492136, lng: -69.940586 },
    { lat: 18.492155, lng: -69.940499 },
    { lat: 18.492533, lng: -69.940192 },
    { lat: 18.492536, lng: -69.939873 },
    { lat: 18.492540, lng: -69.939383 },
    { lat: 18.493017, lng: -69.939390 },
    { lat: 18.493368, lng: -69.937780 },
    { lat: 18.493597, lng: -69.937767 },
    { lat: 18.493140, lng: -69.937115 },
    { lat: 18.492966, lng: -69.936872 },
    { lat: 18.492704, lng: -69.936414 },
    { lat: 18.492414, lng: -69.935735 },
  ],
};

// Step size per tick (~30m, simulates ~55 km/h at 2s interval)
const STEP = 0.00027;

export function useFleet() {
  const [fleet, setFleet] = useState<FleetState>({
    vehicles: INITIAL_VEHICLES.map(v => ({ ...v, path: [{ lat: v.lat, lng: v.lng }] })),
    selectedVehicleId: 'T-01',
    followVehicle: true,
  });

  const fleetRef = useRef(fleet);
  fleetRef.current = fleet;

  const waypointIndexRef = useRef<Record<string, number>>({
    'T-01': 0,
    'T-02': 0,
    'T-04': 0,
    'T-05': 0,
  });

  // Cross-device alert callback ref
  const crossDeviceAlertCallbackRef = useRef<((vehicleId: string, vehicleName: string, device: 'gps' | 'obd') => void) | null>(null);

  // Tick counter for device disconnect simulation
  const tickCounterRef = useRef(0);
  // Track which vehicle/device is currently disconnected for simulation
  const disconnectSimRef = useRef<{ vehicleId: string; device: 'gps' | 'obd'; reconnectAtTick: number } | null>(null);

  const selectVehicle = useCallback((id: string | null) => {
    setFleet(prev => ({ ...prev, selectedVehicleId: id }));
  }, []);

  const toggleFollow = useCallback(() => {
    setFleet(prev => ({ ...prev, followVehicle: !prev.followVehicle }));
  }, []);

  const setVehicleDriver = useCallback((vehicleId: string, driverId: string | null) => {
    setFleet(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v =>
        v.id === vehicleId ? { ...v, driverId } : v
      ),
    }));
  }, []);

  // Set cross-device alert callback
  const setCrossDeviceAlertCallback = useCallback((cb: ((vehicleId: string, vehicleName: string, device: 'gps' | 'obd') => void) | null) => {
    crossDeviceAlertCallbackRef.current = cb;
  }, []);

  // Simulation Logic — waypoint-based movement along real streets
  useEffect(() => {
    const interval = setInterval(() => {
      tickCounterRef.current += 1;
      const currentTick = tickCounterRef.current;

      setFleet(prev => {
        let updatedVehicles = prev.vehicles.map(v => {
          if (v.status === 'offline') return v;

          // ── Waypoint-following movement ──
          const route = ROUTES[v.id];
          if (!route) return v;

          const currentIndex = waypointIndexRef.current[v.id] ?? 0;
          const nextIndex = (currentIndex + 1) % route.length;
          const target = route[nextIndex];

          const dLat = target.lat - v.lat;
          const dLng = target.lng - v.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          let newLat = v.lat;
          let newLng = v.lng;

          if (dist < STEP) {
            // Reached waypoint — snap to it and advance
            newLat = target.lat;
            newLng = target.lng;
            waypointIndexRef.current[v.id] = nextIndex;
          } else {
            // Move toward waypoint
            const ratio = STEP / dist;
            newLat = v.lat + dLat * ratio;
            newLng = v.lng + dLng * ratio;
          }

          // Heading: angle toward next waypoint
          const newHeading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

          // Speed: derive from actual movement distance
          const movedDist = Math.sqrt(
            Math.pow(newLat - v.lat, 2) + Math.pow(newLng - v.lng, 2)
          );
          // Convert degrees to meters (~111000m per degree), then to km/h at 2s interval
          const newSpeed = Math.round((movedDist * 111000 / 2) * 3.6);

          // Battery variation
          const batteryChange = (Math.random() - 0.5) * 0.5;
          const newBattery = Math.max(0, Math.min(100, v.battery + batteryChange));

          // Path trail (cap at 50 points)
          const newPath = [...v.path, { lat: newLat, lng: newLng }].slice(-50);

          // OBD simulation
          const rpmBase = newSpeed > 0 ? 800 + newSpeed * 30 : 800;
          const newRpm = Math.round(rpmBase + (Math.random() - 0.5) * 200);
          const tempChange = (Math.random() - 0.5) * 2;
          const newEngineTemp = Math.round(Math.max(60, Math.min(110, v.obd.engineTemp + tempChange)));
          const fuelChange = -Math.random() * 0.05;
          const newFuelLevel = Math.round(Math.max(0, v.obd.fuelLevel + fuelChange) * 10) / 10;

          // Update device lastPing for online vehicles
          const newDevices = {
            gps: { ...v.devices.gps, lastPing: new Date() },
            obd: { ...v.devices.obd, lastPing: new Date() },
          };

          return {
            ...v,
            lat: newLat,
            lng: newLng,
            speed: newSpeed,
            battery: Math.round(newBattery),
            heading: newHeading,
            path: newPath,
            obd: {
              ...v.obd,
              rpm: newRpm,
              engineTemp: newEngineTemp,
              fuelLevel: newFuelLevel,
              odometer: v.obd.odometer + (newSpeed / 3600) * 2,
            },
            devices: newDevices,
          };
        });

        // ── Device disconnect simulation every ~45s (22 ticks) ──
        const simState = disconnectSimRef.current;

        if (simState && currentTick >= simState.reconnectAtTick) {
          // Reconnect the device
          updatedVehicles = updatedVehicles.map(v => {
            if (v.id === simState.vehicleId) {
              return {
                ...v,
                devices: {
                  ...v.devices,
                  [simState.device]: {
                    ...v.devices[simState.device],
                    status: 'connected' as const,
                    signal: Math.floor(Math.random() * 3) + 3,
                  },
                },
              };
            }
            return v;
          });
          disconnectSimRef.current = null;
        }

        if (!disconnectSimRef.current && currentTick % 22 === 0 && currentTick > 0) {
          // Pick a random online vehicle and disconnect a device
          const onlineVehicles = updatedVehicles.filter(v => v.status === 'online');
          if (onlineVehicles.length > 0) {
            const randomVehicle = onlineVehicles[Math.floor(Math.random() * onlineVehicles.length)];
            const deviceToDisconnect: 'gps' | 'obd' = Math.random() > 0.5 ? 'gps' : 'obd';

            updatedVehicles = updatedVehicles.map(v => {
              if (v.id === randomVehicle.id) {
                return {
                  ...v,
                  devices: {
                    ...v.devices,
                    [deviceToDisconnect]: {
                      ...v.devices[deviceToDisconnect],
                      status: 'disconnected' as const,
                      signal: 0,
                    },
                  },
                };
              }
              return v;
            });

            // Schedule reconnect in 5 ticks (~10 seconds)
            disconnectSimRef.current = {
              vehicleId: randomVehicle.id,
              device: deviceToDisconnect,
              reconnectAtTick: currentTick + 5,
            };

            // Fire cross-device alert
            if (crossDeviceAlertCallbackRef.current) {
              crossDeviceAlertCallbackRef.current(randomVehicle.id, randomVehicle.name, deviceToDisconnect);
            }
          }
        }

        return { ...prev, vehicles: updatedVehicles };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getSelectedVehicle = useCallback(() => {
    return fleet.vehicles.find(v => v.id === fleet.selectedVehicleId) || null;
  }, [fleet.vehicles, fleet.selectedVehicleId]);

  const centerFleet = useCallback((mapRef: any) => {
    if (!mapRef) return;
    const onlineVehicles = fleetRef.current.vehicles.filter(v => v.status === 'online');
    if (onlineVehicles.length === 0) return;

    const lats = onlineVehicles.map(v => v.lat);
    const lngs = onlineVehicles.map(v => v.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    mapRef.fitBounds(
      [
        [minLng - 0.01, minLat - 0.01],
        [maxLng + 0.01, maxLat + 0.01]
      ],
      { padding: 40, duration: 1000 }
    );
  }, []);

  return {
    fleet,
    selectVehicle,
    toggleFollow,
    getSelectedVehicle,
    centerFleet,
    setVehicleDriver,
    setCrossDeviceAlertCallback,
  };
}


