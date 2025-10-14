'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../../../components/AdminLayout';
import { useToast } from '../../../../components/ToastContext';

interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id: string;
  name: string;
  categoryId: {
    id: string;
    name: string;
    description: string;
  };
  currentQuantity: number;
  totalQuantity: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'maintenance';
  description: string;
  modelNumber?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  specifications: Record<string, string | number | boolean>;
  location: string;
  imageUrl?: string;
  maintenanceSchedule?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

interface EquipmentFormData {
  name: string;
  categoryId: string;
  description: string;
  modelNumber?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity?: number;
  location: string;
  imageUrl?: string;
  specifications: Record<string, string | number | boolean>;
  maintenanceSchedule?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export default function EditEquipment() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    categoryId: '',
    description: '',
    modelNumber: '',
    serialNumber: '',
    manufacturer: '',
    purchaseDate: '',
    purchasePrice: undefined,
    currentQuantity: 0,
    minQuantity: 0,
    maxQuantity: undefined,
    location: '',
    imageUrl: '',
    specifications: {},
    maintenanceSchedule: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

  const [specificationFields, setSpecificationFields] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);

  // Helper function to get category ID safely
  const getCategoryId = (categoryData: string | { id?: string; _id?: string }): string => {
    if (typeof categoryData === 'string') return categoryData;
    if (categoryData && categoryData.id) return categoryData.id;
    if (categoryData && categoryData._id) return categoryData._id;
    return '';
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    if (equipmentId && equipmentId !== 'undefined') {
      fetchEquipment();
      fetchCategories();
    }
  }, [equipmentId]);

  // Set form data when categories are loaded and equipment is available
  useEffect(() => {
    if (categoriesLoaded && equipment && !isLoading) {
      const categoryId = getCategoryId(equipment.categoryId);
      console.log('Setting categoryId in form after categories loaded:', categoryId);
      setFormData({
        name: equipment.name,
        categoryId: categoryId,
        description: equipment.description,
        modelNumber: equipment.modelNumber || '',
        serialNumber: equipment.serialNumber || '',
        manufacturer: equipment.manufacturer || '',
        purchaseDate: equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : '',
        purchasePrice: equipment.purchasePrice,
        currentQuantity: equipment.currentQuantity,
        minQuantity: equipment.minQuantity || 0,
        maxQuantity: equipment.maxQuantity,
        location: equipment.location,
        imageUrl: equipment.imageUrl || '',
        specifications: equipment.specifications,
        maintenanceSchedule: equipment.maintenanceSchedule || '',
        lastMaintenanceDate: equipment.lastMaintenanceDate ? equipment.lastMaintenanceDate.split('T')[0] : '',
        nextMaintenanceDate: equipment.nextMaintenanceDate ? equipment.nextMaintenanceDate.split('T')[0] : ''
      });
    }
  }, [categoriesLoaded, equipment, isLoading]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/inventory/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert _id to id for consistency
        const processedCategories = (data.data.items || []).map((cat: { _id?: string; id?: string; name: string; description?: string }) => ({
          ...cat,
          id: cat._id || cat.id
        }));
        setCategories(processedCategories);
        setCategoriesLoaded(true);
      } else {
        // Show mock categories for testing
        const mockCategories = [
          {
            id: '68a3221d8519f6402ffd1bd9',
            name: 'Development Boards',
            description: 'Microcontrollers, Single Board Computers, and development platforms',
            parentCategoryId: null,
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1bda',
            name: 'Sensors & Modules',
            description: 'Various sensors, breakout boards, and electronic modules',
            parentCategoryId: null,
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1bdb',
            name: 'Tools & Equipment',
            description: 'Hand tools, power tools, and laboratory equipment',
            parentCategoryId: null,
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1bdc',
            name: 'Electronics Components',
            description: 'Resistors, capacitors, ICs, and other electronic components',
            parentCategoryId: null,
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1bdd',
            name: 'Cables & Connectors',
            description: 'USB cables, jumper wires, connectors, and adapters',
            parentCategoryId: null,
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          // Subcategories
          {
            id: '68a3221d8519f6402ffd1be3',
            name: 'Arduino Boards',
            description: 'Arduino Uno, Nano, Mega, and compatible boards',
            parentCategoryId: '68a3221d8519f6402ffd1bd9',
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1be4',
            name: 'Raspberry Pi',
            description: 'Raspberry Pi boards and accessories',
            parentCategoryId: '68a3221d8519f6402ffd1bd9',
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1be6',
            name: 'Environmental Sensors',
            description: 'Temperature, humidity, pressure, and air quality sensors',
            parentCategoryId: '68a3221d8519f6402ffd1bda',
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          },
          {
            id: '68a3221d8519f6402ffd1beb',
            name: 'Measurement Tools',
            description: 'Multimeters, oscilloscopes, and testing equipment',
            parentCategoryId: '68a3221d8519f6402ffd1bdb',
            createdAt: '2025-08-18T12:52:45.653Z',
            updatedAt: '2025-08-18T12:52:45.653Z'
          }
        ];
        setCategories(mockCategories);
        setCategoriesLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      if (!equipmentId || equipmentId === 'undefined') {
        showError('Invalid equipment ID');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/inventory/equipment/${equipmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const equipmentData = data.data.item;
        console.log('Equipment data received:', equipmentData);
        console.log('Category data:', equipmentData.categoryId);
        setEquipment(equipmentData);
        
        // Convert specifications object to fields array
        const specFields = Object.entries(equipmentData.specifications).map(([key, value]) => ({
          key,
          value: Array.isArray(value) ? value.join(', ') : String(value)
        }));
        
        if (specFields.length === 0) {
          specFields.push({ key: '', value: '' });
        }
        
                setSpecificationFields(specFields);
      } else {
        // Equipment not found
        showError(`Equipment not found (${response.status}). Please check the equipment ID and try again.`);
        router.push('/inventory');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showError('Network error while fetching equipment');
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId || !formData.description.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    // Additional validation
    if (formData.name.length < 3) {
      showError('Equipment name must be at least 3 characters long');
      return;
    }

    if (formData.description.length < 10) {
      showError('Description must be at least 10 characters long');
      return;
    }

    if (formData.currentQuantity < 0) {
      showError('Current quantity cannot be negative');
      return;
    }

    if (formData.minQuantity < 0) {
      showError('Minimum quantity cannot be negative');
      return;
    }

    if (formData.maxQuantity !== undefined && formData.maxQuantity < formData.currentQuantity) {
      showError('Maximum quantity cannot be less than current quantity');
      return;
    }

    if (formData.maxQuantity !== undefined && formData.maxQuantity < formData.minQuantity) {
      showError('Maximum quantity cannot be less than minimum quantity');
      return;
    }

    if (formData.purchasePrice !== undefined && formData.purchasePrice < 0) {
      showError('Purchase price cannot be negative');
      return;
    }


    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // Convert specification fields to object
      const specifications: Record<string, string | number> = {};
      specificationFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          // Try to parse as number if possible
          const numValue = parseFloat(field.value);
          specifications[field.key.trim()] = isNaN(numValue) ? field.value.trim() : numValue;
        }
      });

      const requestData = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        modelNumber: formData.modelNumber?.trim() || undefined,
        serialNumber: formData.serialNumber?.trim() || undefined,
        manufacturer: formData.manufacturer?.trim() || undefined,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : undefined,
        purchasePrice: formData.purchasePrice || undefined,
        currentQuantity: formData.currentQuantity,
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity || undefined,
        location: formData.location.trim(),
        imageUrl: formData.imageUrl?.trim() || undefined,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        maintenanceSchedule: formData.maintenanceSchedule?.trim() || undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate ? new Date(formData.lastMaintenanceDate).toISOString() : undefined,
        nextMaintenanceDate: formData.nextMaintenanceDate ? new Date(formData.nextMaintenanceDate).toISOString() : undefined
      };
      
      console.log('Form data categoryId:', formData.categoryId);
      console.log('Form data categoryId type:', typeof formData.categoryId);
      console.log('Available categories:', categories.map(cat => ({ id: cat.id, name: cat.name })));
      console.log('Selected category:', categories.find(cat => cat.id === formData.categoryId));
      console.log('Sending request data:', requestData);
      
      const response = await fetch(`/api/inventory/equipment/${equipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        showSuccess('Equipment updated successfully!');
        router.push('/inventory');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        
        showError(`Failed to update equipment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      showError('Network error while updating equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSpecificationField = () => {
    setSpecificationFields([...specificationFields, { key: '', value: '' }]);
  };

  const removeSpecificationField = (index: number) => {
    setSpecificationFields(specificationFields.filter((_, i) => i !== index));
  };

  const updateSpecificationField = (index: number, field: 'key' | 'value', value: string) => {
    const updatedFields = [...specificationFields];
    updatedFields[index][field] = value;
    setSpecificationFields(updatedFields);
  };

  const getStatusFromQuantity = () => {
    if (formData.currentQuantity === 0) return 'out_of_stock';
    if (formData.currentQuantity <= formData.minQuantity) return 'low_stock';
    return 'available';
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Equipment">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading equipment...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!equipmentId || equipmentId === 'undefined') {
    return (
      <AdminLayout pageTitle="Edit Equipment">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Equipment ID</h3>
            <p className="text-gray-600 mb-4">The equipment ID is invalid or missing.</p>
            <button
              onClick={() => router.push('/inventory')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Inventory
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!equipment) {
    return (
      <AdminLayout pageTitle="Edit Equipment">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment not found</h3>
            <p className="text-gray-600 mb-4">The equipment you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push('/inventory')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Inventory
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Edit Equipment">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Inventory</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Equipment</h1>
              <p className="text-gray-600">Update equipment details and specifications</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Equipment Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., Arduino Uno R3"
                  maxLength={255}
                  required
                />
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
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., Lab A - Shelf 3"
                  maxLength={255}
                  required
                />
              </div>
            </div>

            {/* Equipment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Number
                </label>
                <input
                  type="text"
                  value={formData.modelNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., UNO-R3"
                  maxLength={100}
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., ARD123456789"
                  maxLength={100}
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., Arduino AG"
                  maxLength={100}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="https://example.com/image.jpg"
                  maxLength={500}
                />
              </div>
            </div>

            {/* Purchase Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Describe the equipment, its features, and intended use..."
                maxLength={2000}
                required
              />
            </div>

            {/* Quantity Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.currentQuantity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    currentQuantity: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    minQuantity: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="0"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Alert threshold for low stock
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Quantity
                </label>
                <input
                  type="number"
                  value={formData.maxQuantity || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maxQuantity: parseInt(e.target.value) || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Optional"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Storage capacity limit
                </p>
              </div>
            </div>

            {/* Status Preview */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status Preview</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getStatusFromQuantity() === 'available' ? 'bg-green-100 text-green-800' :
                  getStatusFromQuantity() === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusFromQuantity().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-sm text-gray-600">
                  Based on current quantity
                </span>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Specifications
                </label>
                <button
                  type="button"
                  onClick={addSpecificationField}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Field
                </button>
              </div>
              
              <div className="space-y-3">
                {specificationFields.map((field, index) => (
                  <div key={index} className="flex space-x-3">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => updateSpecificationField(index, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="e.g., Microcontroller"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateSpecificationField(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="e.g., ATmega328P"
                    />
                    {specificationFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecificationField(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Add technical specifications like processor, voltage, dimensions, etc.
              </p>
            </div>

            {/* Maintenance Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.lastMaintenanceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenanceDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.nextMaintenanceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Schedule
                </label>
                <input
                  type="text"
                  value={formData.maintenanceSchedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceSchedule: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., Every 6 months"
                  maxLength={1000}
                />
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
                  'Update Equipment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
