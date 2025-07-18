import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, Users, Info, Navigation, X } from 'lucide-react';

interface MapLocation {
  id: string;
  type: 'booth' | 'entrance' | 'exit' | 'restroom' | 'refreshment' | 'info';
  name: string;
  position: { x: number; y: number };
  status?: 'available' | 'busy' | 'visited';
  company?: {
    name: string;
    logo?: string;
  };
}

interface PhysicalFairMapProps {
  locations: MapLocation[];
  selectedLocation: string | null;
  userPosition?: { x: number; y: number };
  onLocationSelect: (locationId: string) => void;
  onNavigateTo?: (locationId: string) => void;
}

export function PhysicalFairMap({
  locations,
  selectedLocation,
  userPosition,
  onLocationSelect,
  onNavigateTo
}: PhysicalFairMapProps) {
  const [showLegend, setShowLegend] = useState(true);

  const getLocationIcon = (type: MapLocation['type']) => {
    switch (type) {
      case 'booth':
        return Building;
      case 'entrance':
      case 'exit':
        return Navigation;
      case 'restroom':
        return Users;
      case 'refreshment':
        return Users;
      case 'info':
        return Info;
      default:
        return MapPin;
    }
  };

  const getLocationColor = (location: MapLocation) => {
    if (location.type !== 'booth') {
      return 'bg-gray-100 text-gray-600';
    }
    
    if (location.status === 'available') {
      return 'bg-green-100 text-green-600';
    } else if (location.status === 'busy') {
      return 'bg-yellow-100 text-yellow-600';
    } else if (location.status === 'visited') {
      return 'bg-indigo-100 text-indigo-600';
    }
    
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Map Grid */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundSize: '40px 40px', 
          backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)' 
        }} 
      />

      {/* Map Locations */}
      {locations.map((location) => {
        const Icon = getLocationIcon(location.type);
        const colorClass = getLocationColor(location);
        
        return (
          <motion.div
            key={location.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: selectedLocation === location.id ? 1.1 : 1,
              opacity: 1,
            }}
            className={`absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              selectedLocation === location.id ? 'z-10' : 'z-0'
            }`}
            style={{
              left: `${location.position.x}%`,
              top: `${location.position.y}%`,
            }}
            onClick={() => onLocationSelect(location.id)}
          >
            <div className={`w-full h-full rounded-lg ${
              selectedLocation === location.id
                ? 'ring-2 ring-indigo-500 shadow-lg'
                : 'hover:ring-2 hover:ring-indigo-300'
            }`}>
              <div className="absolute inset-0 bg-white rounded-lg p-2 flex flex-col items-center justify-center">
                {location.type === 'booth' && location.company?.logo ? (
                  <img
                    src={location.company.logo}
                    alt={location.company.name}
                    className="w-8 h-8 rounded object-cover mb-1"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center mb-1`}>
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                <span className="text-xs font-medium text-gray-900 text-center">
                  {location.type === 'booth' ? `Booth ${location.name}` : location.name}
                </span>
                {location.type === 'booth' && location.company && (
                  <span className="text-xs text-gray-500 text-center truncate w-full">
                    {location.company.name}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* User Position */}
      {userPosition && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${userPosition.x}%`,
            top: `${userPosition.y}%`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">You</span>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-medium text-gray-900">Map Legend</h4>
            <button 
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Available Booths</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Busy Booths</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></div>
              <span>Visited Booths</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span>Facilities</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}