'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import NewsletterStats from '../../components/NewsletterStats';
import NewsletterNavigation from '../../components/NewsletterNavigation';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface NewsletterSubscription {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterStats {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
    recentSubscriptions: number;
    recentUnsubscriptions: number;
  };
  topDomains: Array<{
    _id: string;
    count: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    count: number;
  }>;
}

export default function NewsletterPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('subscribedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(20);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [currentPage, searchQuery, statusFilter, sortBy, sortOrder]);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      await Promise.all([
        fetchSubscriptions(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error in checkAuthAndFetchData:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      console.log('🔄 Frontend: Fetching subscriptions...');
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Frontend: Token present:', !!token);
      if (!token) {
        console.log('❌ Frontend: No token found');
        return;
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: ((currentPage - 1) * limit).toString(),
        sortBy,
        sortOrder
      });

      if (searchQuery) params.set('q', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const apiUrl = `/api/newsletter/admin/subscriptions?${params}`;
      console.log('🌐 Frontend: Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Frontend: Response status:', response.status);
      console.log('📡 Frontend: Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend: Successfully fetched subscriptions:', data);
        setSubscriptions(data.data.subscriptions);
        setTotalCount(data.data.pagination.total);
      } else {
        const errorData = await response.json();
        console.log('❌ Frontend: Error response:', errorData);
        
        if (errorData.error === 'BACKEND_API_NOT_AVAILABLE') {
          setError('Newsletter admin API is not implemented on the backend server. Please contact the development team to implement the required API endpoints.');
        } else {
          setError(errorData.message || 'Failed to fetch subscriptions');
        }
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to fetch subscriptions');
    }
  };

  const fetchStatistics = async () => {
    try {
      console.log('🔄 Frontend: Fetching statistics...');
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/newsletter/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Frontend: Statistics response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend: Successfully fetched statistics:', data);
        setStats(data.data);
      } else {
        const errorData = await response.json();
        console.log('❌ Frontend: Statistics error response:', errorData);
        
        if (errorData.error === 'BACKEND_API_NOT_AVAILABLE') {
          console.log('⚠️ Backend statistics API not available - will show empty stats');
          // Don't set error for statistics, just don't show stats
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscriptions();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubscriptions.size === 0) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const emails = subscriptions
        .filter(sub => selectedSubscriptions.has(sub._id))
        .map(sub => sub.email);

      const response = await fetch('/api/newsletter/admin/bulk-operations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emails,
          action: bulkAction
        })
      });

      if (response.ok) {
        setSelectedSubscriptions(new Set());
        setShowBulkModal(false);
        setBulkAction('');
        fetchSubscriptions();
        fetchStatistics();
      } else {
        setError('Failed to perform bulk operation');
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      setError('Failed to perform bulk operation');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/newsletter/admin/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'csv',
          includeInactive: statusFilter === 'all' || statusFilter === 'inactive'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'newsletter-subscriptions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export subscriptions');
      }
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      setError('Failed to export subscriptions');
    }
  };

  const toggleSubscriptionSelection = (id: string) => {
    const newSelected = new Set(selectedSubscriptions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubscriptions(newSelected);
  };

  const selectAllSubscriptions = () => {
    if (selectedSubscriptions.size === subscriptions.length) {
      setSelectedSubscriptions(new Set());
    } else {
      setSelectedSubscriptions(new Set(subscriptions.map(sub => sub._id)));
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (loading) {
    return (
      <AdminLayout pageTitle="Newsletter Subscriptions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Newsletter Management">
      <div className="space-y-6">
        <NewsletterNavigation />
        {stats && <NewsletterStats type="subscriptions" subscriptionStats={stats} />}

        {/* Filters and Actions */}
        <div className="bg-white shadow rounded-lg newsletter-form">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <form onSubmit={handleSearch} className="flex">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by email, name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export
                </button>

                {selectedSubscriptions.size > 0 && (
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Bulk Actions ({selectedSubscriptions.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {/* Table Header */}
            <li className="bg-gray-50">
              <div className="px-4 py-3 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSubscriptions.size === subscriptions.length && subscriptions.length > 0}
                  onChange={selectAllSubscriptions}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                />
                <div className="grid grid-cols-12 gap-4 w-full text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Email
                      {sortBy === 'email' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('firstName')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Name
                      {sortBy === 'firstName' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('isActive')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Status
                      {sortBy === 'isActive' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('subscribedAt')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Subscribed
                      {sortBy === 'subscribedAt' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>
            </li>

            {/* Table Rows */}
            {subscriptions.map((subscription) => (
              <li key={subscription._id}>
                <div className="px-4 py-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSubscriptions.has(subscription._id)}
                    onChange={() => toggleSubscriptionSelection(subscription._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                  />
                  <div className="grid grid-cols-12 gap-4 w-full">
                    <div className="col-span-4">
                      <div className="text-sm font-medium text-gray-900">{subscription.email}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">
                        {subscription.firstName} {subscription.lastName}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">
                        {new Date(subscription.subscribedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/newsletter/${subscription._id}`)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Bulk Actions
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          You have selected {selectedSubscriptions.size} subscription(s). Choose an action:
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bulkAction"
                            value="activate"
                            checked={bulkAction === 'activate'}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Activate subscriptions</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bulkAction"
                            value="deactivate"
                            checked={bulkAction === 'deactivate'}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Deactivate subscriptions</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bulkAction"
                            value="delete"
                            checked={bulkAction === 'delete'}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Delete subscriptions</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
