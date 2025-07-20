import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, User, Briefcase, GraduationCap, School, ChevronRight, RefreshCw, Eye, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { employerService } from '../../services/employerService';
import type { FrontendStudentProfile } from '../../types/components';
import { CandidateProfileModal } from '../../components/employer/CandidateProfileModal';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';

const ORBIT_RADIUS = 250;
const ORBIT_DURATION = 50;

export function ResumeBank() {
  const [profiles, setProfiles] = useState<FrontendStudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<FrontendStudentProfile | null>(null);
  const [centralProfile, setCentralProfile] = useState<FrontendStudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
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

  const fetchConnections = useCallback(async () => {
    try {
      const response = await employerService.getConnections();
      setConnections(response);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
    fetchConnections();
  }, [fetchResumes, fetchConnections]);

  const handleViewProfile = (profile: FrontendStudentProfile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleSelectCentral = (profile: FrontendStudentProfile) => {
    setCentralProfile(profile);
  };

  const handleConnect = (profile: FrontendStudentProfile) => {
    setSelectedProfile(profile);
    setIsConnectModalOpen(true);
  };

  const handleSendConnection = async () => {
    if (!selectedProfile) return;
    
    try {
      setIsConnecting(true);
      await employerService.sendConnection(selectedProfile.user.id, connectMessage);
      addToast({
        title: 'Connection Sent',
        description: `Connection request sent to ${selectedProfile.user.full_name}`,
        variant: 'default',
      });
      setIsConnectModalOpen(false);
      setConnectMessage('');
      fetchConnections(); // Refresh connections
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to send connection request',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectionStatus = (studentId: string) => {
    const connection = connections.find(c => c.student === studentId);
    return connection?.status || null;
  };

  const orbitingProfiles = useMemo(() => {
    return profiles.filter(profile => profile.user.id !== centralProfile?.user.id);
  }, [profiles, centralProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading resume bank...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchResumes} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Bank</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover talented students and connect with potential candidates for your organization
            </p>
          </div>

          {/* Central Profile */}
          {centralProfile && (
            <div className="relative flex justify-center items-center mb-16">
              <div className="relative w-96 h-96 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
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
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">{centralProfile.user.full_name}</h2>
                    <p className="text-purple-600 font-medium">{centralProfile.major}</p>
                    <p className="text-gray-600 text-sm">
                      {typeof centralProfile.university === 'string' 
                        ? centralProfile.university 
                        : (centralProfile.university as any)?.name || 'University not specified'}
                    </p>
                    
                    {/* Connection Status */}
                    {(() => {
                      const status = getConnectionStatus(centralProfile.user.id);
                      if (status === 'PENDING') {
                        return (
                          <div className="mt-3 flex items-center text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">Connection Pending</span>
                          </div>
                        );
                      } else if (status === 'ACCEPTED') {
                        return (
                          <div className="mt-3 flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Connected</span>
                          </div>
                        );
                      } else if (status === 'REJECTED') {
                        return (
                          <div className="mt-3 flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Connection Rejected</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div className="mt-6 flex items-center space-x-3">
                      <Button 
                        onClick={() => handleViewProfile(centralProfile)}
                        className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      {(() => {
                        const status = getConnectionStatus(centralProfile.user.id);
                        if (!status) {
                          return (
                            <Button 
                              onClick={() => handleConnect(centralProfile)}
                              className="flex items-center px-6 py-2 bg-white border border-purple-200 text-purple-600 rounded-full hover:bg-purple-50 transition-all"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          );
                        } else if (status === 'PENDING') {
                          return (
                            <Button 
                              disabled
                              className="flex items-center px-6 py-2 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-full cursor-not-allowed"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Pending
                            </Button>
                          );
                        } else if (status === 'ACCEPTED') {
                          return (
                            <Button 
                              disabled
                              className="flex items-center px-6 py-2 bg-green-50 border border-green-200 text-green-600 rounded-full cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Connected
                            </Button>
                          );
                        } else if (status === 'REJECTED') {
                          return (
                            <Button 
                              disabled
                              className="flex items-center px-6 py-2 bg-red-50 border border-red-200 text-red-600 rounded-full cursor-not-allowed"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejected
                            </Button>
                          );
                        }
                        return null;
                      })()}
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
                      <div className="relative">
                        <img
                          src={profile.user.profile_picture_url || `https://i.pravatar.cc/150?u=${profile.user.id}`}
                          alt={profile.user.full_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/50 cursor-pointer shadow-md"
                        />
                        {/* Connection Status Indicator */}
                        {(() => {
                          const status = getConnectionStatus(profile.user.id);
                          if (status === 'PENDING') {
                            return (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                            );
                          } else if (status === 'ACCEPTED') {
                            return (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <CandidateProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={selectedProfile}
          context="resume-bank"
        />
      )}

      {/* Connect Modal */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect with {selectedProfile?.user.full_name}</DialogTitle>
            <DialogDescription>
              Send a connection request to this candidate. You can include a personalized message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Write a personalized message (optional)..."
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConnectModalOpen(false);
                  setConnectMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendConnection}
                disabled={isConnecting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}