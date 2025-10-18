'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RoleApproval {
  _id?: string;
  email: string;
  allowedRoles: string[];
  note: string;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RoleApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval?: RoleApproval | null;
  isEditing: boolean;
  onSave: (approval: RoleApproval) => void;
}

const availableRoles = [
  { value: 'student', label: 'Student', description: 'Basic student access' },
  { value: 'team_member', label: 'Team Member', description: 'Can participate in team projects' },
  { value: 'mentor', label: 'Mentor', description: 'Can mentor other students' },
  { value: 'researcher', label: 'Researcher', description: 'Can access research materials' },
  { value: 'admin', label: 'Admin', description: 'Full administrative access' }
];

export default function RoleApprovalModal({
  isOpen,
  onClose,
  approval,
  isEditing,
  onSave
}: RoleApprovalModalProps) {
  const [formData, setFormData] = useState<RoleApproval>({
    email: '',
    allowedRoles: [],
    note: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (approval) {
      setFormData({
        _id: approval._id,
        email: approval.email,
        allowedRoles: approval.allowedRoles,
        note: approval.note,
        isActive: approval.isActive ?? true,
        createdBy: approval.createdBy,
        updatedBy: approval.updatedBy,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt
      });
    } else {
      setFormData({
        email: '',
        allowedRoles: [],
        note: '',
        isActive: true
      });
    }
    setErrors({});
  }, [approval]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.allowedRoles.length === 0) {
      newErrors.allowedRoles = 'At least one role must be selected';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving role approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter(r => r !== role)
        : [...prev.allowedRoles, role]
    }));
  };

  const handleInputChange = (field: keyof RoleApproval, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Role Approval' : 'Create Role Approval'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                style={{ color: '#374151' }}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Allowed Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Allowed Roles
              </label>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <label key={role.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowedRoles.includes(role.value)}
                      onChange={() => handleRoleToggle(role.value)}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{role.label}</span>
                      <p className="text-xs text-gray-700">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.allowedRoles && (
                <p className="mt-1 text-sm text-red-600">{errors.allowedRoles}</p>
              )}
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-900">
                Notes
              </label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
                placeholder="Add notes about this role approval..."
                style={{ color: '#374151' }}
                disabled={isSubmitting}
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">Active</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
