"use client";

import { Marker } from 'react-map-gl/mapbox';
import { Navigation } from 'lucide-react';
import { Vehicle } from '../hooks/useFleet';

type VehicleMarkerProps = {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: (id: string) => void;
};

export function VehicleMarker({ vehicle, isSelected, onClick }: VehicleMarkerProps) {
  const isOnline = vehicle.status === 'online';

  return (
    <>
      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .pulse-selected {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #06B6D4;
          animation: pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
      `}</style>
      
      <Marker
        latitude={vehicle.lat}
        longitude={vehicle.lng}
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          onClick(vehicle.id);
        }}
      >
        <div className="relative cursor-pointer group">
          {/* Selected Pulse Ring */}
          {isSelected && <div className="pulse-selected -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />}

          {/* Marker Body */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
            ${isSelected ? 'scale-110' : 'scale-100'}
            ${isOnline ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-gray-600'}
          `}>
            {/* Direction Arrow */}
            <div 
              className="transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${vehicle.heading}deg)` }}
            >
              <Navigation className="w-5 h-5 text-white fill-current" />
            </div>

            {/* Alert Indicator */}
            {vehicle.hasAlert && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#030712] animate-bounce" />
            )}
          </div>

          {/* Label (Visible on hover or if selected) */}
          <div className={`
            absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 
            glass-panel text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
            ${isSelected ? 'opacity-100' : ''}
          `}>
            {vehicle.name}
          </div>
        </div>
      </Marker>
    </>
  );
}
