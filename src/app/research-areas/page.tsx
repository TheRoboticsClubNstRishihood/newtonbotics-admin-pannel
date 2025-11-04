'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/ToastContext';

interface ResearchArea {
  _id: string;
  name: string;
  description: string;
  category: string;
  keywords?: string[];
  color?: string;
  order?: number;
  isActive: boolean;
  isFeatured: boolean;
  focusAreas?: string[];
  requiredEquipment?: string[];
  requiredSkills?: string[];
  studentIds?: string[];
  collaborationOpportunities?: string;
  fundingInfo?: string;
  publicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ResearchAreasPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResearchArea, setSelectedResearchArea] = useState<ResearchArea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    fetchResearchAreas();
    fetchCategories();
  }, []);

  const fetchResearchAreas = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/research-areas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Research areas loaded:', data.data.items?.length || 0, 'items');
        setResearchAreas(data.data.items || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to fetch research areas: ${errorData.message || `HTTP ${response.status}`}`);
        setResearchAreas([]);
      }
    } catch (error) {
      console.error('Error fetching research areas:', error);
      showError('Network error while fetching research areas');
      setResearchAreas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/research-areas/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const categoriesList = data.data.categories || [];
        // Sort categories alphabetically
        setCategories(categoriesList.sort((a: string, b: string) => a.localeCompare(b)));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedResearchArea) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch(`/api/research-areas/${selectedResearchArea._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Research area deleted successfully');
        setShowDeleteModal(false);
        setSelectedResearchArea(null);
        fetchResearchAreas();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to delete research area: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting research area:', error);
      showError('Network error while deleting research area');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (researchArea: ResearchArea) => {
    setSelectedResearchArea(researchArea);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
  };

  const filteredResearchAreas = researchAreas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (area.keywords && area.keywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && area.isActive) ||
                         (statusFilter === 'inactive' && !area.isActive);
    const matchesCategory = categoryFilter === 'all' || area.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <AdminLayout pageTitle="Research Areas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Research Areas</h1>
            <p className="text-black">Manage research areas and focus areas</p>
          </div>
          <button
            onClick={() => router.push('/research-areas/create')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Research Area
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search research areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Research Areas List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">
              Research Areas ({filteredResearchAreas.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-black">Loading research areas...</p>
            </div>
          ) : filteredResearchAreas.length === 0 ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-black mb-2">No research areas found</h3>
              <p className="text-black mb-4">
                {searchTerm ? 'No research areas match your search.' : 'Get started by adding your first research area.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/research-areas/create')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Research Area
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Research Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Keywords
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Publications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Students
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
                  {filteredResearchAreas.map((area) => (
                    <tr key={area._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div 
                              className={`h-10 w-10 rounded-lg flex items-center justify-center`}
                              style={{ backgroundColor: area.color ? `${area.color}20` : '#EEF2FF' }}
                            >
                              <AcademicCapIcon 
                                className="h-6 w-6" 
                                style={{ color: area.color || '#4F46E5' }}
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black flex items-center">
                              {area.name}
                              {area.isFeatured && (
                                <StarIcon className="h-4 w-4 ml-2 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 max-w-md truncate">
                              {area.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {area.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {area.keywords && area.keywords.slice(0, 3).map((keyword, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {keyword}
                            </span>
                          ))}
                          {area.keywords && area.keywords.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500">
                              +{area.keywords.length - 3} more
                            </span>
                          )}
                          {(!area.keywords || area.keywords.length === 0) && (
                            <span className="text-xs text-gray-400">No keywords</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {area.publicationCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-black">
                          {area.studentIds && area.studentIds.length > 0 ? (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">{area.studentIds.length}</span>
                              <span className="text-gray-500 text-xs">
                                {area.studentIds.length === 1 ? 'student' : 'students'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No students</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(area.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/research-areas/edit/${area._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(area)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResearchArea && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-black mt-4">Delete Research Area</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-black">
                  Are you sure you want to delete &quot;{selectedResearchArea.name}&quot;? This action cannot be undone.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Research Area ID: {selectedResearchArea._id}
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

