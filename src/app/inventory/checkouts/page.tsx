'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  EyeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../../components/AdminLayout';
import { useToast } from '../../../components/ToastContext';

interface Checkout {
  id: string;
  userId: string;
  userName: string;
  quantity: number;
  returnedQuantity?: number;
  checkoutDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: 'checked_out' | 'returned' | 'overdue' | 'lost' | 'project_use';
  projectId?: string;
  projectName?: string;
  equipmentId: string;
  equipmentName: string;
  checkoutNotes?: string;
  returnNotes?: string;
}

interface Pagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export default function CheckoutsPage() {
  const router = useRouter();
  const { showError } = useToast();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    equipmentId: '',
    userId: '',
    projectId: '',
    limit: 20
  });

  // Modal states
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    // Reset pagination when filters change (but not skip)
    setPagination(prev => ({ ...prev, skip: 0 }));
  }, [filters.status, filters.equipmentId, filters.userId, filters.projectId, filters.limit]);

  // Fetch checkouts when filters or pagination changes
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCheckouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.skip]);

  const fetchCheckouts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('limit', filters.limit.toString());
      queryParams.append('skip', pagination.skip.toString());
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.equipmentId) queryParams.append('equipmentId', filters.equipmentId);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.projectId) queryParams.append('projectId', filters.projectId);

      const response = await fetch(`/api/inventory/checkouts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCheckouts(data.data?.items || []);
        setPagination(data.data?.pagination || {
          total: 0,
          limit: filters.limit,
          skip: 0,
          hasMore: false
        });
      } else {
        setCheckouts([]);
        setPagination({
          total: 0,
          limit: filters.limit,
          skip: 0,
          hasMore: false
        });
        showError(`Unable to fetch checkouts (${response.status}). Please try again later.`);
      }
    } catch (error) {
      console.error('Error fetching checkouts:', error);
      showError('Network error while fetching checkouts');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      checked_out: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'Checked Out' },
      returned: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Returned' },
      overdue: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, label: 'Overdue' },
      lost: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, label: 'Lost' },
      project_use: { color: 'bg-purple-100 text-purple-800', icon: CheckCircleIcon, label: 'Project Use' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.checked_out;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout pageTitle="Inventory Checkouts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/inventory')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Inventory</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout History</h1>
              <p className="text-gray-600">View and manage equipment checkouts</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="">All Status</option>
              <option value="checked_out">Checked Out</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
              <option value="lost">Lost</option>
              <option value="project_use">Project Use</option>
            </select>

            {/* Limit */}
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Checkouts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">
              Checkouts ({pagination.total})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-black">Loading checkouts...</p>
            </div>
          ) : checkouts.length === 0 ? (
            <div className="p-6 text-center">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No checkouts found</h3>
              <p className="text-black">No checkout records match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Checkout Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Expected Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checkouts.map((checkout) => {
                    const remainingQty = checkout.quantity - (checkout.returnedQuantity || 0);
                    return (
                      <tr key={checkout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">{checkout.equipmentName}</div>
                          {checkout.projectName && (
                            <div className="text-xs text-gray-500">Project: {checkout.projectName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">{checkout.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">
                            {remainingQty > 0 ? (
                              <span className="text-blue-600">{remainingQty}</span>
                            ) : (
                              <span className="text-gray-400">{remainingQty}</span>
                            )} / {checkout.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {formatDate(checkout.checkoutDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {checkout.expectedReturnDate ? (
                            formatDate(checkout.expectedReturnDate)
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(checkout.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedCheckout(checkout);
                              setShowDetailModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > filters.limit && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing {pagination.skip + 1} to {Math.min(pagination.skip + filters.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - filters.limit) }))}
                disabled={pagination.skip === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + filters.limit }))}
                disabled={!pagination.hasMore}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCheckout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-black">Checkout Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment</label>
                  <p className="text-sm text-black">{selectedCheckout.equipmentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-black">{selectedCheckout.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-sm text-black">
                    {selectedCheckout.quantity - (selectedCheckout.returnedQuantity || 0)} / {selectedCheckout.quantity}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedCheckout.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Checkout Date</label>
                  <p className="text-sm text-black">{formatDate(selectedCheckout.checkoutDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Return</label>
                  <p className="text-sm text-black">
                    {selectedCheckout.expectedReturnDate ? formatDate(selectedCheckout.expectedReturnDate) : 'N/A'}
                  </p>
                </div>
                {selectedCheckout.actualReturnDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Actual Return Date</label>
                    <p className="text-sm text-black">{formatDate(selectedCheckout.actualReturnDate)}</p>
                  </div>
                )}
                {selectedCheckout.projectName && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Project</label>
                    <p className="text-sm text-black">{selectedCheckout.projectName}</p>
                  </div>
                )}
              </div>

              {selectedCheckout.checkoutNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Checkout Notes</label>
                  <p className="text-sm text-black bg-gray-50 p-3 rounded-md">{selectedCheckout.checkoutNotes}</p>
                </div>
              )}

              {selectedCheckout.returnNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Return Notes</label>
                  <p className="text-sm text-black bg-gray-50 p-3 rounded-md">{selectedCheckout.returnNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

