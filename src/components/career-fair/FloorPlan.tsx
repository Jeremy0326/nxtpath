import React from 'react';
import { motion } from 'framer-motion';
import { CareerFair, Booth } from '../../types/career-fair';

interface FloorPlanProps {
  fair: CareerFair;
}

export function FloorPlan({ fair }: FloorPlanProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div 
        className="relative grid gap-1" 
        style={{ 
          gridTemplateColumns: `repeat(${fair.grid_width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${fair.grid_height}, minmax(0, 1fr))`
        }}
      >
        {/* Render grid cells for visualization */}
        {Array.from({ length: fair.grid_width * fair.grid_height }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-sm" />
        ))}
        
        {/* Render booths on top of the grid */}
        {fair.booths.map(booth => (
          <motion.div
            key={booth.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              gridColumnStart: booth.x + 1,
              gridRowStart: booth.y + 1,
              gridColumnEnd: `span ${booth.width}`,
              gridRowEnd: `span ${booth.height}`,
            }}
            className="absolute flex items-center justify-center bg-white rounded-lg shadow-md p-2 border-2 border-indigo-500"
          >
            <div className="text-center">
                <img src={booth.company.logo_url || 'https://via.placeholder.com/50'} alt={booth.company.name} className="h-10 w-10 rounded-full object-contain mx-auto mb-2"/>
                <p className="text-xs font-bold">{booth.label}</p>
                <p className="text-xs text-gray-600">{booth.company.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 