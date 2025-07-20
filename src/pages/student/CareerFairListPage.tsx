import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Building, Users, MapPin, Clock, ChevronRight } from 'lucide-react';
import { careerFairService } from '../../services/careerFairService';
import type { FrontendCareerFair } from '../../types/components';
import { colors, componentStyles, typography, layout } from '../../lib/design-system';

export function CareerFairListPage() {
  const [fairs, setFairs] = useState<FrontendCareerFair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFairs();
  }, []);

  const fetchFairs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await careerFairService.getFairs();
      console.log('Career fairs API response:', response);
      if (response && Array.isArray(response.results)) {
        setFairs(response.results);
      } else {
        setError('Unexpected API response format.');
        setFairs([]);
      }
    } catch (err: any) {
      console.error('Error fetching career fairs:', err);
      setError('Failed to load career fairs. ' + (err?.message || ''));
      setFairs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className={`bg-white border-b border-gray-100 mb-6`}>
        <div className={`${layout.container} py-12`}>
          <div className="mb-4">
            <h1 className={`text-4xl font-bold text-gray-900 mb-3`}>Career Fairs</h1>
            <p className="text-lg text-gray-600">Discover upcoming virtual career fairs and connect with top employers</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
            <div className="flex items-center space-x-4">
              <div className={`${componentStyles.badge.base} ${componentStyles.badge.variants.indigo} flex items-center`}>
                <Calendar className="h-4 w-4 mr-2" />
                {fairs.length} Upcoming Events
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={layout.container}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600">Loading career fairs...</p>
          </div>
        ) : error ? (
          <div className={`${componentStyles.card.base} p-6 text-center`}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className={`${typography.fontSize.xl} font-semibold text-gray-900 mb-2`}>Error Loading Career Fairs</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchFairs}
              className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary}`}
            >
              Try Again
            </button>
          </div>
        ) : fairs.length === 0 ? (
          <div className={`${componentStyles.card.base} p-8 text-center`}>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`${typography.fontSize.xl} font-semibold text-gray-900 mb-2`}>No Upcoming Career Fairs</h3>
            <p className="text-gray-600">Check back later for upcoming events or contact your university career center for more information.</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {fairs.map(fair => (
              <motion.div key={fair.id} variants={item}>
                <Link to={`/student/career-fairs/${fair.id}`}>
                  <div className={`${componentStyles.card.base} ${componentStyles.card.hover} h-full flex flex-col overflow-hidden`}>
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={fair.banner_image_url || '/placeholder.svg'} 
                        alt={fair.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="flex items-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-indigo-700 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(fair.start_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={componentStyles.card.body}>
                      <h3 className={`${typography.fontSize.lg} font-semibold text-gray-900 mb-2 line-clamp-2`}>
                        {fair.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {fair.description}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" /> 
                          <span>
                            {formatDate(fair.start_date)} - {formatDate(fair.end_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-gray-400" /> 
                          <span>
                            {fair.booths?.length || 0} participating companies
                          </span>
                        </div>
                        
                        {fair.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" /> 
                            <span>{fair.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`${componentStyles.card.footer} flex items-center justify-between`}>
                      <span className="text-xs text-gray-500">
                        {fair.location?.toLowerCase().includes('virtual') ? 'Virtual Event' : 'In-Person Event'}
                      </span>
                      <span className="text-sm text-indigo-600 font-medium flex items-center group">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 