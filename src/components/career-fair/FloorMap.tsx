import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Info, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Booth as ApiBooth } from '../../types/career-fair';

interface FloorMapProps {
  booths: any[];
  selectedBooth: string | null;
  onBoothClick: (boothId: string) => void;
  floorPlanUrl?: string | null;
}

export function FloorMap({ booths, selectedBooth, onBoothClick, floorPlanUrl }: FloorMapProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Reset position when booths change
  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    setZoom(1);
  }, [booths.length]);

  // Mouse/touch drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setDrag(d => ({ x: d.x + (e.clientX - lastPos.current.x), y: d.y + (e.clientY - lastPos.current.y) }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  
  const onMouseUp = () => { 
    dragging.current = false; 
  };

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    setDrag(d => ({ x: d.x + (e.touches[0].clientX - lastPos.current.x), y: d.y + (e.touches[0].clientY - lastPos.current.y) }));
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  
  const onTouchEnd = () => { 
    dragging.current = false; 
  };

  // Zoom handlers
  const onWheel = (e: React.WheelEvent) => {
    setZoom(z => Math.max(0.5, Math.min(2.5, z - e.deltaY * 0.001)));
  };
  
  const handleZoomIn = () => {
    setZoom(z => Math.min(2.5, z + 0.1));
  };
  
  const handleZoomOut = () => {
    setZoom(z => Math.max(0.5, z - 0.1));
  };
  
  const handleReset = () => {
    setDrag({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
          Floor Map
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            aria-label="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div
        ref={mapRef}
        className="relative w-full h-[400px] bg-gray-50 overflow-hidden touch-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        style={{ cursor: dragging.current ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        {/* Background grid pattern */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundSize: '40px 40px', 
            backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
            zIndex: 0,
          }} 
        />
        
        {/* Floor plan image if available */}
        {floorPlanUrl && (
          <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-30"
            style={{ 
              backgroundImage: `url(${floorPlanUrl})`,
              transform: `translate(${drag.x}px, ${drag.y}px) scale(${zoom})`,
              transition: dragging.current ? 'none' : 'transform 0.1s',
            }}
          />
        )}
        
        {/* Draggable/zoomable map area */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) scale(${zoom})`,
            transition: dragging.current ? 'none' : 'transform 0.1s',
            minWidth: 480,
            minHeight: 320,
          }}
        >
          {/* Booth elements */}
          {booths.map((booth) => (
            <motion.div
              key={booth.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: selectedBooth === booth.id ? 1.1 : 1,
                opacity: 1,
              }}
              transition={{ type: "spring", damping: 15 }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                selectedBooth === booth.id ? 'z-10' : 'z-0'
              }`}
              style={{
                left: `calc(${(booth.x / 12) * 100}% + 40px)`,
                top: `calc(${(booth.y / 8) * 100}% + 40px)`,
                width: `${booth.width * 10}px`,
                height: `${booth.height * 10}px`,
                minWidth: '80px',
                minHeight: '80px',
              }}
              onClick={() => onBoothClick(booth.id)}
              onMouseEnter={() => setShowTooltip(booth.id)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center bg-white shadow-md border transition-all duration-200 ${
                  selectedBooth === booth.id 
                    ? 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-lg'
                }`}
                style={{ padding: 4 }}
              >
                <img
                  src={booth.company.logo_url || '/placeholder.svg'}
                  alt={booth.company.name}
                  className="w-12 h-12 rounded object-contain mb-1.5"
                  style={{ objectFit: 'contain', background: '#f9fafb' }}
                  onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                {booth.booth_number && (
                  <span className="text-xs font-medium text-indigo-700 text-center truncate w-full px-1" style={{ lineHeight: 1.1 }}>
                    Booth {booth.booth_number}
                  </span>
                )}
                <span className="text-xs font-medium text-gray-700 text-center truncate w-full px-1" style={{ lineHeight: 1.1 }}>
                  {booth.company.name}
                </span>
              </div>
              
              {/* Tooltip */}
              {showTooltip === booth.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg p-3 z-20 shadow-lg">
                  <p className="font-medium text-sm">{booth.company.name}</p>
                  {booth.booth_number && <p className="text-indigo-200 mt-1">Booth {booth.booth_number}</p>}
                  {booth.jobs && booth.jobs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-300 mb-1">Open Positions:</p>
                      <ul className="list-disc list-inside text-xs text-gray-300">
                        {booth.jobs.slice(0, 3).map((job: any) => (
                          <li key={job.id} className="truncate">{job.title}</li>
                        ))}
                        {booth.jobs.length > 3 && <li className="text-indigo-300">+{booth.jobs.length - 3} more...</li>}
                      </ul>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900/90"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Map Legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs shadow-sm border border-gray-100">
          <div className="flex items-center space-x-1 mb-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span className="text-gray-600">Selected Booth</span>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            <span>Tip: Drag to move, scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}