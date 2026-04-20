"use client";

import { useEffect, useRef, useMemo } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VehicleMarker } from './VehicleMarker';
import { Vehicle } from '../hooks/useFleet';
import { Battery, Crosshair, Navigation, Target, X } from 'lucide-react';
import { useTheme } from 'next-themes';

/**
 * NOTA: Para obtener un token gratuito de Mapbox:
 * 1. Regístrate en https://mapbox.com
 * 2. Crea un Access Token público.
 * 3. Añádelo a tu archivo .env.local como NEXT_PUBLIC_MAPBOX_TOKEN.
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type FleetMapProps = {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  followVehicle: boolean;
  onSelectVehicle: (id: string | null) => void;
  onToggleFollow: () => void;
  onCenterFleet: (map: any) => void;
};

export function FleetMap({ 
  vehicles, 
  selectedVehicleId, 
  followVehicle, 
  onSelectVehicle, 
  onToggleFollow,
  onCenterFleet
}: FleetMapProps) {
  const mapRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const mapStyle = resolvedTheme === 'dark'
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  const selectedVehicle = useMemo(() => 
    vehicles.find(v => v.id === selectedVehicleId), 
    [vehicles, selectedVehicleId]
  );

  // Auto-follow logic
  useEffect(() => {
    if (followVehicle && selectedVehicle && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedVehicle.lng, selectedVehicle.lat],
        duration: 1000,
        essential: true
      });
    }
  }, [selectedVehicle?.lat, selectedVehicle?.lng, followVehicle]);

  // Route GeoJSON
  const routeData = useMemo(() => {
    if (!selectedVehicle || selectedVehicle.path.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: selectedVehicle.path.map(p => [p.lng, p.lat])
      }
    };
  }, [selectedVehicle?.path]);

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -69.9312,
          latitude: 18.4861,
          zoom: 13
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        cursor="auto"
      >
        <NavigationControl position="bottom-right" />

        {/* Selected Vehicle Route */}
        {routeData && (
          <Source id="route" type="geojson" data={routeData}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#06B6D4',
                'line-width': 2,
                'line-opacity': 0.6
              }}
              layout={{
                'line-cap': 'round',
                'line-join': 'round'
              }}
            />
          </Source>
        )}

        {/* Vehicle Markers */}
        {vehicles.map(v => (
          <VehicleMarker
            key={v.id}
            vehicle={v}
            isSelected={v.id === selectedVehicleId}
            onClick={onSelectVehicle}
          />
        ))}

        {/* Selected Vehicle Popup */}
        {selectedVehicle && (
          <Popup
            latitude={selectedVehicle.lat}
            longitude={selectedVehicle.lng}
            offset={25}
            closeOnClick={false}
            onClose={() => onSelectVehicle(null)}
            anchor="top"
            className="custom-popup"
          >
            <div className="glass-panel p-3 min-w-[200px] border-0 backdrop-blur-2xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{selectedVehicle.name}</h3>
                  <p className="text-[10px] text-[var(--color-text-secondary)] font-mono italic">{selectedVehicle.plate}</p>
                </div>
                <button 
                  onClick={() => onSelectVehicle(null)}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-none">Velocidad</p>
                    <p className="text-xs font-mono font-bold text-[var(--color-accent-blue)]">{selectedVehicle.speed} km/h</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Battery className={`w-4 h-4 ${selectedVehicle.battery < 30 ? 'text-red-400' : 'text-green-400'}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-none">Batería</p>
                    <p className="text-xs font-mono font-bold text-[var(--color-accent-green)]">{selectedVehicle.battery}%</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border-glass)]">
                  <p className="text-[9px] text-[var(--color-text-secondary)] font-mono">
                    {selectedVehicle.lat.toFixed(6)}, {selectedVehicle.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button 
          onClick={() => onCenterFleet(mapRef.current)}
          className="glass-button"
        >
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="text-xs">Centrar Flota</span>
        </button>

        <button 
          onClick={onToggleFollow}
          className={`glass-button ${followVehicle ? 'border-cyan-500/50 bg-cyan-500/10' : ''}`}
        >
          <Crosshair className={`w-4 h-4 ${followVehicle ? 'text-cyan-400 zoom-in' : 'text-gray-400'}`} />
          <span className="text-xs">{followVehicle ? 'Siguiendo...' : 'Seguir Vehículo'}</span>
        </button>
      </div>

      <style jsx global>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px;
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(6, 182, 212, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
