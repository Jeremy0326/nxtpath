import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Globe, Users, GraduationCap, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface UniversityInfo {
  name: string;
  location: string;
  website: string;
  description: string;
  established: string;
  totalStudents: number;
  totalStaff: number;
  departments: string[];
}

export default function UniversityManagement() {
  const [universityInfo, setUniversityInfo] = useState<UniversityInfo>({
    name: 'University of Malaya',
    location: 'Kuala Lumpur, Malaysia',
    website: 'https://um.edu.my',
    description: 'A leading research university in Malaysia, committed to academic excellence and innovation.',
    established: '1949',
    totalStudents: 1250,
    totalStaff: 45,
    departments: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine']
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      addToast({
        title: 'Success',
        description: 'University information updated successfully.',
        variant: 'default',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update university information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Management</h1>
          <p className="text-gray-600 mt-2">Manage your university information and settings</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
              Edit Information
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                University Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">University Name</Label>
                  <Input
                    id="name"
                    value={universityInfo.name}
                    onChange={(e) => setUniversityInfo({...universityInfo, name: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={universityInfo.location}
                    onChange={(e) => setUniversityInfo({...universityInfo, location: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={universityInfo.website}
                    onChange={(e) => setUniversityInfo({...universityInfo, website: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="established">Established</Label>
                  <Input
                    id="established"
                    value={universityInfo.established}
                    onChange={(e) => setUniversityInfo({...universityInfo, established: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={universityInfo.description}
                  onChange={(e) => setUniversityInfo({...universityInfo, description: e.target.value})}
                  disabled={!isEditing}
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {universityInfo.departments.map((dept, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {dept}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="mt-4">
                  <Label htmlFor="newDept">Add Department</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="newDept"
                      placeholder="Enter department name"
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline">Add</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{universityInfo.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{universityInfo.totalStaff}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Established</p>
                    <p className="text-2xl font-bold text-gray-900">{universityInfo.established}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Update Location
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Staff
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Department
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Career Fair Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 