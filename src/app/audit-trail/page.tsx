'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  UserIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ChartBarIcon,
  EyeIcon
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
}

interface ProjectRequestAudit {
  _id: string;
  title: string;
  status: string;
  auditTrail: AuditEntry[];
}

interface AuditFilters {
  action: string;
  user: string;
  dateRange: string;
  search: string;
}

interface AuditStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  recentActivity: AuditEntry[];
  topUsers: Array<{
    user: string;
    actionCount: number;
  }>;
}

export default function AdminAuditDashboard() {
  const [allAuditTrails, setAllAuditTrails] = useState<ProjectRequestAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({
    action: '',
    user: '',
    dateRange: '',
    search: ''
  });
  const [stats, setStats] = useState<AuditStats>({
    totalActions: 0,
    actionsByType: {},
    recentActivity: [],
    topUsers: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllAuditTrails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.user) queryParams.append('user', filters.user);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('limit', '20');
      queryParams.append('skip', ((currentPage - 1) * 20).toString());

      const response = await fetch(`/api/project-requests/audit-trails/all?${queryParams.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAllAuditTrails(data.data.projectRequests || []);
        setTotalPages(Math.ceil((data.data.totalCount || 0) / 20));
        
        // Calculate stats
        const allEntries: AuditEntry[] = ((data.data.projectRequests || []) as ProjectRequestAudit[])
          .flatMap((pr: ProjectRequestAudit) => pr.auditTrail);
        const newStats = {
          totalActions: allEntries.length,
          actionsByType: allEntries.reduce((acc, entry) => {
            acc[entry.action] = (acc[entry.action] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recentActivity: allEntries
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
            .slice(0, 10),
          topUsers: Object.entries(
            allEntries.reduce((acc, entry) => {
              const userKey = `${entry.performedBy.firstName} ${entry.performedBy.lastName}`;
              acc[userKey] = (acc[userKey] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
            .map(([user, actionCount]) => ({ user, actionCount }))
            .sort((a, b) => b.actionCount - a.actionCount)
            .slice(0, 5)
        };
        setStats(newStats);
      } else {
        setError(data.message || 'Failed to fetch audit trails');
      }
    } catch (err) {
      console.error('Error fetching audit trails:', err);
      setError('Failed to fetch audit trails');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchAllAuditTrails();
  }, [fetchAllAuditTrails]);

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <DocumentTextIcon className="w-4 h-4 text-green-600" />;
      case 'updated': return <ArrowPathIcon className="w-4 h-4 text-blue-600" />;
      case 'approved': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'deleted': return <TrashIcon className="w-4 h-4 text-red-600" />;
      case 'status_changed': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      default: return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
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
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading && allAuditTrails.length === 0) {
    return (
      <AdminLayout pageTitle="Audit Trail Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Audit Trail Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Request Audit Trail</h1>
            <p className="text-gray-600">Complete audit history and user activity monitoring</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.actionsByType.approved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.actionsByType.rejected || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Updates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.actionsByType.updated || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="deleted">Deleted</option>
                <option value="status_changed">Status Changed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                placeholder="Filter by user..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search requests..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Project Request Audit Trails</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {allAuditTrails.map((project) => (
              <div key={project._id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-500">Status: {project.status}</p>
                  </div>
                  <a
                    href={`/project-requests/${project._id}`}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Details</span>
                  </a>
                </div>

                <div className="space-y-3">
                  {project.auditTrail.slice(0, 3).map((entry, index) => (
                    <div key={entry._id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                      <div className="flex-shrink-0">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                            {entry.action.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDate(entry.performedAt)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <UserIcon className="w-4 h-4 inline mr-1" />
                          {entry.performedBy.firstName} {entry.performedBy.lastName}
                          {entry.changes && (
                            <span className="ml-2 text-gray-700">
                              • {entry.changes.field}: <span className="font-medium">{entry.changes.oldValue}</span> → <span className="font-medium">{entry.changes.newValue}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {project.auditTrail.length > 3 && (
                    <div className="text-center">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        View {project.auditTrail.length - 3} more entries
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
