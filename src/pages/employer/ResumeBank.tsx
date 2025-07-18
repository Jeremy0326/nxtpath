import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, User, Briefcase, GraduationCap, School, ChevronRight, RefreshCw, Eye } from 'lucide-react';
import { employerService } from '../../services/employerService';
import { StudentProfile } from '../../types/user';
import { CandidateProfileModal } from '../../components/employer/candidates/CandidateProfileModal';
import { useToast } from '../../hooks/useToast';

const ORBIT_RADIUS = 250;
const ORBIT_DURATION = 50;

export function ResumeBank() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [centralProfile, setCentralProfile] = useState<StudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch a larger random batch to simulate a bank
      const response = await employerService.searchResumes({ search: '' });
      // Get 7 random profiles for the orbit
      const randomProfiles = response.sort(() => 0.5 - Math.random()).slice(0, 7);
      setProfiles(randomProfiles);
      if (randomProfiles.length > 0) {
        setCentralProfile(randomProfiles[0]);
      }
    } catch (err) {
      setError('Failed to load resumes.');
      addToast({
        title: 'Error',
        description: 'Failed to load resumes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);
  
  const handleViewProfile = (profile: StudentProfile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };
  
  const handleSelectCentral = (profile: StudentProfile) => {
    setCentralProfile(profile);
  };
  
  const orbitingProfiles = useMemo(() => {
    if (!centralProfile) return [];
    return profiles.filter(p => p.user.id !== centralProfile.user.id);
  }, [profiles, centralProfile]);

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <header className="relative z-10 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Orbital Resume Explorer</h1>
            <p className="text-md text-gray-300 mt-1">Discover and connect with top talent.</p>
          </div>
          <button
            onClick={fetchResumes}
            className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Shuffle Candidates
          </button>
        </header>

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-white" /></div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-400">{error}</div>
        ) : !centralProfile ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">No candidates found.</div>
        ) : (
          <div className="relative flex items-center justify-center h-[calc(100vh-200px)]">
            {/* Orbit */}
            <motion.div className="absolute w-[500px] h-[500px] border-2 border-white/10 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ ease: "linear", duration: ORBIT_DURATION, repeat: Infinity }}
            />

            {/* Central Profile */}
            <AnimatePresence>
              <motion.div
                key={centralProfile.user.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 flex flex-col items-center"
              >
                <motion.img
                  src={centralProfile.user.profile_picture_url || `https://i.pravatar.cc/150?u=${centralProfile.user.id}`}
                  alt={centralProfile.user.full_name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                />
                <h2 className="mt-4 text-2xl font-bold">{centralProfile.user.full_name}</h2>
                <p className="text-purple-300">{centralProfile.major}</p>
                <div className="mt-4 flex items-center space-x-3">
                    <button 
                        onClick={() => handleViewProfile(centralProfile)}
                        className="flex items-center px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-all"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                    </button>
                    <button className="flex items-center px-6 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all">
                        <User className="h-4 w-4 mr-2" />
                        Connect
        </button>
      </div>
              </motion.div>
            </AnimatePresence>

            {/* Orbiting Profiles */}
            {orbitingProfiles.map((profile, i) => {
              const angle = (i / orbitingProfiles.length) * 2 * Math.PI;
              const x = ORBIT_RADIUS * Math.cos(angle);
              const y = ORBIT_RADIUS * Math.sin(angle);

              return (
                <motion.div
                  key={profile.user.id}
                  className="absolute"
                  initial={{ x: 0, y: 0, scale: 0 }}
                  animate={{
                    x, 
                    y,
                    scale: 1,
                  }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.2, zIndex: 20 }}
                  onClick={() => handleSelectCentral(profile)}
                >
                  <img
                    src={profile.user.profile_picture_url || `https://i.pravatar.cc/150?u=${profile.user.id}`}
                    alt={profile.user.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/50 cursor-pointer shadow-md"
          />
                </motion.div>
              );
            })}
        </div>
        )}
      </div>
      {selectedProfile && (
        <CandidateProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            profile={selectedProfile}
        />
      )}
    </>
  );
}