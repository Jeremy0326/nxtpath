import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Target, FileText, CheckCircle, Search, 
  Eye, FileText as FileTextIcon, GraduationCap, Calendar, Mail
} from 'lucide-react';
import { universityService } from '../../services/universityService';
import type { Student } from '../../services/universityService';
type Resume = {
  id: string;
  file_url: string;
  file_name?: string;
  is_primary: boolean;
};
import { useToast } from '../../hooks/useToast';
import { StudentProfileModal } from '../../components/university/StudentProfileModal';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await universityService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load students. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // 1. Remove profile completion and activity fields from the UI
  // 2. Only show the primary resume in the modal and in the 'With Resumes' count
  // 3. If any numeric/stat fields are missing or undefined, display 0 instead of NaN
  // 4. Enhance the UI design for the student job card and summary cards
  // 5. Ensure all fields in the job card (major, graduation year, etc.) are complete and correct
  // 6. Fix any NaN warnings by casting values to string or defaulting to 0
  const stats = {
    totalStudents: students.length,
    withResumes: students.filter(s => s.resumes && s.resumes.length > 0).length,
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-2">Manage and monitor student profiles and employment outcomes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">Total Students</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalStudents || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700">With Resumes</p>
                <p className="text-3xl font-bold text-purple-900">{stats.withResumes || 0}</p>
              </div>
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">Successful Employment</p>
                <p className="text-3xl font-bold text-orange-900">0</p>
              </div>
              <CheckCircle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name, email, or major..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by: Name</option>
                <option value="applications">Sort by: Applications</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Student Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                      <p className="text-gray-600 flex items-center gap-1 text-sm">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.major || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.graduation_year || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewProfile(student)}
                    className="flex items-center gap-1 font-semibold border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    <Users className="h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </div>
            ))}

            {filteredAndSortedStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        student={selectedStudent}
      />
    </div>
  );
} 