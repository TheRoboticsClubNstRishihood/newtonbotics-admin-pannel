'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../../../components/AdminLayout';
import { useToast } from '../../../../components/ToastContext';

interface NewsCategory {
  _id: string;
  id?: string; // For compatibility
  name: string;
  description: string;
  createdAt: string;
}

interface NewsArticle {
  _id: string;
  id?: string; // For compatibility
  title: string;
  content: string;
  excerpt?: string;
  authorId: {
    _id: string;
    id?: string; // For compatibility
    firstName?: string;
    lastName?: string;
  };
  categoryId: {
    _id: string;
    id?: string; // For compatibility
    name: string;
    description: string;
  };
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  featuredImageUrl?: string;
  featureOptions: {
    showInNav: boolean;
    navOrder: number;
    navLabel?: string;
  };
  viewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  application?: {
    isEnabled: boolean;
    type: 'workshop' | 'event' | 'competition' | 'other';
    requireLogin: boolean;
    formApplyStartDate?: string;
    formApplyLastDate?: string;
    maxApplicants?: number;
    targetType: 'Workshop' | 'Event' | 'Competition' | 'Other';
    targetId?: string;
    formLink?: string;
  };
}

interface NewsFormData {
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  categoryId: string;
  isPublished: boolean;
  featureOptions: {
    showInNav: boolean;
    navOrder: number;
    featuredImage: string;
  };
  tags: string[];
  application: {
    isEnabled: boolean;
    type: 'workshop' | 'event' | 'competition' | 'other';
    requireLogin: boolean;
    formApplyStartDate?: string;
    formApplyLastDate?: string;
    maxApplicants?: number;
    targetType: 'Workshop' | 'Event' | 'Competition' | 'Other';
    targetId?: string;
    formLink?: string;
  };
}

export default function EditNews() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    content: '',
    excerpt: '',
    authorId: '68a30681af3f3b7d9e2653a3', // Default author ID from backend
    categoryId: '',
    isPublished: false,
    featureOptions: {
      showInNav: false,
      navOrder: 0,
      featuredImage: ''
    },
    tags: [],
    application: {
      isEnabled: false,
      type: 'other',
      requireLogin: false,
      formApplyStartDate: undefined,
      formApplyLastDate: undefined,
      maxApplicants: undefined,
      targetType: 'Other',
      targetId: undefined,
      formLink: undefined
    }
  });

  const articleId = params.id as string;

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
    console.log('Application data:', formData.application);
  }, [formData]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    console.log('User authenticated, fetching article and categories');
    fetchArticleAndCategories();
  }, [articleId]);

  const fetchArticleAndCategories = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // Fetch article and categories in parallel
      const [articleResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/news/${articleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/news/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('Article response status:', articleResponse.status);
      console.log('Categories response status:', categoriesResponse.status);

      if (articleResponse.ok && categoriesResponse.ok) {
        const articleData = await articleResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        console.log('Article data:', articleData);
        console.log('Categories data:', categoriesData);
        console.log('Fetched article application data:', articleData.data?.item?.application);
        
        const fetchedArticle = articleData.data?.item || articleData.item;
        setArticle(fetchedArticle);
        setCategories(categoriesData.data?.categories || categoriesData.categories || []);

        // Populate form with article data
        setFormData({
          title: fetchedArticle.title,
          content: fetchedArticle.content,
          excerpt: fetchedArticle.excerpt || '',
          authorId: fetchedArticle.authorId?._id || fetchedArticle.authorId?.id || fetchedArticle.authorId || '',
          categoryId: fetchedArticle.categoryId?._id || fetchedArticle.categoryId?.id || fetchedArticle.categoryId || '',
          isPublished: fetchedArticle.isPublished,
          featureOptions: {
            showInNav: fetchedArticle.featureOptions?.showInNav || false,
            navOrder: fetchedArticle.featureOptions?.navOrder || 0,
            featuredImage: fetchedArticle.featuredImageUrl || ''
          },
          tags: fetchedArticle.tags || [],
          application: {
            isEnabled: fetchedArticle.application?.isEnabled || false,
            type: fetchedArticle.application?.type || 'other',
            requireLogin: fetchedArticle.application?.requireLogin || false,
            formApplyStartDate: fetchedArticle.application?.formApplyStartDate ? new Date(fetchedArticle.application.formApplyStartDate).toISOString().slice(0, 16) : undefined,
            formApplyLastDate: fetchedArticle.application?.formApplyLastDate ? new Date(fetchedArticle.application.formApplyLastDate).toISOString().slice(0, 16) : undefined,
            maxApplicants: fetchedArticle.application?.maxApplicants || undefined,
            targetType: fetchedArticle.application?.targetType || 'Other',
            targetId: fetchedArticle.application?.targetId || undefined,
            formLink: fetchedArticle.application?.formLink || undefined
          }
        });
      } else {
        console.log('Backend responses:', {
          article: articleResponse.status,
          categories: categoriesResponse.status
        });
        
        if (articleResponse.status === 404) {
          showError('Article not found');
        } else {
          showError(`Failed to fetch article data (${articleResponse.status})`);
        }
      }
    } catch (error) {
      console.error('Error fetching article data:', error);
      showError('Network error while fetching article data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateFormData = (data: any) => {
    const errors: string[] = [];
    
    // Check for basic field issues
    if (data.title && data.title.length > 255) {
      errors.push('Title is too long (max 255 characters)');
    }
    if (data.content && data.content.length > 10000) {
      errors.push('Content is too long (max 10,000 characters)');
    }
    
    // Check form link if provided
    if (data.application?.formLink) {
      try {
        new URL(data.application.formLink);
      } catch (error) {
        errors.push('Application form link has invalid format');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      showError('Please fill in all required fields');
      return;
    }

    // Additional validation
    if (formData.title.length < 5) {
      showError('Title must be at least 5 characters long');
      return;
    }

    if (formData.content.length < 20) {
      showError('Content must be at least 20 characters long');
      return;
    }

    // Validate application dates if enabled
    if (formData.application.isEnabled) {
      if (formData.application.formApplyStartDate && formData.application.formApplyLastDate) {
        const startDate = new Date(formData.application.formApplyStartDate);
        const lastDate = new Date(formData.application.formApplyLastDate);
        
        if (startDate >= lastDate) {
          showError('Application end date must be after start date');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // Prepare data according to backend expectations - only send fields that are being updated
      const requestData: any = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.title,
        authorId: formData.authorId,
        categoryId: formData.categoryId,
        isPublished: formData.isPublished,
        tags: formData.tags,
        featureOptions: {
          showInNav: formData.featureOptions.showInNav,
          navLabel: formData.title,
          navOrder: formData.featureOptions.navOrder
        }
      };

      // Add featured image if provided
      if (formData.featureOptions.featuredImage) {
        requestData.featuredImageUrl = formData.featureOptions.featuredImage;
      }

      // Add publishedAt if publishing
      if (formData.isPublished) {
        requestData.publishedAt = new Date().toISOString();
      }

      // Add application data if enabled
      if (formData.application.isEnabled) {
        const applicationData: any = {
          isEnabled: true,
          type: formData.application.type,
          requireLogin: formData.application.requireLogin,
          targetType: formData.application.targetType
        };

        // Add new date fields
        if (formData.application.formApplyStartDate) {
          applicationData.formApplyStartDate = new Date(formData.application.formApplyStartDate).toISOString();
        }
        if (formData.application.formApplyLastDate) {
          applicationData.formApplyLastDate = new Date(formData.application.formApplyLastDate).toISOString();
        }

        // Add optional fields only if they have values
        if (formData.application.maxApplicants && formData.application.maxApplicants > 0) {
          applicationData.maxApplicants = formData.application.maxApplicants;
        }
        if (formData.application.targetId) {
          applicationData.targetId = formData.application.targetId;
        }
        
        // Form link
        if (formData.application.formLink) {
          applicationData.formLink = formData.application.formLink;
        }

        requestData.application = applicationData;
      } else {
        // If application is disabled, send minimal application data
        requestData.application = {
          isEnabled: false,
          type: 'other',
          requireLogin: false,
          targetType: 'Other'
        };
      }

      // Clean up the request data to remove undefined values
      const cleanRequestData = Object.fromEntries(
        Object.entries(requestData).filter(([_, value]) => value !== undefined)
      );
      
      // Validate the data before sending
      const validationErrors = validateFormData(cleanRequestData);
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        showError(`Validation errors: ${validationErrors.join(', ')}`);
        return;
      }
      
      console.log('Sending update request data:', cleanRequestData);
      console.log('Application data being sent:', (cleanRequestData as any).application);
      console.log('Form fields being sent:', (cleanRequestData as any).application?.formFields);
      console.log('Current window location:', window.location.href);
      console.log('Making fetch request to:', `/api/news/${articleId}`);
      
      const response = await fetch(`/api/news/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanRequestData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        showSuccess('Article updated successfully!');
        router.push('/news');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        console.log('Full error details:', errorData.error);
        console.log('Error stack:', errorData.error?.stack);
        showError(`Failed to update article: ${errorData.error?.message || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating article:', error);
      showError('Network error while updating article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit News Article">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading article...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!article) {
    return (
      <AdminLayout pageTitle="Edit News Article">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-600">Article not found</p>
              <button
                onClick={() => router.push('/news')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Back to News
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Edit News Article">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to News</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit News Article</h1>
              <p className="text-gray-600">Update the article: {article.title}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Article Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter article title..."
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter the article content..."
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter a brief excerpt or summary..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Brief summary of the article (optional)
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id || category.id} value={category._id || category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="workshop, ai, machine learning"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate tags with commas
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featureOptions.featuredImage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  featureOptions: { ...prev.featureOptions, featuredImage: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Publishing Options */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h4>
              
              <div className="space-y-4">
                {/* Published Status */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                  </label>
                </div>

                {/* Navigation Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featureOptions.showInNav}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        featureOptions: { ...prev.featureOptions, showInNav: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show in Navigation</span>
                  </label>
                  
                  {formData.featureOptions.showInNav && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Navigation Order
                      </label>
                      <input
                        type="number"
                        value={formData.featureOptions.navOrder}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          featureOptions: { ...prev.featureOptions, navOrder: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Application Options */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Application Options</h4>
              
              <div className="space-y-4">
                {/* Application Status */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.application.isEnabled}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        application: { ...prev.application, isEnabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Application Form</span>
                  </label>
                </div>

                {formData.application.isEnabled && (
                  <>
                    {/* Application Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Type
                      </label>
                      <select
                        value={formData.application.type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, type: e.target.value as 'workshop' | 'event' | 'competition' | 'other' }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      >
                        <option value="workshop">Workshop</option>
                        <option value="event">Event</option>
                        <option value="competition">Competition</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Application Require Login */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.application.requireLogin}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            application: { ...prev.application, requireLogin: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require Login for Application</span>
                      </label>
                    </div>

                    {/* Application Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.application.formApplyStartDate || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, formApplyStartDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        When applications can start being submitted
                      </p>
                    </div>

                    {/* Application End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.application.formApplyLastDate || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, formApplyLastDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        When applications close (deadline)
                      </p>
                    </div>

                    {/* Application Max Applicants */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Applicants
                      </label>
                      <input
                        type="number"
                        value={formData.application.maxApplicants || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, maxApplicants: parseInt(e.target.value) || undefined }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="e.g., 30"
                        min="1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Maximum number of applicants allowed (optional)
                      </p>
                    </div>

                    {/* Application Target Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Type
                      </label>
                      <select
                        value={formData.application.targetType}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, targetType: e.target.value as 'Workshop' | 'Event' | 'Competition' | 'Other' }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Event">Event</option>
                        <option value="Competition">Competition</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Application Target ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target ID (e.g., workshop ID, event ID)
                      </label>
                      <input
                        type="text"
                        value={formData.application.targetId || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, targetId: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="Enter target ID"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Link to a specific workshop, event, or competition
                      </p>
                    </div>

                    {/* Application Form Link */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Form Link
                      </label>
                      <input
                        type="url"
                        value={formData.application.formLink || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application: { ...prev.application, formLink: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="https://example.com/application-form"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Enter a direct link to the application form (optional)
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Application Form Preview
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>When enabled, users will see an application form at the bottom of this news article.</p>
                            <p className="mt-1">The form will include all the fields you've configured above.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Form Management */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      application: {
                        ...prev.application,
                        formLink: undefined
                      }
                    }));
                  }}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Clear Form Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaultLink = "https://example.com/application-form";
                    setFormData(prev => ({
                      ...prev,
                      application: {
                        ...prev.application,
                        formLink: defaultLink
                      }
                    }));
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Load Default Form Link
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Article'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
