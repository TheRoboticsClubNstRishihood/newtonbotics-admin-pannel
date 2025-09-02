'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/ToastContext';

interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id?: string;
  _id?: string;
  name: string;
  categoryId: {
    id: string;
    name: string;
    description: string;
  };
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
  status: 'available' | 'low_stock' | 'out_of_stock' | 'maintenance' | 'retired';
  imageUrl?: string;
  specifications: Record<string, any>;
  maintenanceSchedule?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export default function InventoryPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    status: '',
    limit: 20
  });

  // Modal states
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to get equipment ID (handles both id and _id)
  const getEquipmentId = (equipment: Equipment): string => {
    return equipment.id || equipment._id || '';
  };

  // Helper function to normalize equipment data (ensure id field exists)
  const normalizeEquipmentData = (equipment: any): Equipment => {
    return {
      ...equipment,
      id: equipment.id || equipment._id || ''
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    fetchEquipment();
    fetchCategories();
  }, [filters]);

  // Clear stored equipment data on page load to prevent accumulation
  useEffect(() => {
    // Clear stored equipment data after a delay to allow updates to be applied
    const timer = setTimeout(() => {
      localStorage.removeItem('updatedEquipment');
      localStorage.removeItem('newEquipment');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('limit', filters.limit.toString());
      queryParams.append('skip', pagination.skip.toString());
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`/api/inventory/equipment?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const normalizedEquipment = (data.data.items || []).map(normalizeEquipmentData);
        setEquipment(normalizedEquipment);
        setPagination(data.data.pagination || {
          total: 0,
          limit: filters.limit,
          skip: 0,
          hasMore: false
        });
      } else {
        // Show mock data for testing
        const mockEquipment = [
          {
            id: '64f8a1b2c3d4e5f6a7b8c9db',
            name: 'Arduino Uno R3',
            categoryId: {
              id: '68a3221d8519f6402ffd1be3',
              name: 'Arduino Boards',
              description: 'Arduino Uno, Nano, Mega, and compatible boards'
            },
            description: 'Arduino Uno R3 microcontroller board with USB cable',
            modelNumber: 'UNO-R3',
            serialNumber: 'ARD123456789',
            manufacturer: 'Arduino AG',
            purchaseDate: '2023-01-01T00:00:00.000Z',
            purchasePrice: 25.99,
            currentQuantity: 15,
            minQuantity: 5,
            maxQuantity: 20,
            location: 'Lab A - Shelf 3',
            status: 'available',
            imageUrl: 'https://example.com/arduino-uno.jpg',
            specifications: {
              microcontroller: 'ATmega328P',
              operatingVoltage: '5V',
              inputVoltage: '7-12V',
              digitalPins: 14,
              analogPins: 6
            },
            maintenanceSchedule: 'Every 6 months',
            lastMaintenanceDate: '2023-08-15T00:00:00.000Z',
            nextMaintenanceDate: '2024-02-15T00:00:00.000Z',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-09-05T10:30:00.000Z'
          },
          {
            id: '64f8a1b2c3d4e5f6a7b8c9dc',
            name: 'Raspberry Pi 4 Model B',
            categoryId: {
              id: '68a3221d8519f6402ffd1be4',
              name: 'Raspberry Pi',
              description: 'Raspberry Pi boards and accessories'
            },
            description: 'Raspberry Pi 4 Model B with 4GB RAM',
            modelNumber: 'Pi4B-4GB',
            serialNumber: 'RPI987654321',
            manufacturer: 'Raspberry Pi Foundation',
            purchaseDate: '2023-09-01T00:00:00.000Z',
            purchasePrice: 55.00,
            currentQuantity: 8,
            minQuantity: 3,
            maxQuantity: 10,
            location: 'Lab B - Shelf 1',
            status: 'low_stock',
            imageUrl: 'https://example.com/raspberry-pi-4.jpg',
            specifications: {
              processor: 'Broadcom BCM2711',
              ram: '4GB LPDDR4',
              storage: 'MicroSD',
              ports: ['USB 3.0', 'Ethernet', 'WiFi', 'Bluetooth']
            },
            maintenanceSchedule: 'Every 12 months',
            createdAt: '2023-09-01T00:00:00.000Z',
            updatedAt: '2023-09-05T12:00:00.000Z'
          },
          {
            id: '64f8a1b2c3d4e5f6a7b8c9dd',
            name: 'DHT22 Temperature Sensor',
            categoryId: {
              id: '68a3221d8519f6402ffd1be6',
              name: 'Environmental Sensors',
              description: 'Temperature, humidity, pressure, and air quality sensors'
            },
            description: 'Digital temperature and humidity sensor module',
            modelNumber: 'DHT22-AM2302',
            serialNumber: 'DHT220001234',
            manufacturer: 'Aosong Electronics',
            purchaseDate: '2023-03-15T00:00:00.000Z',
            purchasePrice: 8.50,
            currentQuantity: 25,
            minQuantity: 10,
            maxQuantity: 30,
            location: 'Lab C - Drawer 2',
            status: 'available',
            imageUrl: 'https://example.com/dht22.jpg',
            specifications: {
              temperatureRange: '-40°C to 80°C',
              humidityRange: '0-100% RH',
              accuracy: '±0.5°C, ±2% RH',
              interface: 'Digital'
            },
            maintenanceSchedule: 'Every 12 months',
            createdAt: '2023-03-15T00:00:00.000Z',
            updatedAt: '2023-09-05T14:20:00.000Z'
          },
          {
            id: '64f8a1b2c3d4e5f6a7b8c9de',
            name: 'Digital Multimeter',
            categoryId: {
              id: '68a3221d8519f6402ffd1beb',
              name: 'Measurement Tools',
              description: 'Multimeters, oscilloscopes, and testing equipment'
            },
            description: 'Professional digital multimeter with auto-ranging',
            modelNumber: 'DM-4100',
            serialNumber: 'DMM789012345',
            manufacturer: 'Fluke Corporation',
            purchaseDate: '2022-11-20T00:00:00.000Z',
            purchasePrice: 89.99,
            currentQuantity: 3,
            minQuantity: 2,
            maxQuantity: 5,
            location: 'Lab A - Tool Cabinet',
            status: 'available',
            imageUrl: 'https://example.com/multimeter.jpg',
            specifications: {
              voltageRange: 'AC/DC 0-600V',
              currentRange: 'AC/DC 0-10A',
              resistanceRange: '0-40MΩ',
              accuracy: '±0.5%'
            },
            maintenanceSchedule: 'Every 6 months',
            lastMaintenanceDate: '2023-06-15T00:00:00.000Z',
            nextMaintenanceDate: '2023-12-15T00:00:00.000Z',
            createdAt: '2022-11-20T00:00:00.000Z',
            updatedAt: '2023-09-05T16:45:00.000Z'
          },
          {
            id: '64f8a1b2c3d4e5f6a7b8c9df',
            name: 'USB Type-C Cables',
            categoryId: {
              id: '68a3221d8519f6402ffd1bdd',
              name: 'Cables & Connectors',
              description: 'USB cables, jumper wires, connectors, and adapters'
            },
            description: 'High-quality USB Type-C to Type-C cables',
            modelNumber: 'USB-C-1M',
            serialNumber: 'CBL001234567',
            manufacturer: 'Anker',
            purchaseDate: '2023-07-10T00:00:00.000Z',
            purchasePrice: 12.99,
            currentQuantity: 50,
            minQuantity: 20,
            maxQuantity: 100,
            location: 'Storage Room - Box A',
            status: 'available',
            imageUrl: 'https://example.com/usb-cable.jpg',
            specifications: {
              length: '1 meter',
              connectorType: 'USB-C to USB-C',
              dataTransfer: '10Gbps',
              powerDelivery: '100W'
            },
            maintenanceSchedule: 'As needed',
            createdAt: '2023-07-10T00:00:00.000Z',
            updatedAt: '2023-09-05T09:15:00.000Z'
          }
        ];

        // Check for updated equipment data in localStorage
        const storedEquipment = JSON.parse(localStorage.getItem('updatedEquipment') || '{}');
        
        // Check for new equipment data in localStorage
        const newEquipment = JSON.parse(localStorage.getItem('newEquipment') || '[]');
        
        // Apply any stored updates to mock equipment
        const updatedMockEquipment = mockEquipment.map(item => {
          const updatedItem = storedEquipment[item.id];
          return updatedItem ? { ...item, ...updatedItem } : item;
        });

        // Combine mock equipment with new equipment
        const allEquipment = [...updatedMockEquipment, ...newEquipment];

        const normalizedMockEquipment = allEquipment.map(normalizeEquipmentData);
        setEquipment(normalizedMockEquipment);
        setPagination({
          total: allEquipment.length,
          limit: filters.limit,
          skip: 0,
          hasMore: false
        });
        showError(`Backend endpoint not ready (${response.status}). Showing mock data for testing.`);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showError('Network error while fetching equipment');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/inventory/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert _id to id for consistency
        const processedCategories = (data.data.items || []).map((cat: any) => ({
          ...cat,
          id: cat._id || cat.id
        }));
        setCategories(processedCategories);
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
          }
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEquipment) {
      console.log('No selected equipment');
      return;
    }

    const equipmentId = getEquipmentId(selectedEquipment);
    console.log('Deleting equipment:', selectedEquipment);
    console.log('Equipment ID:', equipmentId);
    console.log('Equipment ID type:', typeof equipmentId);
    console.log('Equipment ID value:', equipmentId);

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // Check if this is mock data (IDs starting with '64f8')
      const isMockData = equipmentId && equipmentId.startsWith('64f8');
      
      if (isMockData) {
        // Handle mock data deletion
        setEquipment(prev => prev.filter(item => getEquipmentId(item) !== equipmentId));
        showSuccess('Equipment deleted successfully (mock data)');
        setShowDeleteModal(false);
        setSelectedEquipment(null);
        return;
      }

      if (!equipmentId || equipmentId === 'undefined') {
        showError('Invalid equipment ID');
        setIsDeleting(false);
        return;
      }

      const deleteUrl = `/api/inventory/equipment/${equipmentId}`;
      console.log('Delete URL:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Equipment deleted successfully');
        setShowDeleteModal(false);
        setSelectedEquipment(null);
        fetchEquipment();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Delete error response:', errorData);
        showError(`Failed to delete equipment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showError('Network error while deleting equipment');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
      out_of_stock: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
      maintenance: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      retired: { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getStockPercentage = (current: number, max: number | undefined) => {
    if (!max || max === 0) return 100;
    return Math.round((current / max) * 100);
  };

  const getStockColor = (current: number, min: number, max: number | undefined) => {
    if (current === 0) return 'bg-red-500';
    if (max && current <= max * 0.2) return 'bg-red-500';
    if (current <= min) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <AdminLayout pageTitle="Inventory Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                            <p className="text-black">Manage equipment and track inventory levels</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/inventory/categories')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span>Categories</span>
            </button>
            <button
              onClick={() => router.push('/inventory/create')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="">All Status</option>
                          <option value="available">Available</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
            </select>

            {/* Limit */}
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black "
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">
              Equipment ({pagination.total})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                              <p className="mt-2 text-black">Loading equipment...</p>
            </div>
          ) : equipment.length === 0 ? (
            <div className="p-6 text-center">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No equipment found</h3>
                              <p className="text-black mb-4">Get started by adding your first piece of equipment.</p>
              <button
                onClick={() => router.push('/inventory/create')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Equipment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipment.map((item) => {
                    const stockPercentage = getStockPercentage(item.currentQuantity, item.maxQuantity);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-black">{item.name}</div>
                            <div className="text-sm text-black">{item.description}</div>
                            {item.modelNumber && (
                              <div className="text-xs text-black">Model: {item.modelNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">{item.categoryId.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                                                          <div className="text-sm text-black">
                              {item.currentQuantity}
                              {item.maxQuantity && ` / ${item.maxQuantity}`}
                              {item.minQuantity > 0 && (
                                <span className="text-xs text-black ml-1">
                                  (min: {item.minQuantity})
                                </span>
                              )}
                            </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getStockColor(item.currentQuantity, item.minQuantity, item.maxQuantity)}`}
                                  style={{ width: `${stockPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-xs text-black">{stockPercentage}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {item.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEquipment(item);
                                setShowDetailModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/inventory/edit/${getEquipmentId(item)}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const itemId = getEquipmentId(item);
                                console.log('Delete button clicked for item:', item);
                                console.log('Item ID:', itemId);
                                console.log('Item ID type:', typeof itemId);
                                console.log('Item ID value:', itemId);
                                setSelectedEquipment(item);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > filters.limit && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing {pagination.skip + 1} to {Math.min(pagination.skip + filters.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, skip: Math.max(0, pagination.skip - filters.limit) }))}
                disabled={pagination.skip === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, skip: pagination.skip + filters.limit }))}
                disabled={!pagination.hasMore}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEquipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-black">Equipment Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-black">{selectedEquipment.name}</h4>
                <p className="text-black">{selectedEquipment.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Category</label>
                  <p className="text-sm text-black">{selectedEquipment.categoryId.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedEquipment.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Current Stock</label>
                  <p className="text-sm text-black">
                    {selectedEquipment.currentQuantity}
                    {selectedEquipment.maxQuantity && ` / ${selectedEquipment.maxQuantity}`}
                    {selectedEquipment.minQuantity > 0 && (
                      <span className="text-xs text-black ml-1">
                        (min: {selectedEquipment.minQuantity})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Location</label>
                  <p className="text-sm text-black">{selectedEquipment.location}</p>
                </div>
              </div>

              {Object.keys(selectedEquipment.specifications).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-black">Specifications</label>
                  <div className="mt-1 bg-gray-50 p-3 rounded-md">
                    {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium text-black">{key}:</span>
                        <span className="text-black">{Array.isArray(value) ? value.join(', ') : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedEquipment.lastMaintenanceDate && (
                  <div>
                    <label className="text-sm font-medium text-black">Last Maintenance</label>
                    <p className="text-sm text-black">
                      {new Date(selectedEquipment.lastMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedEquipment.nextMaintenanceDate && (
                  <div>
                    <label className="text-sm font-medium text-black">Next Maintenance</label>
                    <p className="text-sm text-black">
                      {new Date(selectedEquipment.nextMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedEquipment.maintenanceSchedule && (
                  <div>
                    <label className="text-sm font-medium text-black">Maintenance Schedule</label>
                    <p className="text-sm text-black">{selectedEquipment.maintenanceSchedule}</p>
                  </div>
                )}
                {selectedEquipment.purchaseDate && (
                  <div>
                    <label className="text-sm font-medium text-black">Purchase Date</label>
                    <p className="text-sm text-black">
                      {new Date(selectedEquipment.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  router.push(`/inventory/edit/${getEquipmentId(selectedEquipment)}`);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Edit Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEquipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Equipment</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{selectedEquipment.name}"? This action cannot be undone.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Equipment ID: {getEquipmentId(selectedEquipment) || 'N/A'}
                  {getEquipmentId(selectedEquipment) && getEquipmentId(selectedEquipment).startsWith('64f8') && (
                    <span className="block text-blue-500">(Mock Data)</span>
                  )}
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEquipment(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
