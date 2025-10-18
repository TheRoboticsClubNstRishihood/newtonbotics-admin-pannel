'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface AuditEntry {
  _id: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'deleted' | 'status_changed';
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  performedAt: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  };
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ProjectRequestAuditTrailProps {
  projectRequestId: string;
  className?: string;
}

export default function ProjectRequestAuditTrail({ projectRequestId, className = '' }: ProjectRequestAuditTrailProps) {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`/api/project-requests/${projectRequestId}/audit-trail`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAuditTrail(data.data.auditTrail || []);
      } else {
        setError(data.message || 'Failed to fetch audit trail');
      }
    } catch (err) {
      console.error('Error fetching audit trail:', err);
      setError('Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectRequestId) {
      fetchAuditTrail();
    }
  }, [projectRequestId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <DocumentTextIcon className="w-5 h-5 text-green-600" />;
      case 'updated': return <ArrowPathIcon className="w-5 h-5 text-blue-600" />;
      case 'approved': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'deleted': return <TrashIcon className="w-5 h-5 text-red-600" />;
      case 'status_changed': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default: return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'status_changed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Audit Trail</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAuditTrail}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
          <button
            onClick={fetchAuditTrail}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        {auditTrail.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Trail</h3>
            <p className="text-gray-600">No audit entries found for this project request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditTrail.map((entry, index) => (
              <div key={entry._id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActionIcon(entry.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                        {entry.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(entry.performedAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-700">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>
                          <span className="font-medium text-gray-900">Performed by:</span> {entry.performedBy.firstName} {entry.performedBy.lastName}
                        </span>
                      </div>

                      {entry.changes && (
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium mb-2">Field: <span className="text-gray-700">{entry.changes.field}</span></p>
                            <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-700 font-medium">Old Value:</span>
                                <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-sm text-gray-900">
                                  {entry.changes.oldValue || 'None'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-700 font-medium">New Value:</span>
                                <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-sm text-gray-900">
                                  {entry.changes.newValue || 'None'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {entry.reason && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium text-gray-700">Reason:</span> {entry.reason}
                          </p>
                        </div>
                      )}

                      {entry.ipAddress && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium text-gray-700">IP Address:</span> {entry.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
