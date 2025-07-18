import React from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, ExternalLink } from 'lucide-react';
import { Company as ApiCompany } from '../../types/job';

interface CompanyEvent {
  id: string;
  type: 'presentation' | 'interview' | 'networking';
  title: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
}

interface OpenPosition {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string[];
  matchScore?: number;
}

interface Company extends ApiCompany {
  boothNumber?: string;
  openPositions?: OpenPosition[];
  matchScore?: number;
  events?: CompanyEvent[];
}

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    logo: string;
    boothNumber?: string;
    description?: string;
    industry?: string;
    location?: string;
  };
  onClick: () => void;
}

export function CompanyCard({
  company,
  onClick,
}: CompanyCardProps) {
  return (
    <motion.div
      layout
      className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${company.name}`}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
      whileHover={{ y: -4 }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-white opacity-80"></div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Booth number badge */}
      {company.boothNumber && (
        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 text-white z-10 shadow-sm">
          Booth {company.boothNumber}
        </span>
      )}
      
      <div className="flex items-start space-x-4 relative z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img
            src={company.logo || '/placeholder.svg'}
            alt={company.name}
            className="relative w-16 h-16 rounded-lg object-contain border border-gray-100 bg-white shadow-sm p-1"
            onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{company.name}</h3>
          
          {company.industry && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Building className="w-4 h-4 mr-1.5 text-gray-400" />
              {company.industry}
            </div>
          )}
          
          {company.location && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              {company.location}
            </div>
          )}
          
          {company.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{company.description}</p>
          )}
          
          <div className="mt-3 text-xs text-indigo-600 font-medium flex items-center group-hover:text-indigo-800 transition-colors">
            <span className="relative">
              View details
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}