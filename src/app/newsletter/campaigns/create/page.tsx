'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import RichTextEditor from '../../../../components/RichTextEditor';

interface CampaignFormData {
  title: string;
  subject: string;
  content: string;
  excerpt: string;
  targetAudience: 'all' | 'active' | 'inactive' | 'custom';
  template: 'default' | 'news' | 'announcement' | 'event' | 'custom';
  tags: string[];
  scheduledAt: string;
  customEmails: string[];
  excludeEmails: string[];
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    subject: '',
    content: '',
    excerpt: '',
    targetAudience: 'active',
    template: 'news',
    tags: [],
    scheduledAt: '',
    customEmails: [],
    excludeEmails: []
  });
  const [newTag, setNewTag] = useState('');
  const [newCustomEmail, setNewCustomEmail] = useState('');
  const [newExcludeEmail, setNewExcludeEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addCustomEmail = () => {
    if (newCustomEmail.trim() && !formData.customEmails.includes(newCustomEmail.trim())) {
      setFormData(prev => ({
        ...prev,
        customEmails: [...prev.customEmails, newCustomEmail.trim()]
      }));
      setNewCustomEmail('');
    }
  };

  const removeCustomEmail = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      customEmails: prev.customEmails.filter(email => email !== emailToRemove)
    }));
  };

  const addExcludeEmail = () => {
    if (newExcludeEmail.trim() && !formData.excludeEmails.includes(newExcludeEmail.trim())) {
      setFormData(prev => ({
        ...prev,
        excludeEmails: [...prev.excludeEmails, newExcludeEmail.trim()]
      }));
      setNewExcludeEmail('');
    }
  };

  const removeExcludeEmail = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      excludeEmails: prev.excludeEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Frontend: Creating campaign...');
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ Frontend: No token found');
        router.push('/');
        return;
      }

      // Clean up the form data before sending
      const cleanedFormData = {
        ...formData,
        scheduledAt: formData.scheduledAt || null, // Convert empty string to null
        excerpt: formData.excerpt || undefined, // Remove empty excerpt
        tags: formData.tags.length > 0 ? formData.tags : undefined, // Remove empty tags array
        customEmails: formData.customEmails.length > 0 ? formData.customEmails : undefined, // Remove empty array
        excludeEmails: formData.excludeEmails.length > 0 ? formData.excludeEmails : undefined // Remove empty array
      };

      console.log('📦 Frontend: Form data:', JSON.stringify(formData, null, 2));
      console.log('🧹 Frontend: Cleaned data:', JSON.stringify(cleanedFormData, null, 2));
      console.log('🌐 Frontend: Making request to /api/newsletter/admin/campaigns');

      const response = await fetch('/api/newsletter/admin/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedFormData)
      });

      console.log('📡 Frontend: Response status:', response.status);
      console.log('📡 Frontend: Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend: Successfully created campaign:', data);
        router.push(`/newsletter/campaigns/${data.data.campaign._id}`);
      } else {
        const errorData = await response.json();
        console.log('❌ Frontend: Error response:', errorData);
        
        if (errorData.error === 'VALIDATION_ERROR') {
          setError(`Validation Error: ${errorData.message}. Missing fields: ${errorData.missingFields?.join(', ')}`);
        } else if (errorData.error === 'BACKEND_API_NOT_AVAILABLE') {
          setError('Newsletter campaigns API is not implemented on the backend server. Please contact the development team to implement the required API endpoints.');
        } else {
          setError(errorData.message || 'Failed to create campaign');
        }
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    // This would be implemented after creating the campaign
    alert('Test email functionality will be available after creating the campaign');
  };

  const renderPreview = () => {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{formData.subject}</h2>
          <p className="text-sm text-gray-500 mt-1">{formData.excerpt}</p>
        </div>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This is a preview of how your newsletter will appear to recipients.
          </p>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout pageTitle="Create Newsletter Campaign">
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
            <h1 className="text-2xl font-bold text-gray-900">Create Newsletter Campaign</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSendTest}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              Send Test
            </button>
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

        {previewMode ? (
          renderPreview()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 campaign-form">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Monthly Newsletter - October 2023"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Exciting Updates from NewtonBotics"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                      Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      id="excerpt"
                      rows={2}
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Brief description of the newsletter content"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Content</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Newsletter Content *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                    placeholder="Write your newsletter content... Use toolbar to format."
                    className="mt-2"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    You can personalize with {'{{firstName}}'}, {'{{lastName}}'}, {'{{email}}'}
                  </p>
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Targeting & Settings</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                      Target Audience *
                    </label>
                    <select
                      name="targetAudience"
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="all">All Subscribers</option>
                      <option value="active">Active Subscribers Only</option>
                      <option value="inactive">Inactive Subscribers Only</option>
                      <option value="custom">Custom Email List</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                      Template *
                    </label>
                    <select
                      name="template"
                      id="template"
                      value={formData.template}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="default">Default</option>
                      <option value="news">News</option>
                      <option value="announcement">Announcement</option>
                      <option value="event">Event</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
                      Schedule Send (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      id="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Leave empty to save as draft. You can send immediately or schedule for later.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 block w-full border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Emails */}
            {formData.targetAudience === 'custom' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Custom Email List</h3>
                  <div className="space-y-2 mb-4">
                    {formData.customEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-900">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomEmail(email)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="email"
                      value={newCustomEmail}
                      onChange={(e) => setNewCustomEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEmail())}
                      className="flex-1 block w-full border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter email address"
                    />
                    <button
                      type="button"
                      onClick={addCustomEmail}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Exclude Emails */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Exclude Emails (Optional)</h3>
                <div className="space-y-2 mb-4">
                  {formData.excludeEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-900">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeExcludeEmail(email)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="email"
                    value={newExcludeEmail}
                    onChange={(e) => setNewExcludeEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludeEmail())}
                    className="flex-1 block w-full border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter email address to exclude"
                  />
                  <button
                    type="button"
                    onClick={addExcludeEmail}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
