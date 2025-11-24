'use client';

import { useState, useEffect } from 'react';
import {
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import CloudinaryUploader from './CloudinaryUploader';

interface ProjectMedia {
  imageUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
}

interface ProjectMediaFormProps {
  projectId: string;
  initialMedia?: ProjectMedia;
  onSuccess?: (media: ProjectMedia) => void;
  onError?: (error: string) => void;
}

export default function ProjectMediaForm({
  projectId,
  initialMedia,
  onSuccess,
  onError,
}: ProjectMediaFormProps) {
  const [formData, setFormData] = useState<ProjectMedia>({
    imageUrl: initialMedia?.imageUrl || '',
    videoUrl: initialMedia?.videoUrl || '',
    githubUrl: initialMedia?.githubUrl || '',
    documentationUrl: initialMedia?.documentationUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when initialMedia changes
  useEffect(() => {
    if (initialMedia) {
      setFormData({
        imageUrl: initialMedia.imageUrl || '',
        videoUrl: initialMedia.videoUrl || '',
        githubUrl: initialMedia.githubUrl || '',
        documentationUrl: initialMedia.documentationUrl || '',
      });
    }
  }, [initialMedia]);

  // Validate URL formats
  const validateUrl = (url: string, type: 'image' | 'video' | 'github' | 'documentation'): string | null => {
    if (!url || url.trim() === '') return null; // Empty is allowed (for clearing)

    try {
      const urlObj = new URL(url);
      
      switch (type) {
        case 'image':
          const imageExt = /\.(jpg|jpeg|png|gif|webp)$/i;
          if (!imageExt.test(urlObj.pathname)) {
            return 'Image URL must end with .jpg, .jpeg, .png, .gif, or .webp';
          }
          break;
        
        case 'video':
          const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/i;
          const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo\.com\//i;
          const dailymotionPattern = /^(https?:\/\/)?(www\.)?dailymotion\.com\//i;
          
          if (!youtubePattern.test(url) && !vimeoPattern.test(url) && !dailymotionPattern.test(url)) {
            return 'Video URL must be from YouTube, Vimeo, or Dailymotion';
          }
          break;
        
        case 'github':
          const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/.+/i;
          if (!githubPattern.test(url)) {
            return 'GitHub URL must be a valid GitHub repository URL';
          }
          break;
        
        case 'documentation':
          // Any valid HTTP/HTTPS URL is acceptable
          break;
      }
      
      return null;
    } catch {
      return 'Invalid URL format';
    }
  };

  const handleInputChange = (field: keyof ProjectMedia, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    
    // Clear success message when user starts editing
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Validate URLs
      const errors: Record<string, string> = {};
      
      if (formData.imageUrl) {
        const imageError = validateUrl(formData.imageUrl, 'image');
        if (imageError) errors.imageUrl = imageError;
      }
      
      if (formData.videoUrl) {
        const videoError = validateUrl(formData.videoUrl, 'video');
        if (videoError) errors.videoUrl = videoError;
      }
      
      if (formData.githubUrl) {
        const githubError = validateUrl(formData.githubUrl, 'github');
        if (githubError) errors.githubUrl = githubError;
      }
      
      if (formData.documentationUrl) {
        const docError = validateUrl(formData.documentationUrl, 'documentation');
        if (docError) errors.documentationUrl = docError;
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      // Prepare payload - only include fields that have values or are being cleared
      const payload: ProjectMedia = {};
      
      if (formData.imageUrl !== undefined) {
        payload.imageUrl = formData.imageUrl || '';
      }
      if (formData.videoUrl !== undefined) {
        payload.videoUrl = formData.videoUrl || '';
      }
      if (formData.githubUrl !== undefined) {
        payload.githubUrl = formData.githubUrl || '';
      }
      if (formData.documentationUrl !== undefined) {
        payload.documentationUrl = formData.documentationUrl || '';
      }

      const response = await fetch(`/api/projects/${projectId}/media`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = 
          data.error?.message || 
          data.message || 
          'Failed to update project media';
        
        // Handle validation errors from backend
        if (data.error?.details?.errors) {
          const backendErrors: Record<string, string> = {};
          data.error.details.errors.forEach((err: { field: string; message: string }) => {
            backendErrors[err.field] = err.message;
          });
          setValidationErrors(backendErrors);
        }
        
        throw new Error(errorMessage);
      }

      setSuccess(true);
      
      // Call success callback if provided
      if (onSuccess && data.data?.media) {
        onSuccess(data.data.media);
      } else if (onSuccess) {
        onSuccess(payload);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Project media updated successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Image URL
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="relative">
            <PhotoIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              className={`w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                validationErrors.imageUrl
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <CloudinaryUploader
              label={formData.imageUrl ? 'Replace Image' : 'Upload Image'}
              folder="newtonbotics/projects/images"
              resourceType="image"
              onUploadComplete={(res) => handleInputChange('imageUrl', res.secureUrl || res.url)}
              showPreview={false}
            />
            <p className="text-xs text-gray-500 mt-1">You can paste a URL or upload an image.</p>
          </div>
        </div>
        {validationErrors.imageUrl && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.imageUrl}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must be a valid image URL ending with .jpg, .jpeg, .png, .gif, or .webp
        </p>
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL
        </label>
        <div className="relative">
          <VideoCameraIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            className={`w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              validationErrors.videoUrl
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
          />
        </div>
        {validationErrors.videoUrl && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.videoUrl}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must be from YouTube, Vimeo, or Dailymotion. Leave empty to clear.
        </p>
      </div>

      {/* GitHub URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Repository
        </label>
        <div className="relative">
          <CodeBracketIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => handleInputChange('githubUrl', e.target.value)}
            className={`w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              validationErrors.githubUrl
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="https://github.com/username/repository"
          />
        </div>
        {validationErrors.githubUrl && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.githubUrl}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must be a valid GitHub repository URL. Leave empty to clear.
        </p>
      </div>

      {/* Documentation URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documentation URL
        </label>
        <div className="relative">
          <DocumentTextIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="url"
            value={formData.documentationUrl}
            onChange={(e) => handleInputChange('documentationUrl', e.target.value)}
            className={`w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              validationErrors.documentationUrl
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="https://docs.example.com"
          />
        </div>
        {validationErrors.documentationUrl && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.documentationUrl}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Any valid HTTP/HTTPS URL. Leave empty to clear.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Updating...</span>
            </>
          ) : (
            <span>Update Media</span>
          )}
        </button>
      </div>
    </form>
  );
}

