'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { 
  ArrowLeftIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  category?: string;
  budget?: number;
  expectedDuration?: string;
  mentorId?: string;
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mentor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProjectRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [projectRequest, setProjectRequest] = useState<ProjectRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProjectRequest();
    }
  }, [params.id]);

  const fetchProjectRequest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`/api/project-requests/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setProjectRequest(data.data);
      } else {
        setError(data.message || 'Failed to fetch project request details');
      }
    } catch (err) {
      console.error('Error fetching project request:', err);
      setError('Failed to fetch project request details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProjectRequest = async () => {
    if (!confirm('Are you sure you want to delete this project request?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/project-requests/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        router.push('/project-requests');
      } else {
        alert(data.message || 'Failed to delete project request');
      }
    } catch (err) {
      console.error('Error deleting project request:', err);
      alert('Failed to delete project request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      case 'under_review': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'approved': return <CheckCircleIcon className="w-5 h-5" />;
      case 'rejected': return <XCircleIcon className="w-5 h-5" />;
      case 'on_hold': return <ClockIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Project Request Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !projectRequest) {
    return (
      <AdminLayout pageTitle="Project Request Details">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Project request not found'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Project Request Details">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{projectRequest.title}</h1>
              <p className="text-gray-600">Project Request Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(projectRequest.status)}
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(projectRequest.status)}`}>
                {projectRequest.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleDeleteProjectRequest}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Request Overview</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{projectRequest.description}</p>
                </div>

                {projectRequest.category && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                    <div className="flex items-center">
                      <TagIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{projectRequest.category}</span>
                    </div>
                  </div>
                )}

                {projectRequest.expectedDuration && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Duration</h4>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{projectRequest.expectedDuration}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Status History</h3>
              </div>
              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(projectRequest.status)}`}>
                              {getStatusIcon(projectRequest.status)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Request <span className="font-medium text-gray-900">{projectRequest.status.replace('_', ' ')}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>{formatDate(projectRequest.updatedAt)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="relative">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-blue-100 text-blue-800">
                              <ClockIcon className="w-5 h-5" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Request <span className="font-medium text-gray-900">submitted</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>{formatDate(projectRequest.createdAt)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Request Information</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Submitted By */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Submitted By</h4>
                  <div className="flex items-center text-sm text-gray-900">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    {projectRequest.submittedBy.firstName} {projectRequest.submittedBy.lastName}
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    {projectRequest.submittedBy.email}
                  </div>
                </div>

                {/* Mentor */}
                {projectRequest.mentor && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned Mentor</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      {projectRequest.mentor.firstName} {projectRequest.mentor.lastName}
                    </div>
                    <div className="text-sm text-gray-500 ml-6">
                      {projectRequest.mentor.email}
                    </div>
                  </div>
                )}

                {/* Budget */}
                {projectRequest.budget && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Budget</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      ${projectRequest.budget.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Submitted</h4>
                  <div className="flex items-center text-sm text-gray-900">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(projectRequest.createdAt)}
                  </div>
                </div>

                {/* Last Updated */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h4>
                  <div className="flex items-center text-sm text-gray-900">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(projectRequest.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Approve Request</span>
                </button>
                
                <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center justify-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>Put Under Review</span>
                </button>
                
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2">
                  <XCircleIcon className="w-5 h-5" />
                  <span>Reject Request</span>
                </button>
                
                <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>Put On Hold</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

