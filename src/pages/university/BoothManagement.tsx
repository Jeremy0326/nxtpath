import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Building2, MapPin, Grid3X3, Edit3,
  Move
} from 'lucide-react';
import { universityService, Booth, FairDetails } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

export function BoothManagement() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [fair, setFair] = useState<FairDetails | null>(null);  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridDimensions, setGridDimensions] = useState({ width: 10, height: 10 });  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [draggedBooth, setDraggedBooth] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);  // Function to check if booth number is already taken

  useEffect(() => {
    if (fairId) {
      loadData();
    }
  }, [fairId]);

  const loadData = async () => {
    try {
      const [fairData, boothsData] = await Promise.all([
        universityService.getCareerFairDetails(fairId!),
        universityService.getFairBooths(fairId!)
      ]);
      
      setFair(fairData);
      setBooths(boothsData);
      
      // Set grid dimensions from fair data if available
      if (fairData.gridWidth && fairData.gridHeight) {
        setGridDimensions({ width: fairData.gridWidth, height: fairData.gridHeight });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load booth data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBoothMove = async (boothId: string, newX: number, newY: number) => {
    try {
      const updatedBooth = await universityService.assignBoothPosition(boothId, { 
        x: newX, 
        y: newY 
      });
      
      setBooths(prev => prev.map(booth => 
        booth.id === boothId ? updatedBooth : booth
      ));
      
      addToast({
        title: 'Success',
        description: 'Booth position updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update booth position.',
        variant: 'destructive'
      });
    }
  };

  const handleBoothNumberUpdate = async (boothId: string, boothNumber: string) => {
    try {
      const booth = booths.find(b => b.id === boothId);
      if (!booth) return;
        const updatedBooth = await universityService.updateBooth(boothId, { 
        booth_number: boothNumber 
      });
      
      setBooths(prev => prev.map(b => 
        b.id === boothId ? updatedBooth : b
      ));
      
      addToast({
        title: 'Success',
        description: 'Booth number updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update booth number.',
        variant: 'destructive'
      });
    }
  };

  const handleGridClick = (x: number, y: number) => {
    if (draggedBooth && editMode) {
      handleBoothMove(draggedBooth, x, y);
      setDraggedBooth(null);
    }
  };

  const isPositionOccupied = (x: number, y: number, excludeBoothId?: string) => {
    return booths.some(booth => 
      booth.id !== excludeBoothId && 
      booth.x === x && 
      booth.y === y
    );
  };

  const autoAssignPositions = () => {
    const unassignedBooths = booths.filter(booth => booth.x === 0 && booth.y === 0);
    const updates: Promise<any>[] = [];
    
    let currentX = 1;
    let currentY = 1;
    
    unassignedBooths.forEach((booth, index) => {
      // Find next available position
      while (isPositionOccupied(currentX, currentY)) {
        currentX++;
        if (currentX > gridDimensions.width) {
          currentX = 1;
          currentY++;
          if (currentY > gridDimensions.height) {
            break; // No more space
          }
        }
      }
      
      if (currentY <= gridDimensions.height) {        updates.push(
          universityService.assignBoothPosition(booth.id, {
            x: currentX,
            y: currentY,
            boothNumber: `B${String(index + 1).padStart(2, '0')}`
          })
        );
        currentX++;
      }
    });
    
    Promise.all(updates).then(() => {
      loadData(); // Reload to get updated positions
      addToast({
        title: 'Success',
        description: 'Booth positions assigned automatically!',
        variant: 'default'
      });
    }).catch(() => {
      addToast({
        title: 'Error',
        description: 'Failed to assign some booth positions.',
        variant: 'destructive'
      });
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading booth layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/university/fairs/${fairId}/manage`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Fair Management
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Booth Management</h1>
                <p className="text-gray-600 mt-1">{fair?.name} - Manage booth layout and assignments</p>
              </div>
            </div>            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={autoAssignPositions}
                disabled={booths.filter(b => b.x === 0 && b.y === 0).length === 0}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Auto Assign
              </Button>
              <Button
                onClick={() => setEditMode(!editMode)}
                className={editMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {editMode ? 'Exit Edit Mode' : 'Edit Layout'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Interactive Grid */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Fair Layout Grid
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Grid Size: {gridDimensions.width} × {gridDimensions.height}</span>
                    <span>Total Booths: {booths.length}</span>
                    <span>Assigned: {booths.filter(b => b.x > 0 && b.y > 0).length}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 overflow-auto">
                    <div 
                      className="grid gap-1 mx-auto"
                      style={{ 
                        gridTemplateColumns: `repeat(${gridDimensions.width}, minmax(0, 1fr))`,
                        width: `${Math.min(gridDimensions.width * 60, 800)}px`
                      }}
                    >
                      {Array.from({ length: gridDimensions.height }).map((_, y) =>
                        Array.from({ length: gridDimensions.width }).map((_, x) => {
                          const booth = booths.find(b => b.x === x + 1 && b.y === y + 1);
                          const isOccupied = !!booth;
                          const isDragTarget = draggedBooth && editMode && !isOccupied;
                          
                          return (
                            <div
                              key={`${x}-${y}`}
                              className={`
                                aspect-square border-2 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer
                                transition-all duration-200 relative
                                ${isOccupied 
                                  ? 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200' 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }
                                ${isDragTarget ? 'bg-green-100 border-green-300' : ''}
                                ${selectedBooth === booth?.id ? 'ring-2 ring-indigo-500' : ''}
                              `}
                              onClick={() => {
                                if (booth) {
                                  setSelectedBooth(selectedBooth === booth.id ? null : booth.id);
                                } else if (editMode && draggedBooth) {
                                  handleGridClick(x + 1, y + 1);
                                }
                              }}
                            >                              {booth ? (
                                <div className="text-center p-1">
                                  <div className="font-bold text-indigo-800">{booth.booth_number || 'B??'}</div>
                                  <div className="text-xs text-indigo-600 truncate" title={booth.company?.name || 'Unknown'}>
                                    {booth.company?.name?.substring(0, 8) || 'Unknown'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">{x + 1},{y + 1}</span>
                              )}
                              
                              {editMode && booth && (
                                <button
                                  className="absolute top-0 right-0 bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDraggedBooth(booth.id);
                                  }}
                                >
                                  <Move className="h-2 w-2" />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {editMode && draggedBooth && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          Click on an empty grid cell to move the selected booth there.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booth List & Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Registered Booths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booths.map((booth) => (
                    <motion.div
                      key={booth.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedBooth === booth.id 
                          ? 'border-indigo-300 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBooth(selectedBooth === booth.id ? null : booth.id)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {booth.company.name}
                          </h4>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2">                              <Badge variant="outline" className="text-xs">
                                {booth.booth_number || 'Unassigned'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Position: {booth.x > 0 && booth.y > 0 ? `${booth.x},${booth.y}` : 'Not set'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Jobs: {booth.jobs.length}
                            </p>
                          </div>
                        </div>
                        
                        {editMode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDraggedBooth(booth.id);
                            }}
                            className="ml-2"
                          >
                            <Move className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {booths.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No booths registered yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selected Booth Details */}
              {selectedBooth && (
                <Card>
                  <CardHeader>
                    <CardTitle>Booth Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const booth = booths.find(b => b.id === selectedBooth);
                      if (!booth) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Booth Number
                            </label>                            <Input
                              value={booth.booth_number || ''}
                              onChange={(e) => {
                                const newNumber = e.target.value;
                                setBooths(prev => prev.map(b => 
                                  b.id === booth.id 
                                    ? { ...b, booth_number: newNumber }
                                    : b
                                ));
                              }}
                              onBlur={(e) => {
                                handleBoothNumberUpdate(booth.id, e.target.value);
                              }}
                              placeholder="e.g., B01"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company
                            </label>
                            <p className="text-gray-900">{booth.company.name}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Position
                            </label>
                            <p className="text-gray-900">
                              {booth.x > 0 && booth.y > 0 ? `Row ${booth.y}, Column ${booth.x}` : 'Not assigned'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jobs ({booth.jobs.length})
                            </label>
                            <div className="space-y-1">
                              {booth.jobs.map(job => (
                                <div key={job.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {job.title}
                                </div>
                              ))}
                              {booth.jobs.length === 0 && (
                                <p className="text-sm text-gray-500">No jobs assigned</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
