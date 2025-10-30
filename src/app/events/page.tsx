'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/ToastContext';
import Image from 'next/image';

interface Event {
  _id: string;
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  currentRegistrations: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  category?: string; // Make category optional
  type: string;
  isFeatured: boolean;
  imageUrl?: string;
  requiresRegistration: boolean;
  registrationDeadline?: string;
  registrationFormLink?: string;
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


export default function EventsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Events loaded:', data.data.items?.length || 0, 'events');
        console.log('First event ID:', data.data.items?.[0]?._id);
        console.log('First event imageUrl:', data.data.items?.[0]?.imageUrl);
        setEvents(data.data.items || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to fetch events: ${errorData.message || `HTTP ${response.status}`}`);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Network error while fetching events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const eventId = getEventId(selectedEvent);
      console.log('Deleting event with ID:', eventId);

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Event deleted successfully');
        setShowDeleteModal(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to delete event: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Network error while deleting event');
    } finally {
      setIsSubmitting(false);
    }
  };



  const openDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const getEventId = (event: Event) => {
    return event._id || event.id || '';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' },
      ongoing: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ongoing' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: string | undefined) => {
    if (!category) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          No Category
        </span>
      );
    }

    const categoryConfig = {
      workshop: { bg: 'bg-purple-100', text: 'text-purple-800' },
      seminar: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      competition: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      meeting: { bg: 'bg-gray-100', text: 'text-gray-800' },
      exhibition: { bg: 'bg-green-100', text: 'text-green-800' },
      training: { bg: 'bg-blue-100', text: 'text-blue-800' },
      networking: { bg: 'bg-pink-100', text: 'text-pink-800' },
      technical: { bg: 'bg-orange-100', text: 'text-orange-800' },
      educational: { bg: 'bg-teal-100', text: 'text-teal-800' },
      showcase: { bg: 'bg-red-100', text: 'text-red-800' }
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.meeting;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <AdminLayout pageTitle="Events">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Events</h1>
            <p className="text-black">Manage events, workshops, and activities</p>
          </div>
          <button
            onClick={() => router.push('/events/create')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Event
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            >
              <option value="all">All Categories</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="competition">Competition</option>
              <option value="meeting">Meeting</option>
              <option value="exhibition">Exhibition</option>
              <option value="training">Training</option>
              <option value="networking">Networking</option>
              <option value="technical">Technical</option>
              <option value="educational">Educational</option>
              <option value="showcase">Showcase</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">
              Events ({filteredEvents.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-black">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-black mb-2">No events found</h3>
              <p className="text-black mb-4">
                {searchTerm ? 'No events match your search.' : 'Get started by adding your first event.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/events/create')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Event
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {event.imageUrl ? (
                              <Image
                                src={event.imageUrl.includes('cloudinary.com') 
                                  ? event.imageUrl.replace(/\.(tiff|tif)$/i, '.jpg') + '?f_auto,q_auto'
                                  : event.imageUrl}
                                alt={event.title}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                                onError={(e) => {
                                  console.log('Image failed to load:', event.imageUrl);
                                  console.log('Trying fallback URL...');
                                  // Try original URL as fallback
                                  if (event.imageUrl && e.currentTarget.src !== event.imageUrl) {
                                    e.currentTarget.src = event.imageUrl;
                                    return;
                                  }
                                  // If still fails, show fallback icon
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className={`h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center ${event.imageUrl ? 'hidden' : ''}`}
                            >
                              <CalendarIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">{event.title}</div>
                            <div className="text-sm text-black">{event.description.substring(0, 100)}...</div>
                            <div className="mt-1 flex items-center space-x-2">
                              {getCategoryBadge(event.category)}
                              {event.isFeatured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  ⭐ Featured
                                </span>
                              )}
                              {event.featureOptions?.showInNav && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  🧭 Nav: {event.featureOptions.navLabel || 'Menu'}
                                </span>
                              )}
                              {event.requiresRegistration && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Registration Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          <div>{new Date(event.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-black">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {event.currentRegistrations}/{event.maxCapacity}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((event.currentRegistrations / event.maxCapacity) * 100)}% full
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              console.log('Edit button clicked for event:', event._id);
                              // Validate MongoDB ObjectId format
                              const objectIdRegex = /^[0-9a-fA-F]{24}$/;
                              if (!objectIdRegex.test(event._id)) {
                                console.error('Invalid event ID format:', event._id);
                                showError('Invalid event ID format');
                                return;
                              }
                              router.push(`/events/edit/${event._id}`);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(event)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-black mt-4">Delete Event</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-black">
                  Are you sure you want to delete &quot;{selectedEvent.title}&quot;? This action cannot be undone.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Event ID: {getEventId(selectedEvent)}
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
