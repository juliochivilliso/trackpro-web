"use client";

import { useState, useEffect } from "react";
import { X, Car, Cpu, User, Check, Loader2 } from "lucide-react";

interface Equipment {
  id: number;
  code: string;
  name: string;
  status: string;
}

interface Driver {
  id: number;
  firstName: string;
  lastName: string;
}

interface RegisterVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRegister?: (data: {
    id: number; plate: string; make?: string; model?: string;
    year?: number; equipmentName?: string; driverId?: number;
  }) => void;
}

export default function RegisterVehicleModal({ isOpen, onClose, onSuccess, onRegister }: RegisterVehicleModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [formData, setFormData] = useState({
    vehicle: {
      plate: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
    },
    equipmentId: "",
    driverId: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const [eqRes, drRes] = await Promise.all([
        fetch(`${apiBase}/equipment`),
        fetch(`${apiBase}/drivers`),
      ]);
      const eqData = await eqRes.json();
      const drData = await drRes.json();
      setEquipment(eqData.filter((e: Equipment) => e.status === "AVAILABLE"));
      setDrivers(drData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiBase}/assignments/integrated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          equipmentId: parseInt(formData.equipmentId),
          driverId: formData.driverId ? parseInt(formData.driverId) : undefined,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const v = result.vehicle;
        const eq = result.assignment?.equipment;
        const dr = result.assignment?.driver;
        onRegister?.({
          id: v.id, plate: v.plate, make: v.make, model: v.model,
          year: v.year, equipmentName: eq?.name, driverId: dr?.id,
        });
        onSuccess();
        onClose();
      } else {
        alert("Error al registrar la unidad");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-glass)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-glass)] flex justify-between items-center bg-[var(--color-surface-hover)]/30">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Registrar Nueva Unidad</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Alta de vehículo y vinculación de GPS</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex px-6 py-4 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                step >= s ? "bg-blue-500" : "bg-[var(--color-border-glass)]"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-4 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Car className="w-5 h-5" />
                <span className="text-sm font-medium">Datos del Vehículo</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Placa *</label>
                  <input
                    type="text"
                    className="search-input w-full"
                    placeholder="BC-1234"
                    value={formData.vehicle.plate}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, plate: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">VIN / Chasis</label>
                  <input
                    type="text"
                    className="search-input w-full"
                    placeholder="17 dígitos..."
                    value={formData.vehicle.vin}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, vin: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Marca</label>
                  <input
                    type="text"
                    className="search-input w-full"
                    placeholder="Toyota"
                    value={formData.vehicle.make}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, make: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Modelo</label>
                  <input
                    type="text"
                    className="search-input w-full"
                    placeholder="Hilux"
                    value={formData.vehicle.model}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Cpu className="w-5 h-5" />
                <span className="text-sm font-medium">Asignación de Equipo GPS</span>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Seleccionar Equipo Disponible</label>
                {equipment.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {equipment.map((eq) => (
                      <button
                        key={eq.id}
                        onClick={() => setFormData({ ...formData, equipmentId: eq.id.toString() })}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          formData.equipmentId === eq.id.toString()
                            ? "bg-cyan-500/10 border-cyan-500/50"
                            : "bg-[var(--color-surface-hover)]/30 border-[var(--color-border-glass)] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{eq.name}</p>
                            <p className="text-[10px] font-mono text-[var(--color-text-secondary)]">{eq.code}</p>
                          </div>
                        </div>
                        {formData.equipmentId === eq.id.toString() && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-[var(--color-border-glass)] rounded-xl">
                    <p className="text-sm text-[var(--color-text-secondary)]">No hay equipos disponibles en inventario.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Asignación de Conductor (Opcional)</span>
              </div>
              <div className="space-y-3">
                {drivers.map((dr) => (
                  <button
                    key={dr.id}
                    onClick={() => setFormData({ ...formData, driverId: dr.id.toString() })}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all w-full ${
                      formData.driverId === dr.id.toString()
                        ? "bg-purple-500/10 border-purple-500/50"
                        : "bg-[var(--color-surface-hover)]/30 border-[var(--color-border-glass)] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">
                        {dr.firstName[0]}{dr.lastName[0]}
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{dr.firstName} {dr.lastName}</p>
                    </div>
                    {formData.driverId === dr.id.toString() && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                ))}
                <button
                  onClick={() => setFormData({ ...formData, driverId: "" })}
                  className={`flex items-center justify-center p-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-full`}
                >
                  Omitir conductor por ahora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-surface-hover)]/30 border-t border-[var(--color-border-glass)] flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
          >
            Anterior
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !formData.vehicle.plate || step === 2 && !formData.equipmentId}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Finalizar Registro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
