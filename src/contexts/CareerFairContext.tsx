import React, { createContext, useContext, useState } from 'react';

interface CareerFair {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  floorPlan: {
    booths: BoothLocation[];
    dimensions: { width: number; height: number };
  };
}

interface BoothLocation {
  id: string;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  companyId?: string;
  status: 'available' | 'reserved' | 'confirmed';
}

interface CareerFairContextType {
  currentFair: CareerFair | null;
  setCurrentFair: (fair: CareerFair | null) => void;
  booths: BoothLocation[];
  updateBooth: (boothId: string, updates: Partial<BoothLocation>) => void;
}

const CareerFairContext = createContext<CareerFairContextType | undefined>(undefined);

export function CareerFairProvider({ children }: { children: React.ReactNode }) {
  const [currentFair, setCurrentFair] = useState<CareerFair | null>(null);
  const [booths, setBooths] = useState<BoothLocation[]>([]);

  const updateBooth = (boothId: string, updates: Partial<BoothLocation>) => {
    setBooths(prevBooths => 
      prevBooths.map(booth => 
        booth.id === boothId ? { ...booth, ...updates } : booth
      )
    );
  };

  return (
    <CareerFairContext.Provider value={{ 
      currentFair, 
      setCurrentFair,
      booths,
      updateBooth
    }}>
      {children}
    </CareerFairContext.Provider>
  );
}

export function useCareerFair() {
  const context = useContext(CareerFairContext);
  if (!context) {
    throw new Error('useCareerFair must be used within a CareerFairProvider');
  }
  return context;
}