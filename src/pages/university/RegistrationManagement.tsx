import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Users, Building2, Search, Mail, 
  CheckCircle, XCircle, Clock, Download, Eye
} from 'lucide-react';
import { universityService, Registration } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

export function RegistrationManagement() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [fairName, setFairName] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Registration[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Registration[]>([]);
  const [employerSearch, setEmployerSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [employerFilter, setEmployerFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');

  useEffect(() => {
    loadRegistrationData();
  }, [fairId]);

  useEffect(() => {
    // Filter employers
    const employers = registrations.filter(r => r.type === 'employer');
    let filtered = employers;

    if (employerSearch) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(employerSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(employerSearch.toLowerCase()) ||
        (emp.company && emp.company.toLowerCase().includes(employerSearch.toLowerCase()))
      );
    }

    if (employerFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === employerFilter);
    }

    setFilteredEmployers(filtered);
  }, [registrations, employerSearch, employerFilter]);

  useEffect(() => {
    // Filter students
    const students = registrations.filter(r => r.type === 'student');
    let filtered = students;

    if (studentSearch) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }

    if (studentFilter !== 'all') {
      filtered = filtered.filter(student => student.status === studentFilter);
    }

    setFilteredStudents(filtered);
  }, [registrations, studentSearch, studentFilter]);

  const loadRegistrationData = async () => {
    try {
      // Get fair name first
      const fairs = await universityService.getCareerFairs();
      const fair = fairs.find(f => f.id === fairId);
      setFairName(fair?.name || 'Career Fair');

      // Get real registration data
      const registrationData = await universityService.getFairRegistrations(fairId!);
      setRegistrations(registrationData);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load registration data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleRegistrationStatusChange = async (registrationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      if (newStatus === 'approved') {
        await universityService.approveRegistration(registrationId);
      } else {
        await universityService.rejectRegistration(registrationId);
      }

      setRegistrations(prev => prev.map(reg =>
        reg.id === registrationId ? { ...reg, status: newStatus } : reg
      ));

      addToast({
        title: 'Success',
        description: `Registration ${newStatus} successfully!`,
        variant: 'default'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: `Failed to ${newStatus} registration.`,
        variant: 'destructive'
      });
    }
  };

  const exportToCSV = (type: 'employers' | 'students') => {
    const data = type === 'employers' ? filteredEmployers : filteredStudents;
    
    let csvContent = '';
    if (type === 'employers') {
      csvContent = 'Company,Contact Person,Email,Registration Date,Status,Booth Number\n';      csvContent += data.map(emp => 
        `"${emp.company || emp.name}","${emp.name}","${emp.email}","${emp.registrationDate}","${emp.status}","${emp.booth_number || 'N/A'}"`
      ).join('\n');
    } else {
      csvContent = 'Name,Email,Registration Date,Status\n';
      csvContent += data.map(student => 
        `"${student.name}","${student.email}","${student.registrationDate}","${student.status}"`
      ).join('\n');
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fairName}_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addToast({
      title: 'Success',
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`,
      variant: 'default'
    });
  };const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      registered: { color: 'bg-blue-100 text-blue-800', icon: Users },
      'checked-in': { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const { color, icon: Icon } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };  if (loading) {    return (      <div className="flex items-center justify-center h-64">        <div className="text-center">          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>          <p className="mt-2 text-gray-600">Loading registration data...</p>        </div>      </div>    );  }  return (    <div className="min-h-screen bg-gray-50">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        <motion.div          initial={{ opacity: 0, y: 20 }}          animate={{ opacity: 1, y: 0 }}          transition={{ duration: 0.5 }}          className="space-y-8"        >          {/* Header */}          <div className="flex items-center justify-between">            <div className="flex items-center gap-4">              <Button                variant="outline"                onClick={() => navigate(`/university/fairs/${fairId}/manage`)}                className="flex items-center gap-2"              >                <ArrowLeft className="h-4 w-4" />                Back to Fair Management              </Button>              <div>                <h1 className="text-3xl font-bold text-gray-900">Registration Management</h1>                <p className="text-gray-600 mt-1">{fairName} - Manage employer and student registrations</p>              </div>            </div>          </div>          {/* Statistics Cards */}          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">            <Card>              <CardContent className="p-6">                <div className="flex items-center">                  <Building2 className="h-8 w-8 text-blue-600" />                  <div className="ml-4">                    <p className="text-sm font-medium text-gray-600">Total Employers</p>                    <p className="text-2xl font-bold text-gray-900">{registrations.filter(r => r.type === 'employer').length}</p>                  </div>                </div>              </CardContent>            </Card>                        <Card>              <CardContent className="p-6">                <div className="flex items-center">                  <Users className="h-8 w-8 text-green-600" />                  <div className="ml-4">                    <p className="text-sm font-medium text-gray-600">Total Students</p>                    <p className="text-2xl font-bold text-gray-900">{registrations.filter(r => r.type === 'student').length}</p>                  </div>                </div>              </CardContent>            </Card>                        <Card>              <CardContent className="p-6">                <div className="flex items-center">                  <CheckCircle className="h-8 w-8 text-indigo-600" />                  <div className="ml-4">                    <p className="text-sm font-medium text-gray-600">Approved</p>                    <p className="text-2xl font-bold text-gray-900">{registrations.filter(r => r.status === 'approved').length}</p>                  </div>                </div>              </CardContent>            </Card>                        <Card>              <CardContent className="p-6">                <div className="flex items-center">                  <Clock className="h-8 w-8 text-orange-600" />                  <div className="ml-4">                    <p className="text-sm font-medium text-gray-600">Pending</p>                    <p className="text-2xl font-bold text-gray-900">{registrations.filter(r => r.status === 'pending').length}</p>                  </div>                </div>              </CardContent>            </Card>          </div>          {/* Tabs for Employers and Students */}          <Tabs defaultValue="employers" className="space-y-6">            <TabsList>              <TabsTrigger value="employers" className="flex items-center gap-2">                <Building2 className="h-4 w-4" />                Employers ({filteredEmployers.length})              </TabsTrigger>              <TabsTrigger value="students" className="flex items-center gap-2">                <Users className="h-4 w-4" />                Students ({filteredStudents.length})              </TabsTrigger>            </TabsList>            {/* Employers Tab */}            <TabsContent value="employers" className="space-y-6">              <Card>                <CardHeader>                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">                    <CardTitle className="flex items-center gap-2">                      <Building2 className="h-5 w-5" />                      Employer Registrations                    </CardTitle>                    <div className="flex items-center gap-3">                      <div className="flex items-center gap-2">                        <Search className="h-4 w-4 text-gray-500" />                        <Input                          placeholder="Search employers..."                          value={employerSearch}                          onChange={(e) => setEmployerSearch(e.target.value)}                          className="w-64"                        />                      </div>                      <select                        value={employerFilter}                        onChange={(e) => setEmployerFilter(e.target.value)}                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"                      >                        <option value="all">All Status</option>                        <option value="pending">Pending</option>                        <option value="approved">Approved</option>                        <option value="rejected">Rejected</option>                      </select>                      <Button                        variant="outline"                        onClick={() => exportToCSV('employers')}                        className="flex items-center gap-2"                      >                        <Download className="h-4 w-4" />                        Export CSV                      </Button>                    </div>                  </div>                </CardHeader>                <CardContent>                  <div className="overflow-x-auto">                    <table className="w-full">                      <thead>                        <tr className="border-b">                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration Date</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Booth</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>                        </tr>                      </thead>                      <tbody>                        {filteredEmployers.map((employer) => (                          <motion.tr                            key={employer.id}                            className="border-b hover:bg-gray-50 transition-colors"                            initial={{ opacity: 0 }}                            animate={{ opacity: 1 }}                          >                            <td className="py-3 px-4">                              <div>                                <p className="font-medium text-gray-900">{employer.company || employer.name}</p>                                <div className="flex items-center gap-2 mt-1">                                  <Mail className="h-3 w-3 text-gray-400" />                                  <span className="text-sm text-gray-600">{employer.email}</span>                                </div>                              </div>                            </td>                            <td className="py-3 px-4">                              <p className="text-gray-900">{employer.name}</p>                            </td>                            <td className="py-3 px-4">                              <p className="text-gray-600">                                {new Date(employer.registrationDate).toLocaleDateString()}                              </p>                            </td>                            <td className="py-3 px-4">                              {getStatusBadge(employer.status)}                            </td>                            <td className="py-3 px-4">                              <p className="text-gray-600">{employer.booth_number || 'Not assigned'}</p>                            </td>                            <td className="py-3 px-4">                              {employer.status === 'pending' && (                                <div className="flex items-center gap-2">                                  <Button                                    size="sm"                                    onClick={() => handleRegistrationStatusChange(employer.id, 'approved')}                                    className="bg-green-600 hover:bg-green-700 text-white"                                  >                                    <CheckCircle className="h-3 w-3 mr-1" />                                    Approve                                  </Button>                                  <Button                                    size="sm"                                    variant="outline"                                    onClick={() => handleRegistrationStatusChange(employer.id, 'rejected')}                                    className="border-red-300 text-red-700 hover:bg-red-50"                                  >                                    <XCircle className="h-3 w-3 mr-1" />                                    Reject                                  </Button>                                </div>                              )}                            </td>                          </motion.tr>                        ))}                      </tbody>                    </table>                    {filteredEmployers.length === 0 && (                      <div className="text-center py-8">                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />                        <p className="text-gray-500">No employer registrations found</p>                      </div>                    )}                  </div>                </CardContent>              </Card>            </TabsContent>            {/* Students Tab */}            <TabsContent value="students" className="space-y-6">              <Card>                <CardHeader>                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">                    <CardTitle className="flex items-center gap-2">                      <Users className="h-5 w-5" />                      Student Registrations                    </CardTitle>                    <div className="flex items-center gap-3">                      <div className="flex items-center gap-2">                        <Search className="h-4 w-4 text-gray-500" />                        <Input                          placeholder="Search students..."                          value={studentSearch}                          onChange={(e) => setStudentSearch(e.target.value)}                          className="w-64"                        />                      </div>                      <select                        value={studentFilter}                        onChange={(e) => setStudentFilter(e.target.value)}                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"                      >                        <option value="all">All Status</option>                        <option value="registered">Registered</option>                        <option value="checked-in">Checked In</option>                      </select>                      <Button                        variant="outline"                        onClick={() => exportToCSV('students')}                        className="flex items-center gap-2"                      >                        <Download className="h-4 w-4" />                        Export CSV                      </Button>                    </div>                  </div>                </CardHeader>                <CardContent>                  <div className="overflow-x-auto">                    <table className="w-full">                      <thead>                        <tr className="border-b">                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration Date</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>                        </tr>                      </thead>                      <tbody>                        {filteredStudents.map((student) => (                          <motion.tr                            key={student.id}                            className="border-b hover:bg-gray-50 transition-colors"                            initial={{ opacity: 0 }}                            animate={{ opacity: 1 }}                          >                            <td className="py-3 px-4">                              <div>                                <p className="font-medium text-gray-900">{student.name}</p>                                <div className="flex items-center gap-2 mt-1">                                  <Mail className="h-3 w-3 text-gray-400" />                                  <span className="text-sm text-gray-600">{student.email}</span>                                </div>                              </div>                            </td>                            <td className="py-3 px-4">                              <p className="text-gray-600">                                {new Date(student.registrationDate).toLocaleDateString()}                              </p>                            </td>                            <td className="py-3 px-4">                              {getStatusBadge(student.status)}                            </td>                            <td className="py-3 px-4">                              <Button                                size="sm"                                variant="outline"                                className="flex items-center gap-2"                              >                                <Eye className="h-3 w-3" />                                View Profile                              </Button>                            </td>                          </motion.tr>                        ))}                      </tbody>                    </table>                    {filteredStudents.length === 0 && (                      <div className="text-center py-8">                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />                        <p className="text-gray-500">No student registrations found</p>                      </div>                    )}                  </div>                </CardContent>              </Card>            </TabsContent>          </Tabs>        </motion.div>      </div>    </div>  );}