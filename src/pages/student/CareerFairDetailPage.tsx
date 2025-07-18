import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Search, Map } from 'lucide-react';
import { careerFairService } from '../../services/careerFairService';
import { CareerFair, Booth } from '../../types/career-fair';
import { JobCard } from '../../components/jobs/JobCard';
import { FloorPlan } from '../../components/career-fair/FloorPlan';

export function CareerFairDetailPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const [fair, setFair] = useState<CareerFair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (fairId) {
      fetchFairDetails();
    }
  }, [fairId]);

  const fetchFairDetails = async () => {
    try {
      setIsLoading(true);
      const response = await careerFairService.getFairDetails(fairId!);
      setFair(response);
    } catch (err) {
      setError('Failed to load career fair details.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooths = fair?.booths.filter(booth => 
    booth.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!fair) return <div className="p-8 text-center text-gray-500">Career fair not found.</div>;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/student/career-fairs" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Fairs
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900">{fair.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{fair.description}</p>
        </div>

        {fair.floor_plan_url && (
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Floor Plan</h2>
                <FloorPlan fair={fair} />
            </div>
        )}

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooths?.map(booth => (
            <motion.div key={booth.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <img src={booth.company.logo_url || 'https://via.placeholder.com/150'} alt={booth.company.name} className="h-16 w-16 rounded-full object-contain mr-4" />
                <div>
                  <h2 className="text-2xl font-bold">{booth.company.name}</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm h-20 overflow-hidden">{booth.company.description}</p>
              <h3 className="text-lg font-semibold mb-2">Featured Jobs</h3>
              <div className="space-y-4">
                {booth.jobs.slice(0, 2).map(job => (
                  <JobCard job={job} key={job.id} />
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Register Interest
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 