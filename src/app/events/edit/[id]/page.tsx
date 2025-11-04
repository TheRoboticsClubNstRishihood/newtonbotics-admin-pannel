'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../../../components/AdminLayout';
import { useToast } from '../../../../components/ToastContext';
import CloudinaryUploader from '../../../../components/CloudinaryUploader';
import Image from 'next/image';

interface Event {
  _id: string;
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  maxCapacity: number;
  currentRegistrations: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  category: string;
  type: string;
  isFeatured: boolean;
  imageUrl?: string;
  requiresRegistration: boolean;
  registrationDeadline?: string;
  registrationFormLink?: string;
  links?: Array<{ label: string; url: string }>;
  sampleLinks?: Array<{ label: string; url: string }>;
  featureOptions?: {
    showInNav: boolean;
    navLabel?: string;
    navOrder: number;
  };
  registrations: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    registeredAt: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
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
  links?: Array<{ label: string; url: string }>;
  featureOptions?: {
    showInNav?: boolean;
    navLabel?: string;
    navOrder?: number;
  };
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxCapacity: 0,
    organizerId: '',
    category: '',
    type: '',
    isFeatured: false,
    imageUrl: '',
    requiresRegistration: false,
    registrationDeadline: '',
    registrationFormLink: '',
    links: [],
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
    
    if (params.id && params.id !== 'undefined') {
      // Validate MongoDB ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const idString = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!objectIdRegex.test(idString)) {
        console.error('Invalid event ID format:', idString);
        showError('Invalid event ID format');
        router.push('/events');
        return;
      }
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const eventId = params.id;
      console.log('Fetching event with ID:', eventId);
      
      const response = await fetch(`/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const eventData = data.data.item;
        setEvent(eventData);
        
        // Debug logging for time fields from backend
        console.log('Event data received from backend:', {
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          fullEventData: eventData
        });
        
        // Extract date from ISO8601 string (YYYY-MM-DD)
        const extractDate = (isoString: string): string => {
          if (!isoString) return '';
          // Handle both date-only and datetime formats
          return isoString.split('T')[0];
        };
        
        // Extract time from separate time field or from datetime string (HH:MM or HH:MM:SS)
        // Normalize to HH:MM:SS format for HTML time input compatibility
        const extractTime = (timeString: string | undefined, isoString?: string): string => {
          if (timeString) {
            // If separate time field exists, use it (format: HH:MM or HH:MM:SS)
            // Normalize to HH:MM:SS for HTML time input with step="1"
            let extracted = timeString.length <= 8 ? timeString : timeString.substring(0, 8);
            // If format is HH:MM (5 chars), convert to HH:MM:SS for HTML time input
            if (extracted.length === 5) {
              extracted = extracted + ':00';
            }
            console.log('Extracted time from separate field:', { timeString, extracted });
            return extracted;
          }
          // Fallback: try to extract from datetime string (for backward compatibility)
          if (isoString && isoString.includes('T')) {
            const timePart = isoString.split('T')[1];
            if (timePart) {
              // Remove timezone and milliseconds, keep HH:MM or HH:MM:SS
              let extracted = timePart.split(/[\.\+\-Z]/)[0];
              extracted = extracted.length <= 8 ? extracted : extracted.substring(0, 8);
              // Normalize to HH:MM:SS if needed
              if (extracted.length === 5) {
                extracted = extracted + ':00';
              }
              console.log('Extracted time from datetime string:', { isoString, timePart, extracted });
              return extracted;
            }
          }
          console.log('No time found:', { timeString, isoString });
          return '';
        };
        
        const extractedStartTime = extractTime(eventData.startTime, eventData.startDate);
        const extractedEndTime = extractTime(eventData.endTime, eventData.endDate);
        
        console.log('Extracted times for form:', {
          startTime: extractedStartTime,
          endTime: extractedEndTime
        });
        
        setFormData({
          title: eventData.title,
          description: eventData.description,
          startDate: extractDate(eventData.startDate),
          endDate: extractDate(eventData.endDate),
          startTime: extractedStartTime,
          endTime: extractedEndTime,
          location: eventData.location,
          maxCapacity: eventData.maxCapacity,
          organizerId: eventData.organizerId,
          category: eventData.category,
          type: eventData.type,
          isFeatured: eventData.isFeatured,
          imageUrl: eventData.imageUrl || '',
          requiresRegistration: eventData.requiresRegistration || false,
          registrationDeadline: eventData.registrationDeadline ? extractDate(eventData.registrationDeadline) : '',
          registrationFormLink: eventData.registrationFormLink || '',
          links: Array.isArray(eventData.links)
            ? eventData.links
            : (Array.isArray((eventData as any).sampleLinks) ? (eventData as any).sampleLinks : []),
          featureOptions: eventData.featureOptions || {
            showInNav: false,
            navLabel: '',
            navOrder: 0
          }
        });
      } else {
        if (response.status === 401) {
          // Token expired or invalid: clear auth and redirect to login for security
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          showError('Your session has expired for security reasons. Please log in again to continue.');
          router.push('/');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error response:', errorData);
        showError(`Failed to fetch event: ${errorData.error?.message || errorData.message || `HTTP ${response.status}`}`);
        router.push('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      showError('Network error while fetching event');
      router.push('/events');
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // Validate that both times are provided together, or neither
    const hasStartTime = formData.startTime && formData.startTime.trim() !== '';
    const hasEndTime = formData.endTime && formData.endTime.trim() !== '';
    
    if (hasStartTime && !hasEndTime) {
      showError('Both start time and end time must be provided together');
      return;
    }
    
    if (!hasStartTime && hasEndTime) {
      showError('Both start time and end time must be provided together');
      return;
    }
    
    // Validate time format if provided (HH:MM or HH:MM:SS)
    if (hasStartTime) {
      const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!timePattern.test(formData.startTime!)) {
        showError('Start time must be in HH:MM or HH:MM:SS format (24-hour, e.g., 14:00 or 14:00:00)');
        return;
      }
    }
    
    if (hasEndTime) {
      const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!timePattern.test(formData.endTime!)) {
        showError('End time must be in HH:MM or HH:MM:SS format (24-hour, e.g., 16:00 or 16:00:00)');
        return;
      }
    }
    
    // Validate that end date is after start date
    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(formData.endDate);
    
    if (endDateObj < startDateObj) {
      console.warn('Edit Event validation failed: end date is before start date', {
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      showError('End date must be after start date');
      return;
    }
    
    // Validate full datetime: end datetime must be after start datetime
    if (hasStartTime && hasEndTime) {
      // Both times provided - check full datetime
      if (formData.startDate === formData.endDate) {
        // Same date - end time must be after start time
        const startTimeValue = formData.startTime!.replace(/:/g, '');
        const endTimeValue = formData.endTime!.replace(/:/g, '');
        // Pad to 6 digits if needed (HHMM -> HHMM00)
        const startPadded = startTimeValue.length === 4 ? startTimeValue + '00' : startTimeValue;
        const endPadded = endTimeValue.length === 4 ? endTimeValue + '00' : endTimeValue;
        if (endPadded <= startPadded) {
          showError('End time must be after start time when dates are the same');
          return;
        }
      } else {
        // Different dates - if end date equals start date (shouldn't happen after first check), still validate
        // But if end date is after start date, any times are valid
        // This case is already handled by the date check above
      }
    } else if (!hasStartTime && !hasEndTime) {
      // No times provided - only date validation needed (already done above)
      // If dates are same and no times, that's valid (all-day same-day event)
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

    // Validate links array if present
    if (formData.links && formData.links.length > 0) {
      for (const [index, link] of formData.links.entries()) {
        if (!link.label || link.label.trim().length < 2) {
          showError(`Link #${index + 1} label must be at least 2 characters`);
          return;
        }
        try {
          new URL(link.url);
        } catch {
          showError(`Link #${index + 1} URL must be valid`);
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

      // Get the current user's ID from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // Prepare the request data with organizerId and proper date/time formatting
      interface FeatureOptions { showInNav?: boolean; navLabel?: string; navOrder?: number }
      interface UpdatePayload {
        title?: string; description?: string; startDate?: string; endDate?: string; startTime?: string; endTime?: string; location?: string; maxCapacity?: number; organizerId?: string; category?: string; type?: string; isFeatured?: boolean; imageUrl?: string; requiresRegistration?: boolean; registrationDeadline?: string; registrationFormLink?: string; sampleLinks?: Array<{ label: string; url: string }>; featureOptions?: FeatureOptions; [key: string]: unknown;
      }
      
      // Handle time fields: always include them in the update request
      // Backend requires both times together, or empty strings to clear them
      const hasStartTime = formData.startTime && formData.startTime.trim() !== '';
      const hasEndTime = formData.endTime && formData.endTime.trim() !== '';
      
      // Normalize time format to HH:MM (remove seconds if present) to match backend preference
      const normalizeTime = (time: string): string => {
        if (!time || time.trim() === '') return '';
        const trimmed = time.trim();
        // If format is HH:MM:SS, convert to HH:MM
        if (trimmed.length === 8 && trimmed.includes(':')) {
          return trimmed.substring(0, 5); // Extract HH:MM from HH:MM:SS
        }
        // If already HH:MM, return as-is
        return trimmed;
      };
      
      // Determine what to send for time fields
      let startTimeValue = '';
      let endTimeValue = '';
      
      if (hasStartTime && hasEndTime) {
        // Both times provided - normalize and send them
        startTimeValue = normalizeTime(formData.startTime!);
        endTimeValue = normalizeTime(formData.endTime!);
      } else {
        // At least one time is missing - send empty strings to clear existing times
        startTimeValue = '';
        endTimeValue = '';
      }
      
      // Build request data, explicitly handling time fields
      const requestData: UpdatePayload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: startTimeValue, // Always include, even if empty string
        endTime: endTimeValue, // Always include, even if empty string
        location: formData.location,
        maxCapacity: formData.maxCapacity,
        organizerId: user?.id || '68a30681af3f3b7d9e2653a3',
        category: formData.category,
        type: formData.type,
        isFeatured: formData.isFeatured,
        imageUrl: formData.imageUrl,
        requiresRegistration: formData.requiresRegistration,
        registrationDeadline: formData.registrationDeadline,
        registrationFormLink: formData.registrationFormLink,
        sampleLinks: formData.links && formData.links.length ? formData.links : undefined,
        featureOptions: formData.featureOptions
      };
      
      // Ensure time fields are explicitly included in the payload
      console.log('=== TIME FIELDS DEBUG ===');
      console.log('Form data times:', {
        rawStartTime: formData.startTime,
        rawEndTime: formData.endTime,
        hasStartTime,
        hasEndTime
      });
      console.log('Normalized times being sent:', {
        startTime: requestData.startTime,
        endTime: requestData.endTime,
        startTimeType: typeof requestData.startTime,
        endTimeType: typeof requestData.endTime,
        startTimeLength: requestData.startTime?.length,
        endTimeLength: requestData.endTime?.length
      });
      console.log('Full request payload:', JSON.stringify(requestData, null, 2));
      console.log('=== END TIME FIELDS DEBUG ===');

      // Normalize registrationDeadline to ISO8601 only if provided and registration is required
      if (formData.requiresRegistration) {
        if (formData.registrationDeadline) {
          try {
            const regDeadlineIso = new Date(formData.registrationDeadline).toISOString();
            requestData.registrationDeadline = regDeadlineIso;
            console.info('Edit Event: normalized registrationDeadline to ISO8601');
          } catch {
            delete requestData.registrationDeadline;
          }
        } else {
          delete requestData.registrationDeadline;
        }
        if (!formData.registrationFormLink || formData.registrationFormLink.trim() === '') {
          delete requestData.registrationFormLink;
        }
      } else {
        delete requestData.registrationDeadline;
        delete requestData.registrationFormLink;
      }
      
      const eventId = params.id;
      console.log('Updating event with ID:', eventId);
      console.log('Update data:', requestData);
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (response.ok) {
        console.log('=== UPDATE RESPONSE DEBUG ===');
        console.log('Update response received:', responseData);
        if (responseData.data && responseData.data.item) {
          console.log('Updated event times in response:', {
            startTime: responseData.data.item.startTime,
            endTime: responseData.data.item.endTime,
            startDate: responseData.data.item.startDate,
            endDate: responseData.data.item.endDate
          });
        } else {
          console.warn('Response data structure:', responseData);
        }
        console.log('=== END UPDATE RESPONSE DEBUG ===');
        showSuccess('Event updated successfully!');
        router.push('/events');
      } else {
        if (response.status === 401) {
          // Token expired or invalid: clear auth and redirect to login for security
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          showError('Your session has expired for security reasons. Please log in again to continue.');
          router.push('/');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        // Handle different types of error responses
        let errorMessage = 'Failed to update event';
        
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
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to update events.';
        } else if (response.status === 404) {
          errorMessage = 'Event not found.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showError('Network error while updating event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Event">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-2 text-black">Loading event...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout pageTitle="Edit Event">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-black">Event not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Edit Event">
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
            <h1 className="text-2xl font-bold text-black">Edit Event</h1>
            <p className="text-black">Update event details and information</p>
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
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: HH:MM or HH:MM:SS (24-hour, e.g., 14:00 or 14:00:00)</p>
                  <p className="text-xs text-gray-500 mt-1">Both start and end times must be provided together, or leave both empty to clear</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: HH:MM or HH:MM:SS (24-hour, e.g., 16:00 or 16:00:00)</p>
                  <p className="text-xs text-gray-500 mt-1">Both start and end times must be provided together, or leave both empty to clear</p>
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
                  {event.currentRegistrations > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Current registrations: {event.currentRegistrations}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Event Image */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Event Image</h3>
              <div className="space-y-4">
                {formData.imageUrl && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-black mb-2">Current Image:</p>
                    <div className="relative">
                      <Image
                        src={formData.imageUrl.includes('cloudinary.com') 
                          ? formData.imageUrl.replace(/\.(tiff|tif)$/i, '.jpg') + '?f_auto,q_auto'
                          : formData.imageUrl}
                        alt="Current event image"
                        width={240}
                        height={160}
                        className="w-64 h-40 object-cover rounded-lg border"
                        onError={(e) => {
                          console.log('Current image failed to load:', formData.imageUrl);
                          console.log('Trying fallback URL...');
                          // Try original URL as fallback
                          if (formData.imageUrl && e.currentTarget.src !== formData.imageUrl) {
                            e.currentTarget.src = formData.imageUrl;
                            return;
                          }
                          // If still fails, show placeholder
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="w-64 h-40 bg-gray-100 border border-gray-300 rounded-lg items-center justify-center hidden"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center text-gray-500">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Image failed to load</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Current Image
                    </button>
                  </div>
                )}
                <CloudinaryUploader
                  label={formData.imageUrl ? "Replace Event Image" : "Upload Event Image"}
                  folder="newtonbotics/events"
                  onUploadComplete={(result) => {
                    setFormData(prev => ({ ...prev, imageUrl: result.secureUrl }));
                  }}
                  showPreview={true}
                  previewWidth={300}
                  previewHeight={200}
                  maxFileSizeBytes={5 * 1024 * 1024} // 5MB limit
                />
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

            {/* Helpful Links */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Helpful Links</h3>
              <div className="space-y-4">
                {(formData.links && formData.links.length > 0 ? formData.links : []).map((link, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Label</label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => setFormData(prev => {
                          const links = [...(prev.links || [])];
                          links[idx] = { ...links[idx], label: e.target.value } as { label: string; url: string };
                          return { ...prev, links };
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        placeholder="e.g., Practice Questions"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => setFormData(prev => {
                          const links = [...(prev.links || [])];
                          links[idx] = { ...links[idx], url: e.target.value } as { label: string; url: string };
                          return { ...prev, links };
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        placeholder="https://example.com/..."
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-between">
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={() => setFormData(prev => {
                          const links = [...(prev.links || [])];
                          links.splice(idx, 1);
                          return { ...prev, links };
                        })}
                      >
                        Remove
                      </button>
                      {idx === (formData.links?.length || 0) - 1 && (
                        <button
                          type="button"
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                          onClick={() => setFormData(prev => ({ ...prev, links: [...(prev.links || []), { label: '', url: '' }] }))}
                        >
                          Add another link
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!formData.links || formData.links.length === 0) && (
                  <div>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                      onClick={() => setFormData(prev => ({ ...prev, links: [{ label: '', url: '' }] }))}
                    >
                      Add a link
                    </button>
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
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
