'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface NewsletterCampaign {
  _id: string;
  title: string;
  subject: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  targetAudience: string;
  template: string;
  tags: string[];
  scheduledAt?: string;
  customEmails: string[];
  excludeEmails: string[];
  sendStats: {
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    openedCount?: number;
    clickedCount?: number;
    unsubscribedCount?: number;
  };
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  sentAt?: string;
  updatedAt: string;
}

interface CampaignRecipients {
  recipients: Array<{
    email: string;
    firstName: string;
    lastName: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<NewsletterCampaign | null>(null);
  const [recipients, setRecipients] = useState<CampaignRecipients | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [testEmails, setTestEmails] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [params]);

  const checkAuthAndFetchData = async () => {
    try {
      const { id } = await params;
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      await fetchCampaign(id);
    } catch (error) {
      console.error('Error in checkAuthAndFetchData:', error);
      setError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaign = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/newsletter/admin/campaigns/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaign(data.data.campaign);
      } else {
        setError('Failed to fetch campaign');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError('Failed to fetch campaign');
    }
  };

  const fetchRecipients = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/newsletter/admin/campaigns/${id}/recipients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecipients(data.data);
      } else {
        setError('Failed to fetch recipients');
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      setError('Failed to fetch recipients');
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      const { id } = await params;
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      console.log('🔄 Deleting campaign', id);
      const response = await fetch(`/api/newsletter/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Delete response status:', response.status);
      if (response.ok) {
        router.push('/newsletter/campaigns');
      } else {
        let msg = 'Failed to delete campaign';
        try {
          const err = await response.json();
          console.log('❌ Delete error:', err);
          msg = err.message || err.error?.message || msg;
        } catch (_) {
          const t = await response.text();
          console.log('❌ Delete error (text):', t);
          if (t) msg = t;
        }
        setError(msg);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setError('Failed to delete campaign');
    }
  };

  const handleSendCampaign = async () => {
    try {
      const { id } = await params;
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/newsletter/admin/campaigns/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCampaign(id);
      } else {
        setError('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      setError('Failed to send campaign');
    }
  };

  const handleCancelCampaign = async () => {
    try {
      const { id } = await params;
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/newsletter/admin/campaigns/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCampaign(id);
      } else {
        setError('Failed to cancel campaign');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      setError('Failed to cancel campaign');
    }
  };

  const handleSendTest = async () => {
    if (!testEmails.trim()) {
      setError('Please enter at least one test email address');
      return;
    }

    setSendingTest(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const emailList = testEmails.split(',').map(email => email.trim()).filter(email => email);
      
      const { id } = await params;
      const response = await fetch(`/api/newsletter/admin/campaigns/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testEmails: emailList
        })
      });

      if (response.ok) {
        setTestEmails('');
        alert('Test emails sent successfully!');
      } else {
        setError('Failed to send test emails');
      }
    } catch (error) {
      console.error('Error sending test emails:', error);
      setError('Failed to send test emails');
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return DocumentTextIcon;
      case 'scheduled': return ClockIcon;
      case 'sending': return PaperAirplaneIcon;
      case 'sent': return ChartBarIcon;
      case 'cancelled': return XMarkIcon;
      default: return DocumentTextIcon;
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Campaign Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!campaign) {
    return (
      <AdminLayout pageTitle="Campaign Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
          <p className="mt-2 text-gray-600">The campaign you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/newsletter/campaigns')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Campaigns
          </button>
        </div>
      </AdminLayout>
    );
  }

  const StatusIcon = getStatusIcon(campaign.status);

  return (
    <AdminLayout pageTitle={`Campaign: ${campaign.title}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Created by {campaign.authorId?.firstName} {campaign.authorId?.lastName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {campaign.status === 'draft' && (
              <>
                <button
                  onClick={async () => router.push(`/newsletter/campaigns/${(await params).id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleSendCampaign}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Now
                </button>
              </>
            )}
            {campaign.status === 'scheduled' && (
              <button
                onClick={handleCancelCampaign}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
            )}
            {(campaign.status === 'draft' || campaign.status === 'cancelled') && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Campaign Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{campaign.subject}</p>
                  </div>
                  {campaign.excerpt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                      <p className="mt-1 text-sm text-gray-900">{campaign.excerpt}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <div 
                      className="mt-1 prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: campaign.content }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Send Test */}
            {campaign.status === 'draft' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Send Test Email</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="testEmails" className="block text-sm font-medium text-gray-700">
                        Test Email Addresses
                      </label>
                      <input
                        type="text"
                        id="testEmails"
                        value={testEmails}
                        onChange={(e) => setTestEmails(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="test@example.com, another@example.com"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter email addresses separated by commas
                      </p>
                    </div>
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest || !testEmails.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      {sendingTest ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Stats */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Campaign Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Recipients</span>
                    <span className="text-sm font-medium text-gray-900">
                      {campaign.sendStats.totalRecipients.toLocaleString()}
                    </span>
                  </div>
                  {campaign.status === 'sent' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Sent</span>
                        <span className="text-sm font-medium text-green-600">
                          {campaign.sendStats.sentCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Failed</span>
                        <span className="text-sm font-medium text-red-600">
                          {campaign.sendStats.failedCount.toLocaleString()}
                        </span>
                      </div>
                      {campaign.sendStats.openedCount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Opened</span>
                          <span className="text-sm font-medium text-blue-600">
                            {campaign.sendStats.openedCount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {campaign.sendStats.clickedCount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Clicked</span>
                          <span className="text-sm font-medium text-purple-600">
                            {campaign.sendStats.clickedCount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Settings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{campaign.targetAudience}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{campaign.template}</p>
                  </div>
                  {campaign.scheduledAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Scheduled For</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(campaign.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(campaign.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {campaign.sentAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sent</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(campaign.sentAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {campaign.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaign.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recipients */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recipients</h3>
                  <button
                    onClick={() => {
                      setShowRecipients(!showRecipients);
                      if (!showRecipients && !recipients) {
                        params.then(({ id }) => fetchRecipients(id));
                      }
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    {showRecipients ? 'Hide' : 'View'} Recipients
                  </button>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">
                    {campaign.sendStats.totalRecipients.toLocaleString()} recipients
                  </span>
                </div>
                {showRecipients && recipients && (
                  <div className="mt-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {recipients.recipients.map((recipient, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {recipient.firstName} {recipient.lastName} ({recipient.email})
                        </div>
                      ))}
                    </div>
                    {recipients.pagination.hasMore && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing first {recipients.recipients.length} of {recipients.pagination.total} recipients
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Delete Campaign
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete &quot;{campaign.title}&quot;? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDeleteCampaign}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
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
