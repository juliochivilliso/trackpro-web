"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useFleet, Vehicle } from "../../hooks/useFleet";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Car,
  Gauge,
  Thermometer,
  Fuel,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Send,
  Wrench,
  Clock,
  Shield,
  Cpu,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

// ─── Vehicle Technical Specs ─── //
const VEHICLE_SPECS: Record<string, {
  motor: string; potencia: string; combustible: string; transmision: string;
  tanque: string; intervaloAceite: string; tipoAceite: string; filtroAceite: string;
  capacidadAceite: string; peso: string;
}> = {
  'T-01': {
    motor: '1.5L VTEC Turbo 4 cilindros', potencia: '174 HP @ 6,000 RPM', combustible: 'Gasolina 91 octanos',
    transmision: 'CVT automática', tanque: '47 litros', intervaloAceite: '5,000 km / 90 días',
    tipoAceite: '0W-20 Full Sintético', filtroAceite: 'Honda 15400-PLM-A02', capacidadAceite: '3.7 litros', peso: '1,347 kg',
  },
  'T-02': {
    motor: '2.8L GD-6 Diesel 4 cilindros', potencia: '204 HP @ 3,400 RPM', combustible: 'Diesel',
    transmision: 'Automática 6 velocidades', tanque: '80 litros', intervaloAceite: '10,000 km / 12 meses',
    tipoAceite: '5W-30 Diesel Full Sintético', filtroAceite: 'Toyota 90915-YZZD3', capacidadAceite: '7.8 litros', peso: '1,920 kg',
  },
  'T-03': {
    motor: '2.5L QR25DE 4 cilindros', potencia: '152 HP @ 5,600 RPM', combustible: 'Gasolina 87 octanos',
    transmision: 'Manual 6 velocidades', tanque: '73 litros', intervaloAceite: '5,000 km / 90 días',
    tipoAceite: '5W-30 Semi Sintético', filtroAceite: 'Nissan 15208-65F0E', capacidadAceite: '4.9 litros', peso: '1,735 kg',
  },
  'T-04': {
    motor: '2.5L MPi 4 cilindros', potencia: '191 HP @ 6,100 RPM', combustible: 'Gasolina 91 octanos',
    transmision: 'Automática 8 velocidades', tanque: '62 litros', intervaloAceite: '10,000 km / 12 meses',
    tipoAceite: '5W-30 Full Sintético', filtroAceite: 'Hyundai 26300-35505', capacidadAceite: '4.8 litros', peso: '1,525 kg',
  },
  'T-05': {
    motor: '1.5L K15B 4 cilindros', potencia: '103 HP @ 6,000 RPM', combustible: 'Gasolina 87 octanos',
    transmision: 'Automática 4 velocidades', tanque: '55 litros', intervaloAceite: '5,000 km / 90 días',
    tipoAceite: '5W-30 Semi Sintético', filtroAceite: 'Suzuki 16510-61A31-000', capacidadAceite: '3.5 litros', peso: '1,385 kg',
  },
};

// ─── OBD AI Analysis ─── //
const DTC_AI_ANALYSIS: Record<string, Record<string, string>> = {
  'T-02': {
    'P0171': 'Motor 2.8L GD-6 de esta Hilux: La mezcla pobre en diesel puede indicar filtro de combustible obstruido (reemplazar si supera 40,000 km desde último cambio), inyectores con depósitos de carbón (limpiar con aditivo cada 60,000 km), o sensor de presión de riel dañado. Verificar presión de riel: debe ser 200-1,800 bar según régimen. Costo estimado servicio en RD: RD$2,800 - RD$8,500. Prioridad: MEDIA — el vehículo puede seguir operando con monitoreo.',
  },
  'T-03': {
    'P0301': 'Motor QR25DE del Frontier: Fallo en cilindro 1 en motores de gasolina de esta generación es frecuentemente bujías desgastadas (NGK BKR6E-11, torque 18Nm, sustituir cada 30,000 km) o bobina de encendido dañada (verificar resistencia: 0.7-0.8 Ω primario, 8,000-11,500 Ω secundario). Si persiste, revisar inyector cilindro 1 (flujo nominal 195cc/min). Costo estimado RD: RD$1,200 - RD$6,000. ATENCIÓN: riesgo de daño al catalizador si supera 50 km con el código activo.',
    'P0420': 'El sensor O2 trasero del Frontier reporta eficiencia del catalizador por debajo del 95%. En el QR25DE esto puede deberse a: mezcla rica crónica (revisar inyectores primero), contaminación del catalizador por aceite quemado (revisar sellos de válvulas), o catalizador al final de su vida útil (vida útil típica: 150,000-200,000 km). Odómetro actual: 112,400 km. Recomendación: diagnóstico completo antes de reemplazar. Costo catalizador original Nissan: RD$28,000 - RD$45,000. Alternativo certificado: RD$12,000.',
  },
  'T-05': {
    'P0455': 'Sistema EVAP del Vitara 1.5L K15B: Fuga grande (>1mm) detectada. El 80% de los casos en este modelo es simplemente la tapa de combustible mal cerrada o con sello desgastado. Verificar primero: cerrar tapa firmemente y borrar código. Si regresa en 2 ciclos, revisar válvula de purga EVAP (ubicada en tubo del intake, pieza #18860-84Z00, RD$850) y cánister de carbón activo. Prioridad: BAJA — no afecta desempeño del motor.',
  },
};

// ─── Maintenance Predictions ─── //
type MaintenanceItem = { label: string; status: 'urgent' | 'soon' | 'ok'; detail: string };
const MAINTENANCE_DATA: Record<string, MaintenanceItem[]> = {
  'T-01': [
    { label: 'Cambio aceite', status: 'soon', detail: 'En ~800 km (odómetro 45,230, último a 44,500)' },
    { label: 'Revisión frenos', status: 'ok', detail: 'En ~12,000 km' },
    { label: 'Filtro de aire', status: 'ok', detail: 'En ~4,770 km' },
  ],
  'T-02': [
    { label: 'Cambio aceite', status: 'ok', detail: 'En ~1,900 km' },
    { label: 'Filtro diesel', status: 'soon', detail: 'En ~2,100 km' },
    { label: 'Calibración inyectores', status: 'ok', detail: 'En ~21,900 km' },
  ],
  'T-03': [
    { label: 'Cambio aceite', status: 'urgent', detail: 'VENCIDO (último hace 5,200 km, intervalo 5,000)' },
    { label: 'Bujías', status: 'urgent', detail: 'VENCIDAS (112,400 km, cambio recomendado a 90,000)' },
    { label: 'Correa de distribución', status: 'ok', detail: 'En ~7,600 km' },
  ],
  'T-04': [
    { label: 'Cambio aceite', status: 'ok', detail: 'En ~6,500 km' },
    { label: 'Frenos traseros', status: 'soon', detail: 'En ~3,200 km' },
    { label: 'Filtro de aire', status: 'ok', detail: 'En ~9,500 km' },
  ],
  'T-05': [
    { label: 'Cambio aceite', status: 'ok', detail: 'En ~3,200 km' },
    { label: 'Revisión suspensión', status: 'ok', detail: 'En ~14,800 km' },
    { label: 'Filtro de combustible', status: 'ok', detail: 'En ~4,800 km' },
  ],
};

// ─── AI Chat Responses ─── //
function getAIResponse(vehicleId: string, vehicleName: string, query: string): string {
  const q = query.toLowerCase();
  const specs = VEHICLE_SPECS[vehicleId];

  if (q.includes('aceite')) {
    return `Para el ${vehicleName} con motor ${specs.motor}:\n\nTipo de aceite recomendado: ${specs.tipoAceite}\nCapacidad: ${specs.capacidadAceite}\nFiltro: ${specs.filtroAceite}\nIntervalo: ${specs.intervaloAceite}\n\nEn clima tropical como República Dominicana, se recomienda usar aceite de alta calidad para proteger contra la oxidación acelerada por la humedad. Marcas recomendadas: Mobil 1, Castrol Edge, o Valvoline. Costo estimado del servicio completo en RD: RD$2,500 - RD$4,800 dependiendo de la marca.`;
  }
  if (q.includes('frenos') || q.includes('freno')) {
    return `Para ${vehicleName} revisar pastillas cada 30,000 km. Grosor mínimo aceptable: 3mm. Los discos deben tener un mínimo de 22mm de grosor y sin grietas visibles. En conducción urbana en Santo Domingo, el desgaste puede ser mayor por el tráfico constante. Costo en RD: RD$2,400 - RD$5,800 el par de pastillas. Si incluye rectificación de discos: RD$4,500 - RD$8,200.`;
  }
  if (q.includes('correa') || q.includes('distribución') || q.includes('distribucion')) {
    if (vehicleId === 'T-01' || vehicleId === 'T-04') {
      return `El ${vehicleName} utiliza cadena de distribución, no correa. Las cadenas tienen una vida útil mucho mayor (200,000-300,000 km) y normalmente no requieren reemplazo programado. Sin embargo, escuchar ruidos de cascabeleo al encender en frío puede indicar tensores desgastados. Revisar cada 100,000 km.`;
    }
    return `Para el ${vehicleName} con motor ${specs.motor}: La correa de distribución debe reemplazarse cada 100,000 km o 5 años, lo que ocurra primero. IMPORTANTE: Este motor es de interferencia, lo que significa que si la correa se rompe, las válvulas pueden golpear los pistones causando daño catastrófico. Costo del kit completo (correa + tensores + bomba de agua) en RD: RD$8,500 - RD$15,000.`;
  }
  if (q.includes('batería') || q.includes('bateria')) {
    return `La batería del ${vehicleName} tiene vida útil de 3-5 años en clima tropical. En República Dominicana, las altas temperaturas aceleran la degradación. Señales de batería débil: arranque lento, luces tenues, electrónica errática. Voltaje normal: 12.4-12.7V con motor apagado, 13.7-14.7V con motor encendido. Marcas recomendadas: LTH, AC Delco, Bosch. Costo en RD: RD$3,500 - RD$7,500 según capacidad (CCA).`;
  }

  return `Análisis del ${vehicleName} (${specs.motor}):\n\nEste vehículo cuenta con un motor ${specs.motor} que desarrolla ${specs.potencia}. Utiliza ${specs.combustible} y tiene una transmisión ${specs.transmision}.\n\nCapacidad de tanque: ${specs.tanque}\nPeso: ${specs.peso}\n\nPara mantener este vehículo en óptimas condiciones en el clima tropical de RD, recomiendo:\n1. Cambios de aceite puntuales (${specs.intervaloAceite})\n2. Revisión del sistema de enfriamiento cada 6 meses\n3. Inspección de frenos cada 15,000 km\n4. Alineación y balanceo cada 10,000 km\n\n¿Tiene alguna pregunta específica sobre mantenimiento?`;
}

const STATUS_COLORS = {
  urgent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'URGENTE' },
  soon: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', label: 'PRÓXIMO' },
  ok: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', label: 'OK' },
};

export default function IAPage() {
  const { fleet } = useFleet();
  const [selectedId, setSelectedId] = useState('T-01');
  const [expandedDtc, setExpandedDtc] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedVehicle = useMemo(() =>
    fleet.vehicles.find(v => v.id === selectedId) || fleet.vehicles[0],
    [fleet.vehicles, selectedId]
  );

  const specs = VEHICLE_SPECS[selectedId];
  const maintenance = MAINTENANCE_DATA[selectedId] || [];
  const dtcAnalysis = DTC_AI_ANALYSIS[selectedId] || {};

  // Typing effect
  const startTyping = useCallback((text: string) => {
    setChatResponse('');
    setIsTyping(true);
    let i = 0;

    if (typingRef.current) clearInterval(typingRef.current);

    typingRef.current = setInterval(() => {
      if (i < text.length) {
        setChatResponse(prev => prev + text[i]);
        i++;
      } else {
        if (typingRef.current) clearInterval(typingRef.current);
        setIsTyping(false);
      }
    }, 20);
  }, []);

  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, []);

  const handleSendQuery = () => {
    if (!chatInput.trim() || isTyping) return;
    const response = getAIResponse(selectedId, selectedVehicle.name, chatInput);
    startTyping(response);
    setChatInput('');
  };

  // Reset chat when vehicle changes
  useEffect(() => {
    setChatResponse('');
    setExpandedDtc(null);
    if (typingRef.current) clearInterval(typingRef.current);
    setIsTyping(false);
  }, [selectedId]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ─── LEFT COLUMN (35%): Vehicle Selector + Tech Sheet ─── */}
      <div className="w-[35%] flex flex-col border-r border-[var(--color-border-glass)] overflow-y-auto custom-scrollbar p-4 gap-4">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="w-5 h-5 text-[var(--color-accent-blue)]" />
          <h1 className="font-semibold text-base text-[var(--color-text-primary)]">Asistente IA</h1>
        </div>

        {/* Vehicle selector cards */}
        <div className="flex flex-col gap-2">
          {fleet.vehicles.map((v, index) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedId(v.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selectedId === v.id
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'bg-[var(--color-surface-glass)]/30 border-[var(--color-border-glass)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${v.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{v.name}</h3>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-mono">{v.plate}</p>
              </div>
              {v.obd.dtcCodes.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  {v.obd.dtcCodes.length} DTC
                </span>
              )}
              <ChevronRight className={`w-3.5 h-3.5 transition-colors ${selectedId === v.id ? 'text-blue-400' : 'text-[var(--color-text-secondary)]'}`} />
            </motion.button>
          ))}
        </div>

        {/* Tech Sheet */}
        {specs && (
          <motion.div
            key={selectedId + '-specs'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Ficha Técnica</h2>
              <div className="flex items-center gap-1 text-[9px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                <BadgeCheck className="w-3 h-3" /> Verificado
              </div>
            </div>

            {/* VIN */}
            <div className="mb-3 p-2 rounded-lg bg-[var(--color-surface-hover)]/50">
              <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wider">VIN</span>
              <p className="text-xs font-mono font-bold text-[var(--color-text-primary)]">{selectedVehicle.vin}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                ['Motor', specs.motor],
                ['Potencia', specs.potencia],
                ['Combustible', specs.combustible],
                ['Transmisión', specs.transmision],
                ['Tanque', specs.tanque],
                ['Int. Aceite', specs.intervaloAceite],
                ['Tipo Aceite', specs.tipoAceite],
                ['Filtro', specs.filtroAceite],
                ['Cap. Aceite', specs.capacidadAceite],
                ['Peso', specs.peso],
              ].map(([label, value]) => (
                <div key={label} className="py-1">
                  <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wider block">{label}</span>
                  <span className="text-[11px] text-[var(--color-text-primary)] font-medium">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── RIGHT COLUMN (65%): AI Analysis Panel ─── */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 gap-4">

        {/* Section 1: Vehicle Status Mini-Dashboard */}
        <motion.div
          key={selectedId + '-status'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Estado del Vehículo
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-[var(--color-text-secondary)]">RPM</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{selectedVehicle.obd.rpm.toLocaleString()}</span>
            </div>
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] text-[var(--color-text-secondary)]">Temp. Motor</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{selectedVehicle.obd.engineTemp}°C</span>
            </div>
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-[var(--color-text-secondary)]">Combustible</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{Math.round(selectedVehicle.obd.fuelLevel)}%</span>
            </div>
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Car className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-[var(--color-text-secondary)]">Odómetro</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{Math.round(selectedVehicle.obd.odometer).toLocaleString()}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] ml-1">km</span>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Active OBD Codes */}
        <motion.div
          key={selectedId + '-dtc'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Códigos OBD Activos
          </h2>

          {selectedVehicle.obd.dtcCodes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedVehicle.obd.dtcCodes.map(code => {
                const isExpanded = expandedDtc === code;
                const analysis = dtcAnalysis[code];

                return (
                  <div key={code} className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedDtc(isExpanded ? null : code)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-surface-hover)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-mono font-bold text-red-400">{code}</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {code === 'P0171' ? 'Mezcla pobre' : code === 'P0301' ? 'Fallo cilindro 1' : code === 'P0420' ? 'Catalizador deficiente' : code === 'P0455' ? 'Fuga EVAP grande' : code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Sparkles className="w-3 h-3 inline mr-0.5" />Análisis IA
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && analysis && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border-glass)]/50">
                            <div className="flex items-start gap-2 mt-2">
                              <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                                {analysis}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-green-400 font-medium">Sin códigos OBD activos</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">Todos los sistemas operan dentro de parámetros normales.</p>
            </div>
          )}
        </motion.div>

        {/* Section 3: Predictive Maintenance */}
        <motion.div
          key={selectedId + '-maint'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> Próximos Mantenimientos
          </h2>
          <div className="flex flex-col gap-2">
            {maintenance.map((item, i) => {
              const st = STATUS_COLORS[item.status];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${st.border} ${st.bg}`}
                >
                  <div className={`text-xs font-bold px-2 py-0.5 rounded ${st.bg} ${st.text} border ${st.border}`}>
                    {st.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{item.label}</span>
                    <p className="text-[10px] text-[var(--color-text-secondary)] truncate">{item.detail}</p>
                  </div>
                  <Clock className={`w-3.5 h-3.5 ${st.text} shrink-0`} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Section 4: AI Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-4 flex flex-col"
        >
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Consulta Libre al Asistente IA
          </h2>

          {/* Response area */}
          {chatResponse && (
            <div className="mb-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-purple-500/10">
              <div className="flex items-start gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                  {chatResponse}
                  {isTyping && <span className="inline-block w-1.5 h-3.5 bg-purple-400 animate-pulse ml-0.5 rounded-sm" />}
                </p>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ej: ¿Cuándo debo cambiar la correa de distribución?"
              className="search-input flex-1 text-sm"
              disabled={isTyping}
            />
            <button
              onClick={handleSendQuery}
              disabled={isTyping || !chatInput.trim()}
              className="glass-button p-2.5 text-purple-400 hover:bg-purple-500/10 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div ref={chatEndRef} />
        </motion.div>
      </div>
    </div>
  );
}

