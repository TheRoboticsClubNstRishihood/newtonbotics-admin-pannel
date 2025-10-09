'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studentId?: string;
  department?: string;
  yearOfStudy?: number;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string;
  bio?: string;
  skills?: string[];
  permissions?: string[];
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
  };
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  departments: string[];
  roles: string[];
}

export default function EditUserModal({ user, isOpen, onClose, onSave, departments, roles }: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  console.log('EditUserModal props:', { user, isOpen, departments, roles });

  useEffect(() => {
    console.log('EditUserModal useEffect triggered:', { user, isOpen });
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || '',
        department: user.department || '',
        yearOfStudy: user.yearOfStudy || undefined,
        phone: user.phone || '',
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? false,
        bio: user.bio || '',
        skills: user.skills || [],
        studentId: user.studentId || '',
        permissions: user.permissions || [],
        preferences: user.preferences || { notifications: true, newsletter: true }
      });
    }
  }, [user]);

  // Early return after all hooks are called
  if (!user) {
    console.warn('EditUserModal: No user provided');
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Track changed fields
    const originalValue = user[field as keyof typeof user];
    const hasChanged = value !== originalValue;
    
    setChangedFields(prev => {
      const newSet = new Set(prev);
      if (hasChanged) {
        newSet.add(field);
      } else {
        newSet.delete(field);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Only send fields that have been changed from their original values
      const changedFields: any = {};
      
      // Compare current form data with original user data
      Object.entries(formData).forEach(([key, value]) => {
        const originalValue = user[key as keyof typeof user];
        
        // Check if the value has actually changed
        if (value !== originalValue) {
          // Handle different data types
          if (Array.isArray(value) && Array.isArray(originalValue)) {
            // For arrays, check if they're different
            if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
              changedFields[key] = value;
            }
          } else if (typeof value === 'object' && typeof originalValue === 'object') {
            // For objects, check if they're different
            if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
              changedFields[key] = value;
            }
          } else {
            // For primitive values, handle empty strings specially
            if (value === '' && (originalValue === null || originalValue === undefined || originalValue === '')) {
              // Don't send empty string if original was also empty/null/undefined
              return;
            }
            
            // Special handling for phone number - send null instead of empty string
            if (key === 'phone' && value === '') {
              changedFields[key] = null;
            } else {
              changedFields[key] = value;
            }
          }
        }
      });

      console.log('Original user data:', user);
      console.log('Form data:', formData);
      console.log('Changed fields only:', changedFields);

      // Check if any fields have been changed
      if (Object.keys(changedFields).length === 0) {
        setError('No changes detected. Please modify at least one field before saving.');
        return;
      }

      // Optional: Validate phone number format if provided (but don't block submission)
      if (changedFields.phone && changedFields.phone !== null && changedFields.phone !== '') {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(changedFields.phone.replace(/[\s\-\(\)]/g, ''))) {
          console.warn('Phone number format may be invalid, but allowing submission');
        }
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changedFields)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        onSave(data.data.user);
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        
        // Show more detailed error information
        let errorMessage = errorData.message || `Failed to update user (${response.status})`;
        
        if (errorData.details) {
          if (errorData.details.error?.message) {
            errorMessage = errorData.details.error.message;
          } else if (errorData.details.message) {
            errorMessage = errorData.details.message;
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) {
    console.log('EditUserModal not rendering:', { isOpen, user });
    return null;
  }

  console.log('EditUserModal rendering with:', { user, formData, isOpen });

  return (
    <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto"
          style={{ 
            backgroundColor: 'white',
            zIndex: 10000,
            position: 'relative'
          }}
        >
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Changed Fields Summary */}
            {changedFields.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  <strong>Changed fields:</strong> {Array.from(changedFields).join(', ')}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Simple Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.studentId || ''}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Enter student ID (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black"
                  />
                  <p className="mt-1 text-xs text-gray-700">Leave empty to remove phone number</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" className="text-black">Select Role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" className="text-black">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                <select
                  value={formData.yearOfStudy || ''}
                  onChange={(e) => handleInputChange('yearOfStudy', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" className="text-black">Select Year</option>
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-600"
                  placeholder="Enter user bio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    handleInputChange('skills', skills);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-600"
                  placeholder="e.g., Python, Arduino, ROS"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active User
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailVerified"
                    checked={formData.emailVerified || false}
                    onChange={(e) => handleInputChange('emailVerified', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailVerified" className="ml-2 block text-sm text-gray-900">
                    Email Verified
                  </label>
                </div>

                {formData.preferences && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={formData.preferences.notifications || false}
                        onChange={(e) => handleInputChange('preferences', {
                          ...formData.preferences,
                          notifications: e.target.checked
                        })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                        Enable Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newsletter"
                        checked={formData.preferences.newsletter || false}
                        onChange={(e) => handleInputChange('preferences', {
                          ...formData.preferences,
                          newsletter: e.target.checked
                        })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                        Newsletter Subscription
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : `Save Changes${changedFields.size > 0 ? ` (${changedFields.size} field${changedFields.size > 1 ? 's' : ''})` : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
