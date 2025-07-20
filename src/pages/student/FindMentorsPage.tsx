import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, MapPin, Search, Users, GraduationCap, Clock, Building, ExternalLink } from 'lucide-react';
import api from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { colors, componentStyles, typography, layout } from '../../lib/design-system';

interface UniversityStaff {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    profile_picture_url?: string;
  };
  university: {
    id: string;
    name: string;
    location?: string;
  };
  role: string;
  created_at: string;
}

export function FindMentorsPage() {
  const [staff, setStaff] = useState<UniversityStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const { addToast } = useToast();

  useEffect(() => {
    fetchUniversityStaff();
  }, []);

  const fetchUniversityStaff = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/accounts/university-staff/');
      setStaff(response.data.results || response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch university staff:', err);
      setError('Failed to load mentors. Please try again.');
      addToast({
        title: 'Error',
        description: 'Failed to load mentors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    // Add null checks to prevent undefined errors
    const fullName = member?.user?.full_name || '';
    const role = member?.role || '';
    const universityName = member?.university?.name || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         universityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUniversity = selectedUniversity === 'all' || member?.university?.id === selectedUniversity;
    return matchesSearch && matchesUniversity;
  });

  // Deduplicate universities by id
  const universitiesMap = new Map();
  staff.forEach(member => {
    if (member.university && member.university.id) {
      universitiesMap.set(member.university.id, member.university);
    }
  });
  const universities = Array.from(universitiesMap.values());

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading mentors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h3 className={`${typography.fontSize.xl} font-semibold text-red-800 mb-2`}>Unable to Load Mentors</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={fetchUniversityStaff}
            className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary}`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50/50"
    >
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className={`${layout.container} py-12`}>
          <div className="mb-4">
            <h1 className={`text-4xl font-bold text-gray-900 mb-3`}>Find Mentors</h1>
            <p className="text-lg text-gray-600">Connect with university staff and career advisors for personalized guidance</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
            <div className="flex items-center space-x-4">
              <div className={`${componentStyles.badge.base} ${componentStyles.badge.variants.indigo} flex items-center`}>
                <Users className="h-4 w-4 mr-2" />
                {staff.length} Mentors Available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={layout.container}>
        {/* Search and Filter */}
        <div className={`${componentStyles.card.base} mb-8`}>
          <div className={componentStyles.card.body}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search mentors by name, role, or university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg ${componentStyles.form.input}`}
                  />
                </div>
              </div>
              <div className="lg:w-80">
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${componentStyles.form.input}`}
                >
                  <option value="all">All Universities</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredStaff.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{staff.length}</span> mentors
          </p>
        </div>

        {/* Mentors Grid */}
        {filteredStaff.length === 0 ? (
          <div className={`${componentStyles.card.base} p-8 text-center`}>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className={`${typography.fontSize.xl} font-semibold text-gray-900 mb-2`}>No Mentors Found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or select a different university.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStaff.map((member) => (
              <motion.div
                key={member.user?.id}
                variants={item}
                className={`${componentStyles.card.base} ${componentStyles.card.hover} p-6`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {member.user?.profile_picture_url ? (
                      <img
                        src={member.user.profile_picture_url}
                        alt={member.user.full_name || 'Mentor'}
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-gray-100">
                        <GraduationCap className="h-10 w-10 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`${typography.fontSize.lg} font-semibold text-gray-900 truncate`}>
                      {member.user?.full_name || 'Unknown Mentor'}
                    </h3>
                    <div className="mt-1">
                      <span className={`${componentStyles.badge.base} ${componentStyles.badge.variants.indigo} inline-block`}>
                        {member.role || 'Staff Member'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate font-medium">{member.university?.name || 'Unknown University'}</span>
                      </div>
                      {member.university?.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{member.university.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  {member.user?.email && (
                    <a
                      href={`mailto:${member.user.email}`}
                      className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} w-full ${componentStyles.button.variants.primary} flex items-center justify-center`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">Contact Mentor</span>
                    </a>
                  )}
                  
                  <div className="flex items-center justify-center text-xs text-gray-500 mt-3">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>Available for mentoring</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 