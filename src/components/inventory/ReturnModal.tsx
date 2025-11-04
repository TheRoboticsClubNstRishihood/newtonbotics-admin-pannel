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

interface Checkout {
  id?: string;
  _id?: string;
  userId: string;
  userName?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
  quantity: number;
  returnedQuantity?: number;
  checkoutDate: string;
  expectedReturnDate?: string;
  status: string;
  projectName?: string;
}

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onReturnSuccess: () => void;
}

export default function ReturnModal({
  isOpen,
  onClose,
  equipment,
  onReturnSuccess
}: ReturnModalProps) {
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCheckouts, setIsLoadingCheckouts] = useState(false);
  const [activeCheckouts, setActiveCheckouts] = useState<Checkout[]>([]);
  
  const [formData, setFormData] = useState({
    checkoutId: '',
    quantity: 0,
    returnNotes: ''
  });

  useEffect(() => {
    if (isOpen && equipment) {
      // Reset form
      setFormData({
        checkoutId: '',
        quantity: 0,
        returnNotes: ''
      });

      // Fetch active checkouts
      fetchActiveCheckouts();
    }
  }, [isOpen, equipment]);

  const fetchActiveCheckouts = async () => {
    if (!equipment) return;

    const equipmentId = equipment.id || equipment._id;
    if (!equipmentId) {
      showError('Equipment ID is missing');
      return;
    }

    setIsLoadingCheckouts(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/inventory/equipment/${equipmentId}/checkouts/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const checkouts = data.data?.activeCheckouts || [];
        
        // Fetch user names for checkouts that don't have userName
        // or if userName appears to be an ID (same as userId)
        const checkoutsWithUsers = await Promise.all(
          checkouts.map(async (checkout: Checkout) => {
            // Check if userName is missing or if it's the same as userId (likely an ID)
            const needsUserFetch = !checkout.userName || checkout.userName === checkout.userId;
            
            if (needsUserFetch && checkout.userId) {
              try {
                const userResponse = await fetch(`/api/users/${checkout.userId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  // Handle different response structures
                  const user = userData.data?.user || userData.data?.item || userData.user || userData.data;
                  
                  if (user) {
                    // Try to construct name from firstName and lastName
                    if (user.firstName || user.lastName) {
                      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                      if (fullName) {
                        checkout.userName = fullName;
                      }
                    }
                    // Try name field
                    if (!checkout.userName && user.name) {
                      checkout.userName = user.name;
                    }
                    // Try fullName field
                    if (!checkout.userName && user.fullName) {
                      checkout.userName = user.fullName;
                    }
                    // Last resort: use email
                    if (!checkout.userName && user.email) {
                      checkout.userName = user.email;
                    }
                  }
                  
                  // Debug logging
                  if (!checkout.userName) {
                    console.warn('Could not extract user name from response:', { 
                      userId: checkout.userId, 
                      userData, 
                      user 
                    });
                  }
                } else {
                  console.warn('Failed to fetch user:', checkout.userId, userResponse.status);
                }
              } catch (err) {
                console.error('Error fetching user info:', err);
              }
            }
            return checkout;
          })
        );
        
        setActiveCheckouts(checkoutsWithUsers);
        
        // Auto-select first checkout if only one
        if (checkoutsWithUsers.length === 1) {
          const checkout = checkoutsWithUsers[0];
          const checkoutId = checkout.id || checkout._id || '';
          setFormData(prev => ({
            ...prev,
            checkoutId,
            quantity: 0 // Default to 0 (empty) to return all by default
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching active checkouts:', error);
    } finally {
      setIsLoadingCheckouts(false);
    }
  };

  const handleCheckoutChange = (checkoutId: string) => {
    const checkout = activeCheckouts.find(c => (c.id || c._id) === checkoutId);
    if (checkout) {
      setFormData(prev => ({
        ...prev,
        checkoutId,
        quantity: 0 // Default to 0 (empty) to return all by default
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;

    // Validation
    if (!formData.checkoutId && activeCheckouts.length > 0) {
      showError('Please select a checkout to return');
      return;
    }

    const equipmentId = equipment.id || equipment._id;
    if (!equipmentId) {
      showError('Equipment ID is missing');
      return;
    }

    const selectedCheckout = activeCheckouts.find(c => (c.id || c._id) === formData.checkoutId);
    if (selectedCheckout) {
      const remainingQty = selectedCheckout.quantity - (selectedCheckout.returnedQuantity || 0);
      // Only validate quantity if a specific quantity is provided (not 0 or empty)
      if (formData.quantity > 0 && formData.quantity > remainingQty) {
        showError(`Only ${remainingQty} items remaining to return`);
        return;
      }
      if (formData.quantity < 0) {
        showError('Quantity cannot be negative');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showError('Authentication required');
        return;
      }

      const requestBody: {
        checkoutId?: string;
        quantity?: number;
        returnNotes?: string;
      } = {};

      if (formData.checkoutId) {
        requestBody.checkoutId = formData.checkoutId;
      }

      // Only include quantity if specified (0 or empty means return all)
      if (formData.quantity > 0) {
        requestBody.quantity = formData.quantity;
      }
      // If quantity is 0 or not provided, backend should return all items

      if (formData.returnNotes.trim()) {
        requestBody.returnNotes = formData.returnNotes.trim();
      }

      const response = await fetch(`/api/inventory/equipment/${equipmentId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Equipment returned successfully');
        onReturnSuccess();
        onClose();
      } else {
        showError(data.message || 'Failed to return equipment');
      }
    } catch (error) {
      console.error('Error returning equipment:', error);
      showError('Network error while returning equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Return - {equipment.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isLoadingCheckouts ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading active checkouts...</p>
          </div>
        ) : activeCheckouts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">No active checkouts found for this equipment.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Checkout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Checkout <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.checkoutId}
                onChange={(e) => handleCheckoutChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                required={activeCheckouts.length > 0}
              >
                <option value="">Select a checkout</option>
                {activeCheckouts.map(checkout => {
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                  };
                  
                  // Handle different ID field names
                  const checkoutId = checkout.id || (checkout as { _id?: string })._id || '';
                  const idString = String(checkoutId);
                  const truncatedId = idString.length > 12 
                    ? `${idString.substring(0, 8)}...` 
                    : idString;
                  
                  // Get user name from various possible locations
                  let userName = checkout.userName;
                  
                  // Check nested user object first
                  if (!userName && checkout.user) {
                    if (checkout.user.firstName || checkout.user.lastName) {
                      const fullName = `${checkout.user.firstName || ''} ${checkout.user.lastName || ''}`.trim();
                      if (fullName) {
                        userName = fullName;
                      }
                    }
                    if (!userName && checkout.user.name) {
                      userName = checkout.user.name;
                    }
                    if (!userName && checkout.user.fullName) {
                      userName = checkout.user.fullName;
                    }
                    if (!userName && checkout.user.email) {
                      userName = checkout.user.email;
                    }
                  }
                  
                  // Only show "Unknown User" if we truly can't find a name
                  // Don't fallback to userId as that's not user-friendly
                  if (!userName) {
                    userName = 'Unknown User';
                  }
                  
                  const quantity = checkout.quantity || 0;
                  
                  let displayText = `${userName} - Qty: ${quantity}`;
                  
                  if (checkout.expectedReturnDate) {
                    displayText += ` (Due: ${formatDate(checkout.expectedReturnDate)})`;
                  }
                  
                  displayText += ` [ID: ${truncatedId}]`;
                  
                  return (
                    <option key={checkoutId} value={checkoutId}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
              {activeCheckouts.length === 1 && (
                <p className="mt-1 text-xs text-gray-500">
                  Only one active checkout found - auto-selected
                </p>
              )}
              {formData.checkoutId && (
                <p className="mt-1 text-xs text-gray-600">
                  Selected: {formData.checkoutId}
                </p>
              )}
            </div>

            {/* Quantity */}
            {formData.checkoutId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Quantity (optional - for partial returns)
                </label>
                <input
                  type="number"
                  min="1"
                  max={(() => {
                    const checkout = activeCheckouts.find(c => (c.id || c._id) === formData.checkoutId);
                    if (checkout) {
                      return checkout.quantity - (checkout.returnedQuantity || 0);
                    }
                    return 1;
                  })()}
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Leave empty to return all"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to return all items from selected checkout
                </p>
              </div>
            )}

            {/* Return Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Notes (Optional)
              </label>
              <textarea
                value={formData.returnNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, returnNotes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                placeholder="Add return notes..."
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.returnNotes.length}/1000
              </p>
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !formData.checkoutId}
              >
                {isSubmitting ? 'Processing...' : 'Return'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

