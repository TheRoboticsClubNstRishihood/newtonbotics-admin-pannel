'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ApplicationFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'url' | 'number';
  required: boolean;
  options?: string[];
}

interface ApplicationSubmissionResponseItem {
  fieldName: string;
  value: string | number | boolean;
}

interface ApplicationSubmission {
  fullName: string;
  email: string;
  phone: string;
  responses: ApplicationSubmissionResponseItem[];
}

interface ApplicationFormProps {
  newsId: string;
  isEnabled: boolean;
  type: 'workshop' | 'event' | 'competition' | 'other';
  requireLogin: boolean;
  deadline?: string;
  maxApplicants?: number;
  formFields: ApplicationFormField[];
  onSubmit?: (formData: ApplicationSubmission) => Promise<void>;
  isLoggedIn?: boolean;
}

export default function NewsApplicationForm({
  newsId,
  isEnabled,
  type,
  requireLogin,
  deadline,
  maxApplicants,
  formFields,
  onSubmit,
  isLoggedIn = false
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isEnabled) {
    return null;
  }

  // Check if login is required but user is not logged in
  if (requireLogin && !isLoggedIn) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Login Required
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Please log in to apply for this {type}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if deadline has passed
  if (deadline && new Date(deadline) < new Date()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Application Closed
            </h3>
            <p className="text-sm text-red-700 mt-1">
              The application deadline has passed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Prepare the application data according to the API specification
      const applicationData: ApplicationSubmission = {
        fullName: String(formData.fullName ?? ''),
        email: String(formData.email ?? ''),
        phone: String(formData.phone ?? ''),
        responses: formFields.map(field => ({
          fieldName: field.name,
          value: (formData[field.name] as string | number | boolean) || ''
        }))
      };

      console.log('Submitting application data:', applicationData);

      const response = await fetch(`/api/news/${newsId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isLoggedIn && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
        },
        body: JSON.stringify(applicationData)
      });

      console.log('Application response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Application success response:', data);
        if (onSubmit) {
          await onSubmit(applicationData);
        }
        setSubmitStatus('success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Application error response:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ApplicationFormField) => {
    const value = String(formData[field.name] || '');
    const required = field.required;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            required={required}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              checked={Boolean(formData[field.name])}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
              required={required}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">{field.label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  required={required}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Apply for this {type}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Fill out the form below to apply.
        </p>
        {deadline && (
          <p className="text-sm text-gray-600 mt-1">
            <strong>Deadline:</strong> {new Date(deadline).toLocaleDateString()}
          </p>
        )}
        {maxApplicants && (
          <p className="text-sm text-gray-600 mt-1">
            <strong>Max Applicants:</strong> {maxApplicants}
          </p>
        )}
      </div>

      {submitStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Application Submitted!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Thank you for your application. We&apos;ll get back to you soon.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </div>
  );
}
