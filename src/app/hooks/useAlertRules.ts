"use client";

import { useState, useCallback } from 'react';

export type AlertRuleType = 'ignition' | 'speed' | 'geofence' | 'maintenance' | 'device_disconnect';

export type IgnitionConfig = { onStart: boolean; onStop: boolean };
export type SpeedConfig = { limitKmh: number; gracePercent: number };
export type GeofenceConfig = { zoneName: string; onEnter: boolean; onExit: boolean; centerLat: number; centerLng: number; radiusKm: number };
export type MaintenanceConfig = { afterKm: number; afterDays: number; lastServiceKm: number };
export type DeviceDisconnectConfig = { device: 'gps' | 'obd' | 'both'; toleranceSeconds: number };

export type AlertRuleConfig = IgnitionConfig | SpeedConfig | GeofenceConfig | MaintenanceConfig | DeviceDisconnectConfig;

export type AlertRule = {
  id: string;
  name: string;
  type: AlertRuleType;
  enabled: boolean;
  severity: 'critical' | 'warning' | 'info';
  scope: 'all' | string[];
  config: AlertRuleConfig;
  triggerCount: number;
  lastTriggered: Date | null;
  createdAt: Date;
};

const INITIAL_RULES: AlertRule[] = [
  {
    id: 'RULE-01', name: 'Ignición encendida', type: 'ignition', enabled: true, severity: 'info', scope: 'all',
    config: { onStart: true, onStop: false } as IgnitionConfig,
    triggerCount: 48, lastTriggered: new Date(Date.now() - 15 * 60 * 1000), createdAt: new Date('2024-01-15'),
  },
  {
    id: 'RULE-02', name: 'Ignición apagada', type: 'ignition', enabled: true, severity: 'info', scope: 'all',
    config: { onStart: false, onStop: true } as IgnitionConfig,
    triggerCount: 45, lastTriggered: new Date(Date.now() - 22 * 60 * 1000), createdAt: new Date('2024-01-15'),
  },
  {
    id: 'RULE-03', name: 'Límite velocidad urbana', type: 'speed', enabled: true, severity: 'warning', scope: 'all',
    config: { limitKmh: 80, gracePercent: 10 } as SpeedConfig,
    triggerCount: 23, lastTriggered: new Date(Date.now() - 45 * 60 * 1000), createdAt: new Date('2024-02-01'),
  },
  {
    id: 'RULE-04', name: 'Geocerca Zona Centro', type: 'geofence', enabled: true, severity: 'warning', scope: ['T-01', 'T-04'],
    config: { zoneName: 'Santo Domingo Centro', onEnter: false, onExit: true, centerLat: 18.4861, centerLng: -69.9312, radiusKm: 3.5 } as GeofenceConfig,
    triggerCount: 7, lastTriggered: new Date(Date.now() - 3 * 60 * 60 * 1000), createdAt: new Date('2024-03-10'),
  },
  {
    id: 'RULE-05', name: 'Mantenimiento aceite', type: 'maintenance', enabled: true, severity: 'warning', scope: 'all',
    config: { afterKm: 5000, afterDays: 90, lastServiceKm: 0 } as MaintenanceConfig,
    triggerCount: 3, lastTriggered: new Date(Date.now() - 48 * 60 * 60 * 1000), createdAt: new Date('2024-01-20'),
  },
  {
    id: 'RULE-06', name: 'GPS desconectado', type: 'device_disconnect', enabled: true, severity: 'critical', scope: 'all',
    config: { device: 'gps', toleranceSeconds: 60 } as DeviceDisconnectConfig,
    triggerCount: 12, lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000), createdAt: new Date('2024-02-15'),
  },
  {
    id: 'RULE-07', name: 'OBD desconectado', type: 'device_disconnect', enabled: true, severity: 'warning', scope: 'all',
    config: { device: 'obd', toleranceSeconds: 120 } as DeviceDisconnectConfig,
    triggerCount: 8, lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000), createdAt: new Date('2024-02-15'),
  },
  {
    id: 'RULE-08', name: 'Velocidad autopista', type: 'speed', enabled: false, severity: 'warning', scope: ['T-02', 'T-03'],
    config: { limitKmh: 120, gracePercent: 5 } as SpeedConfig,
    triggerCount: 0, lastTriggered: null, createdAt: new Date('2024-04-01'),
  },
];

let ruleCounter = 9;

const RULES_KEY = 'trackpro_alert_rules';

export function useAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>(() => {
    if (typeof window === 'undefined') return INITIAL_RULES;
    try {
      const saved = localStorage.getItem(RULES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_RULES;
    } catch { return INITIAL_RULES; }
  });

  const updateRules = (newRules: AlertRule[]) => {
    setRules(newRules);
    localStorage.setItem(RULES_KEY, JSON.stringify(newRules));
  };

  const toggleRule = useCallback((id: string) => {
    setRules(prev => {
      const newRules = prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
      localStorage.setItem(RULES_KEY, JSON.stringify(newRules));
      return newRules;
    });
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<AlertRule>) => {
    setRules(prev => {
      const newRules = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      localStorage.setItem(RULES_KEY, JSON.stringify(newRules));
      return newRules;
    });
  }, []);

  const addRule = useCallback((rule: Omit<AlertRule, 'id' | 'triggerCount' | 'lastTriggered' | 'createdAt'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `RULE-${String(ruleCounter++).padStart(2, '0')}`,
      triggerCount: 0,
      lastTriggered: null,
      createdAt: new Date(),
    };
    setRules(prev => {
      const newRules = [...prev, newRule];
      localStorage.setItem(RULES_KEY, JSON.stringify(newRules));
      return newRules;
    });
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => {
      const newRules = prev.filter(r => r.id !== id);
      localStorage.setItem(RULES_KEY, JSON.stringify(newRules));
      return newRules;
    });
  }, []);

  const getRulesByType = useCallback((type: string): AlertRule[] => {
    return rules.filter(r => r.type === type);
  }, [rules]);

  return {
    rules,
    toggleRule,
    updateRule,
    addRule,
    deleteRule,
    getRulesByType,
  };
}
