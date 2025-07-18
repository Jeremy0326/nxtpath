import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Building, Plus, Settings } from 'lucide-react';
import { careerFairService } from '../../services/careerFairService';
import { CareerFair } from '../../types/career-fair';

export function UniversityFairManagementPage() {
  const [fairs, setFairs] = useState<CareerFair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFairs();
  }, []);

  const fetchFairs = async () => {
    try {
      setIsLoading(true);
      // This will fetch all fairs, we'll need a university-specific endpoint later
      const response = await careerFairService.getFairs();
      setFairs(response.results);
    } catch (err) {
      setError('Failed to load career fairs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">University Fair Management</h1>
                <p className="text-md text-gray-600 mt-1">Create and manage your university's career fairs.</p>
            </div>
            <button className="flex items-center mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all">
                <Plus className="h-5 w-5 mr-2" />
                Create New Fair
            </button>
        </header>

        {isLoading ? (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : fairs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No career fairs have been created yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fairs.map(fair => (
                <motion.div
                  key={fair.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  <img src={fair.banner_image_url || 'https://via.placeholder.com/400x200'} alt={fair.title} className="w-full h-48 object-cover"/>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900">{fair.title}</h3>
                    <p className="text-sm text-gray-500">{fair.host_university.name}</p>
                    <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
                      <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-gray-400" /> {new Date(fair.start_date).toLocaleDateString()} - {new Date(fair.end_date).toLocaleDateString()}</div>
                      <div className="flex items-center"><Building className="h-4 w-4 mr-3 text-gray-400" /> {fair.booths.length} participating companies</div>
                    </div>
                  </div>
                   <div className="bg-gray-50/70 p-4 border-t flex justify-end">
                        <Link to={`/university/fairs/${fair.id}/manage`} className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            <Settings className="h-4 w-4 mr-2"/>
                            Manage Fair
                        </Link>
                   </div>
                </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 