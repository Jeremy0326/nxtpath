import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, Edit, Trash2, Search, Filter, Crown, Building, Calendar, Clock } from 'lucide-react';
import { universityService, StaffMember } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';
import { StaffProfileModal } from '../../components/university/StaffProfileModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export function Staff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const data = await universityService.getStaff();
        setStaffMembers(data);
      } catch (err) {
        setError('Failed to load staff members');
        addToast({
          title: 'Error',
          description: 'Failed to load staff members.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [addToast]);

  const filteredMembers = staffMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role.toLowerCase().includes(selectedRole.replace('_', ''));
    return matchesSearch && matchesRole;
  });

  const handleViewProfile = (member: StaffMember) => {
    setSelectedMember(member);
    setShowProfileModal(true);
  };

  const handleAddStaff = () => {
    addToast({
      title: 'Add Staff',
      description: 'Staff management feature coming soon.',
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Never') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString || dateString === 'Never') return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Directory</h1>
              <p className="mt-1 text-gray-500 text-lg">Manage and view all staff members in your university</p>
            </div>
            <Button 
              onClick={handleAddStaff}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 text-lg font-semibold shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Staff
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg"
              >
                <option value="all">All Roles</option>
                <option value="career advisor">Career Advisor</option>
                <option value="professor">Professor</option>
                <option value="administrator">Administrator</option>
                <option value="coordinator">Coordinator</option>
              </select>
              <Button variant="outline" className="text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-3 text-lg">
                <Filter className="h-5 w-5 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Members List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center text-gray-500 py-12 text-lg">Loading staff members...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12 text-lg">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg">No staff members found.</div>
        ) : filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-100 rounded-2xl relative shadow-md">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-1">{member.name}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-base text-gray-700">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="text-base text-gray-700">{member.role}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-base text-gray-700">Joined: {formatDate(member.joinedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Badge variant="outline" className="text-green-600 border-green-600 px-4 py-2 text-lg rounded-xl">Active</Badge>
              <button
                onClick={() => handleViewProfile(member)}
                className="p-3 text-gray-400 hover:text-indigo-600 rounded-xl border border-gray-200 bg-white transition-colors"
                title="View Profile"
              >
                <Edit className="h-6 w-6" />
              </button>
              <button
                onClick={() => {}}
                className="p-3 text-gray-400 hover:text-red-600 rounded-xl border border-gray-200 bg-white transition-colors"
                title="Remove Staff"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Staff Profile Modal */}
      <StaffProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        staff={selectedMember}
      />
    </motion.div>
  );
} 