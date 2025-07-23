import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, Edit, Trash2, Search, Filter, Crown } from 'lucide-react';
import api from '../../lib/axios';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_company_admin: boolean;
  status: string;
  joined_date: string;
  profile_picture_url?: string;
}

export function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const res = await api.get('/employer/team-members/');
        setTeamMembers(res.data);
      } catch {
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role.toLowerCase().includes(selectedRole.replace('_', ''));
    return matchesSearch && matchesRole;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="mt-1 text-gray-500">Manage team access and permissions</p>
          </div>
          {/* Add Team Member button removed as feature is not implemented */}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="hiring manager">Hiring Manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="interviewer">Interviewer</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading team members...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No team members found.</div>
        ) : filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-100 rounded-lg relative">
                  {member.profile_picture_url ? (
                    <img src={member.profile_picture_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-indigo-600" />
                  )}
                  {member.is_company_admin && (
                    <Crown className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400" title="Company Admin" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    {member.name}
                    {member.is_company_admin && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Admin</span>
                    )}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{member.email}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{member.role}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">Joined: {new Date(member.joined_date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : member.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedMember(member)}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg"
                  title="Edit Member"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {}}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                  title="Remove Member"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            {selectedMember?.id === member.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={member.role}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      disabled
                    >
                      <option>Hiring Manager</option>
                      <option>Recruiter</option>
                      <option>Interviewer</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}