'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../../components/AdminLayout';
import { useToast } from '../../../components/ToastContext';
import CloudinaryUploader from '../../../components/CloudinaryUploader';

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  organizerId: string;
  category?: string;
  type: string;
  isFeatured: boolean;
  imageUrl?: string;
  requiresRegistration: boolean;
  registrationDeadline?: string;
  registrationFormLink?: string;
  featureOptions?: {
    showInNav?: boolean;
    navLabel?: string;
    navOrder?: number;
  };
}

export default function CreateEventPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxCapacity: 0,
    organizerId: '',
    category: '',
    type: 'workshop', // Set default value
    isFeatured: false,
    imageUrl: '',
    requiresRegistration: false,
    registrationDeadline: '',
    registrationFormLink: '',
    featureOptions: {
      showInNav: false,
      navLabel: '',
      navOrder: 0
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation with specific error messages
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }
    
    if (formData.title.trim().length < 2) {
      showError('Title must be at least 2 characters long');
      return;
    }
    
    if (formData.title.trim().length > 255) {
      showError('Title must be less than 255 characters');
      return;
    }
    
    if (!formData.description.trim()) {
      showError('Description is required');
      return;
    }
    
    if (formData.description.trim().length < 10) {
      showError('Description must be at least 10 characters long');
      return;
    }
    
    if (formData.description.trim().length > 5000) {
      showError('Description must be less than 5000 characters');
      return;
    }
    
    if (!formData.startDate) {
      showError('Start date is required');
      return;
    }
    
    if (!formData.endDate) {
      showError('End date is required');
      return;
    }
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      console.warn('Create Event validation failed: end date is before start date', {
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      showError('End date cannot be before start date');
      return;
    }
    
    if (!formData.location.trim()) {
      showError('Location is required');
      return;
    }
    
    if (formData.maxCapacity <= 0) {
      showError('Maximum capacity must be greater than 0');
      return;
    }
    
    if (!formData.type) {
      showError('Event type is required');
      return;
    }
    
    // Validate featured options if enabled
    if (formData.featureOptions?.showInNav) {
      if (!formData.featureOptions.navLabel || formData.featureOptions.navLabel.trim().length < 2) {
        showError('Navigation label must be at least 2 characters when "Show in Navigation Menu" is enabled');
        return;
      }
      
      if (formData.featureOptions.navLabel && formData.featureOptions.navLabel.length > 50) {
        showError('Navigation label must be less than 50 characters');
        return;
      }
      
      if (formData.featureOptions.navOrder !== undefined && formData.featureOptions.navOrder < 0) {
        showError('Navigation order must be 0 or greater');
        return;
      }
    }
    
    // Validate registration form link if provided
    if (formData.requiresRegistration && formData.registrationFormLink) {
      try {
        new URL(formData.registrationFormLink);
      } catch {
        showError('Registration form link must be a valid URL');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // Get the current user's ID from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // Prepare the request data with organizerId and proper date formatting
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const isSameDay = start.toDateString() === end.toDateString();
      if (isSameDay) {
        console.info('Create Event: same-day detected, normalizing end time to end-of-day');
        end.setHours(23, 59, 59, 999);
      }
      interface FeatureOptions { showInNav?: boolean; navLabel?: string; navOrder?: number }
      interface CreatePayload {
        title: string; description: string; startDate: string; endDate: string; location: string; maxCapacity: number; organizerId: string; category?: string; type: string; isFeatured: boolean; imageUrl?: string; requiresRegistration: boolean; registrationDeadline?: string; registrationFormLink?: string; featureOptions?: FeatureOptions; [key: string]: unknown;
      }
      const requestData: CreatePayload = {
        ...formData,
        organizerId: user?.id || '68a30681af3f3b7d9e2653a3', // Use user ID or fallback
        startDate: start.toISOString(),
        endDate: end.toISOString()
      };

      // Normalize registrationDeadline to ISO8601 only if provided and registration is required
      if (formData.requiresRegistration) {
        if (formData.registrationDeadline) {
          try {
            const regDeadlineIso = new Date(formData.registrationDeadline).toISOString();
            requestData.registrationDeadline = regDeadlineIso;
            console.info('Create Event: normalized registrationDeadline to ISO8601');
          } catch {
            // If parsing fails, leave validation to backend but don't send raw non-ISO
            delete requestData.registrationDeadline;
          }
        } else {
          delete requestData.registrationDeadline;
        }
        // Keep link only if non-empty
        if (!formData.registrationFormLink || formData.registrationFormLink.trim() === '') {
          delete requestData.registrationFormLink;
        }
      } else {
        // If registration not required, omit related fields entirely
        delete requestData.registrationDeadline;
        delete requestData.registrationFormLink;
      }
      
      // Remove empty category field to avoid validation issues
      if (!requestData.category || requestData.category.trim() === '') {
        delete requestData.category;
      }
      
      console.log('Creating event with data:', requestData);
      console.log('API URL:', `/api/events?t=${Date.now()}`);
      console.log('Token being sent:', token ? 'Token exists' : 'No token');
      console.log('Note: If still calling localhost:3001, please hard refresh (Ctrl+F5 or Cmd+Shift+R)');
      
      const response = await fetch(`/api/events?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        showSuccess('Event created successfully!');
        router.push('/events');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        // Handle different types of error responses
        let errorMessage = 'Failed to create event';
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error?.details?.errors && Array.isArray(errorData.error.details.errors)) {
          // Handle validation errors array
          const validationErrors = errorData.error.details.errors.map((err: { message: string }) => err.message).join(', ');
          errorMessage = validationErrors;
        } else if (errorData.error?.details?.message) {
          errorMessage = errorData.error.details.message;
        } else if (response.status === 400) {
          errorMessage = 'Invalid data provided. Please check all fields and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to create events.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showError('Network error while creating event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Create Event">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/events')}
            className="flex items-center space-x-2 text-black hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Events</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-black">Create New Event</h1>
            <p className="text-black">Add a new event, workshop, or activity</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Enter event title"
                    minLength={2}
                    maxLength={255}
                    required
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    <span className={formData.title.length > 255 ? 'text-red-500' : ''}>
                      {formData.title.length}/255
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  >
                    <option value="">Select Category</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="competition">Competition</option>
                    <option value="meeting">Meeting</option>
                    <option value="conference">Conference</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="competition">Competition</option>
                    <option value="networking">Networking</option>
                    <option value="showcase">Showcase</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="technical">Technical</option>
                    <option value="training">Training</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Describe the event, its objectives, and what participants can expect..."
                  minLength={10}
                  maxLength={5000}
                  required
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Minimum 10 characters required</span>
                  <span className={formData.description.length > 5000 ? 'text-red-500' : ''}>
                    {formData.description.length}/5000
                  </span>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Date and Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location and Capacity */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Location and Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="e.g., Engineering Building - Room 101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Maximum Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Enter max capacity"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Event Image */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Event Image</h3>
              <div className="space-y-4">
                <CloudinaryUploader
                  label="Upload Event Image"
                  folder="newtonbotics/events"
                  onUploadComplete={(result) => {
                    setFormData(prev => ({ ...prev, imageUrl: result.secureUrl }));
                  }}
                  showPreview={true}
                  previewWidth={300}
                  previewHeight={200}
                  maxFileSizeBytes={5 * 1024 * 1024} // 5MB limit
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Image uploaded successfully!</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Settings */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Registration Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresRegistration"
                    checked={formData.requiresRegistration}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresRegistration: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresRegistration" className="ml-2 block text-sm text-black">
                    This event requires registration
                  </label>
                </div>

                {formData.requiresRegistration && (
                  <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Registration Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.registrationDeadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Registration Form Link
                      </label>
                      <input
                        type="url"
                        value={formData.registrationFormLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationFormLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        placeholder="https://forms.google.com/..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Link to external registration form (Google Forms, etc.)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Options */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Featured Options</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-black">
                    Mark as Featured Event
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showInNav"
                    checked={formData.featureOptions?.showInNav || false}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      featureOptions: { 
                        ...prev.featureOptions, 
                        showInNav: e.target.checked,
                        navOrder: e.target.checked ? (prev.featureOptions?.navOrder || 0) : 0
                      } 
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showInNav" className="ml-2 block text-sm text-black">
                    Show in Navigation Menu
                  </label>
                </div>

                {formData.featureOptions?.showInNav && (
                  <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Navigation Label
                      </label>
                      <input
                        type="text"
                        value={formData.featureOptions?.navLabel || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          featureOptions: { 
                            ...prev.featureOptions, 
                            navLabel: e.target.value 
                          } 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        placeholder="e.g., Workshops, Competitions"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Label to display in navigation menu (max 50 characters)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Navigation Order
                      </label>
                      <input
                        type="number"
                        value={formData.featureOptions?.navOrder || 0}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          featureOptions: { 
                            ...prev.featureOptions, 
                            navOrder: parseInt(e.target.value) || 0 
                          } 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        placeholder="0"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Order in navigation menu (lower numbers appear first)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/events')}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
