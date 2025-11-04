'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../ToastContext';

interface Equipment {
  id?: string;
  _id?: string;
  name: string;
  currentQuantity: number;
}

interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  id: string;
  title: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onCheckoutSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  equipment,
  onCheckoutSuccess
}: CheckoutModalProps) {
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    quantity: 1,
    userId: '',
    expectedReturnDate: '',
    projectId: '',
    checkoutNotes: ''
  });

  useEffect(() => {
    if (isOpen && equipment) {
      // Reset form
      setFormData({
        quantity: 1,
        userId: '',
        expectedReturnDate: '',
        projectId: '',
        checkoutNotes: ''
      });

      // Get current user info
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.id || user._id;
          const userIsAdmin = user.role === 'admin' || user.role === 'inventory_manager';
          
          setCurrentUserId(userId);
          setIsAdmin(userIsAdmin);
          
          // Set current user as default if not admin
          if (!userIsAdmin) {
            setFormData(prev => ({ ...prev, userId }));
          }

          // Fetch users if admin
          if (userIsAdmin) {
            fetchUsers();
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }

      // Fetch projects
      fetchProjects();
    }
  }, [isOpen, equipment]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Fetch all club members with pagination
      let allMembers: User[] = [];
      const limit = 100;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`/api/users/club-members?limit=${limit}&skip=${skip}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const members = data.data?.clubMembers || [];
          
          // If no members returned, stop pagination
          if (members.length === 0) {
            hasMore = false;
          } else {
            allMembers = [...allMembers, ...members];
            const pagination = data.data?.pagination;
            hasMore = pagination?.hasMore || false;
            skip += limit;
          }
        } else {
          hasMore = false;
        }
      }

      setUsers(allMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/projects?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data?.projects || data.data?.items || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;

    // Get equipment ID (support both id and _id)
    const equipmentId = equipment.id || equipment._id;
    if (!equipmentId) {
      showError('Equipment ID is missing');
      return;
    }

    // Validation
    if (formData.quantity < 1) {
      showError('Quantity must be at least 1');
      return;
    }

    if (formData.quantity > equipment.currentQuantity) {
      showError(`Only ${equipment.currentQuantity} items available`);
      return;
    }

    if (isAdmin && !formData.userId) {
      showError('Please select a team member');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showError('Authentication required');
        return;
      }

      const requestBody: {
        quantity: number;
        userId?: string;
        expectedReturnDate?: string;
        projectId?: string;
        checkoutNotes?: string;
      } = {
        quantity: formData.quantity
      };

      // Only include userId if admin is checking out for someone else
      if (isAdmin && formData.userId && formData.userId !== currentUserId) {
        requestBody.userId = formData.userId;
      }

      // Include expected return date if provided
      if (formData.expectedReturnDate) {
        requestBody.expectedReturnDate = new Date(formData.expectedReturnDate).toISOString();
      }

      // Include project if selected
      if (formData.projectId) {
        requestBody.projectId = formData.projectId;
      }

      // Include notes if provided
      if (formData.checkoutNotes.trim()) {
        requestBody.checkoutNotes = formData.checkoutNotes.trim();
      }

      const response = await fetch(`/api/inventory/equipment/${equipmentId}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Equipment checked out successfully');
        onCheckoutSuccess();
        onClose();
      } else {
        showError(data.message || 'Failed to checkout equipment');
      }
    } catch (error) {
      console.error('Error checking out equipment:', error);
      showError('Network error while checking out equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Checkout Equipment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Equipment:</strong> {equipment.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Available:</strong> {equipment.currentQuantity}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={equipment.currentQuantity}
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              required
            />
          </div>

          {/* User Selection (Admin only) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Member <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                required
              >
                <option value="">Select a team member</option>
                {users.map(user => {
                  const userId = user.id || (user as { _id?: string })._id || user.email;
                  return (
                    <option key={userId} value={userId}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project (Optional)
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            >
              <option value="">No project (personal use)</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              If for project use, equipment may not return
            </p>
          </div>

          {/* Expected Return Date */}
          {!formData.projectId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Return Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty if return date is unknown
              </p>
            </div>
          )}

          {/* Checkout Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.checkoutNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, checkoutNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              placeholder="Add any notes about this checkout..."
              maxLength={1000}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

