import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  User,
  Loader2
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Connection {
  id: string;
  employer: string;
  employer_name: string;
  employer_email: string;
  student: string;
  student_name: string;
  student_email: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  created_at: string;
  updated_at: string;
}

export function ConnectionsPanel() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await studentService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load connection requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(connectionId);
      await studentService.updateConnection(connectionId, action);
      
      addToast({
        title: 'Success',
        description: `Connection ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
        variant: 'default',
      });
      
      // Refresh connections
      fetchConnections();
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${action} connection`,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-4 w-4" />
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-4 w-4" />
        };
      case 'WITHDRAWN':
        return {
          label: 'Withdrawn',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className="h-4 w-4" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <MessageSquare className="h-4 w-4" />
        };
    }
  };

  const pendingConnections = connections.filter(c => c.status === 'PENDING');
  const otherConnections = connections.filter(c => c.status !== 'PENDING');

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Connection Requests</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading connections...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Connection Requests</h2>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {connections.length}
        </Badge>
      </div>

      <div className="p-6">
        {connections.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 font-medium mb-2">No connection requests</h3>
            <p className="text-gray-500 text-sm">
              When employers connect with you from the resume bank, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Connections */}
            {pendingConnections.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pending Requests ({pendingConnections.length})
                </h3>
                <div className="space-y-3">
                  {pendingConnections.map((connection) => {
                    const statusConfig = getStatusConfig(connection.status);
                    return (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Building className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{connection.employer_name}</h4>
                              <p className="text-sm text-gray-500">{connection.employer_email}</p>
                            </div>
                          </div>
                          <Badge className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                        </div>
                        
                        {connection.message && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{connection.message}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(connection.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleConnectionAction(connection.id, 'accept')}
                              disabled={processingId === connection.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingId === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              <span className="ml-1">Accept</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConnectionAction(connection.id, 'reject')}
                              disabled={processingId === connection.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {processingId === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              <span className="ml-1">Reject</span>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Connections */}
            {otherConnections.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Other Connections ({otherConnections.length})
                </h3>
                <div className="space-y-2">
                  {otherConnections.map((connection) => {
                    const statusConfig = getStatusConfig(connection.status);
                    return (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Building className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{connection.employer_name}</h4>
                            <p className="text-xs text-gray-500">{connection.employer_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(connection.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
} 