'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import CloudinaryUploader from '../../components/CloudinaryUploader';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

type FileType = 'image' | 'video' | 'document' | 'audio';

interface MediaItem {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: FileType;
  fileSize?: number;
  dimensions?: string;
  duration?: number;
  categoryId?: string;
  uploadedBy: string;
  tags?: string[];
  isFeatured?: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryItem {
  _id: string;
  name: string;
}

interface SimpleUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Pagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

interface CloudinaryResult {
  publicId: string;
  secureUrl: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [fileType, setFileType] = useState<FileType | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [limit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, limit: 20, skip: 0, hasMore: false });

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, title: string, fileUrl: string} | null>(null);
  const [deleteFromCloudinary, setDeleteFromCloudinary] = useState(true);
  const [form, setForm] = useState({
    title: '',
    fileUrl: '',
    fileType: '' as FileType | '',
    uploadedBy: '',
    description: '',
    thumbnailUrl: '',
    fileSize: '',
    dimensions: '',
    categoryId: '',
    tags: '',
    isFeatured: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentCategoryId: ''
  });

  const [editForm, setEditForm] = useState<{ _id: string; title: string; description: string; fileType: FileType | ''; categoryId: string; thumbnailUrl: string; tags: string; isFeatured: boolean; fileUrl?: string } | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, [currentPage, searchQuery, fileType, categoryId]);

  const checkAuthAndFetch = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }
      await Promise.all([fetchMedia(), fetchCategoriesOnce(), fetchUsersOnce()]);
    } catch (e) {
      console.error(e);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesOnce = async (force = false) => {
    if (categories.length > 0 && !force) return;
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching categories with token:', token ? 'present' : 'missing');
      
      const res = await fetch('/api/media/categories', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Categories response status:', res.status);
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Categories fetch failed', err);
        return;
      }
      
      const data = await res.json();
      console.log('Categories response data:', data);
      
      const rawRoot: any = (data && data.data) ?? data;
      let list: any[] = [];
      if (Array.isArray(rawRoot)) list = rawRoot;
      else if (Array.isArray(rawRoot.categories)) list = rawRoot.categories;
      else if (Array.isArray(rawRoot?.data?.categories)) list = rawRoot.data.categories;
      else if (Array.isArray(rawRoot.items)) list = rawRoot.items;
      else if (Array.isArray(rawRoot?.categories?.items)) list = rawRoot.categories.items;
      else if (Array.isArray(rawRoot?.data?.items)) list = rawRoot.data.items;

      console.log('Extracted categories list:', list);

      // Normalize minimal shape {_id, name}
      list = (list || []).map((c: any) => ({
        _id: c?._id || c?.id,
        name: c?.name || c?.title || c?.label || 'Unnamed'
      })).filter((c: any) => c._id && c.name);

      console.log('Normalized categories:', list);
      setCategories(list);
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  };

  const fetchUsersOnce = async () => {
    if (users.length > 0) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const params = new URLSearchParams({ limit: '100' });
      const res = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data?.data?.users || data?.users || [];
        if (Array.isArray(raw)) setUsers(raw);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        limit: String(limit),
        skip: String((currentPage - 1) * limit)
      });
      if (searchQuery) params.set('q', searchQuery);
      if (fileType) params.set('fileType', fileType);
      if (categoryId) params.set('categoryId', categoryId);

      const res = await fetch(`/api/media?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        // Support both data.data and data directly
        const list = data.data?.media || data.data?.items || data.media || data.items || [];
        const pg = data.data?.pagination || data.pagination || {
          total: data.total ?? list.length,
          limit,
          skip: (currentPage - 1) * limit,
          hasMore: list.length === limit
        };
        setItems(list);
        setPagination(pg);
      } else {
        setError(data.message || 'Failed to fetch media');
      }
    } catch (e) {
      console.error('Failed to fetch media', e);
      setError('Failed to fetch media');
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || limit))), [pagination, limit]);

  const resetFilters = () => {
    setSearchQuery('');
    setFileType('');
    setCategoryId('');
    setCurrentPage(1);
  };

  const iconForType = (type: FileType) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-5 h-5 text-blue-600"/>;
      case 'video':
        return <PlayCircleIcon className="w-5 h-5 text-rose-600"/>;
      case 'document':
        return <DocumentTextIcon className="w-5 h-5 text-amber-600"/>;
      case 'audio':
        return <MusicalNoteIcon className="w-5 h-5 text-green-600"/>;
    }
  };

  const handleCloudinaryUpload = (result: CloudinaryResult) => {
    // Auto-fill form with Cloudinary data
    setForm(prev => ({
      ...prev,
      fileUrl: result.secureUrl,
      fileSize: result.bytes ? String(result.bytes) : '',
      dimensions: result.width && result.height ? `${result.width}x${result.height}` : '',
      // Auto-detect file type from Cloudinary resource type
      fileType: result.resourceType === 'image' ? 'image' : 
                result.resourceType === 'video' ? 'video' : 
                result.resourceType === 'raw' ? 'document' : 'image'
    }));
  };

  const handleEditCloudinaryUpload = (result: CloudinaryResult) => {
    // Auto-fill edit form with Cloudinary data
    if (editForm) {
      setEditForm(prev => prev ? ({
        ...prev,
        fileUrl: result.secureUrl,
        fileType: result.resourceType === 'image' ? 'image' : 
                  result.resourceType === 'video' ? 'video' : 
                  result.resourceType === 'raw' ? 'document' : prev.fileType,
        // Update thumbnail for images
        thumbnailUrl: result.resourceType === 'image' ? result.secureUrl : prev.thumbnailUrl
      }) : null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }
      const payload: any = {
        title: form.title,
        fileUrl: form.fileUrl,
        fileType: form.fileType,
        uploadedBy: form.uploadedBy
      };
      if (form.description) payload.description = form.description;
      // If image, use fileUrl as thumbnail; otherwise use provided thumbnailUrl
      if (form.fileType === 'image') {
        payload.thumbnailUrl = form.fileUrl;
      } else if (form.thumbnailUrl) {
        payload.thumbnailUrl = form.thumbnailUrl;
      }
      if (form.fileSize) payload.fileSize = Number(form.fileSize);
      if (form.dimensions) payload.dimensions = form.dimensions;
      if (form.categoryId) payload.categoryId = form.categoryId;
      if (form.tags) payload.tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      payload.isFeatured = form.isFeatured;

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to create media');
        return;
      }
      setShowCreate(false);
      setForm({
        title: '', fileUrl: '', fileType: '', uploadedBy: '', description: '', thumbnailUrl: '', fileSize: '', dimensions: '', categoryId: '', tags: '', isFeatured: false
      });
      fetchMedia();
    } catch (e) {
      console.error('Failed to create media', e);
      setError('Failed to create media');
    } finally {
      setCreateLoading(false);
    }
  };

  const testCloudinaryDeletion = async (fileUrl: string) => {
    if (!fileUrl || !fileUrl.includes('cloudinary.com')) {
      console.log('Not a Cloudinary URL:', fileUrl);
      return;
    }

    // Extract public ID from Cloudinary URL
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
    
    if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
      // Extract the full public ID path after the version
      const publicIdParts = urlParts.slice(uploadIndex + 2);
      const publicIdWithFormat = publicIdParts.join('/');
      const publicId = publicIdWithFormat.split('.')[0];
      
      console.log('Testing Cloudinary deletion for:', {
        originalUrl: fileUrl,
        extractedPublicId: publicId,
        urlParts: urlParts
      });

      try {
        const testRes = await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicId,
            resourceType: 'image' // Default to image for testing
          })
        });

        const testResult = await testRes.json();
        console.log('Test deletion result:', testResult);
      } catch (error) {
        console.error('Test deletion error:', error);
      }
    }
  };

  const handleDeleteClick = (id: string, title: string, fileUrl: string) => {
    setItemToDelete({ id, title, fileUrl });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // First, get the media item to extract Cloudinary public ID
      const mediaRes = await fetch(`/api/media/${itemToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      let cloudinaryDeleteSuccess = true;
      if (deleteFromCloudinary && mediaRes.ok) {
        const mediaData = await mediaRes.json();
        const mediaItem = mediaData.data?.item || mediaData.data;
        
        if (mediaItem?.fileUrl && mediaItem.fileUrl.includes('cloudinary.com')) {
          // Extract public ID from Cloudinary URL
          // URL format: https://res.cloudinary.com/cloud_name/resource_type/upload/version/public_id.format
          const urlParts = mediaItem.fileUrl.split('/');
          const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
          
          if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
            // Extract the full public ID path after the version
            const publicIdParts = urlParts.slice(uploadIndex + 2);
            const publicIdWithFormat = publicIdParts.join('/');
            const publicId = publicIdWithFormat.split('.')[0];
            
            // Determine resource type
            const resourceType = mediaItem.fileType === 'video' ? 'video' : 
                                mediaItem.fileType === 'audio' ? 'video' : 'image';

            try {
              console.log('Attempting to delete Cloudinary file:', {
                publicId,
                resourceType,
                originalUrl: mediaItem.fileUrl,
                deleteFromCloudinary: deleteFromCloudinary
              });

              // Delete from Cloudinary
              const cloudinaryRes = await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  publicId,
                  resourceType
                })
              });

              const cloudinaryResult = await cloudinaryRes.json();
              console.log('Cloudinary deletion response:', cloudinaryResult);

              if (!cloudinaryRes.ok) {
                console.warn('Failed to delete from Cloudinary:', cloudinaryResult);
                cloudinaryDeleteSuccess = false;
              } else {
                console.log('Successfully deleted from Cloudinary:', cloudinaryResult);
              }
            } catch (cloudinaryError) {
              console.warn('Cloudinary deletion failed:', cloudinaryError);
              cloudinaryDeleteSuccess = false;
            }
          } else {
            console.warn('Could not extract public ID from Cloudinary URL:', mediaItem.fileUrl);
            cloudinaryDeleteSuccess = false;
          }
        }
      }

      // Delete from database
      const res = await fetch(`/api/media/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        fetchMedia();
        setShowDeleteModal(false);
        setItemToDelete(null);
        if (deleteFromCloudinary && !cloudinaryDeleteSuccess) {
          setError('Media deleted from database, but Cloudinary deletion failed. You may need to manually delete the file.');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to delete media');
      }
    } catch (e) {
      console.error('Failed to delete media', e);
      setError('Failed to delete media');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Media Management">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Media Management">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1 flex gap-3 items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-500"/>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as FileType | '')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All types</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="audio">Audio</option>
                </select>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All categories</option>
                  {Array.isArray(categories) && categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                {(searchQuery || fileType || categoryId) && (
                  <button onClick={resetFilters} className="text-sm text-gray-600 hover:text-gray-800">Clear</button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4"/>
                Add Media
              </button>
              <button
                onClick={() => setShowCreateCategory(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
              >
                <PlusIcon className="w-4 h-4"/>
                Add Category
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {item.thumbnailUrl ? (
                            item.fileType === 'video' ? (
                              <video
                                src={item.fileUrl}
                                className="h-10 w-16 object-cover rounded"
                                muted
                                preload="metadata"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.thumbnailUrl} alt={item.title} className="h-10 w-16 object-cover"/>
                            )
                          ) : (
                            iconForType(item.fileType)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            {item.isFeatured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[320px]">{item.description || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">{item.fileType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categories.find(c => c._id === (item.categoryId as any))?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900">Open</a>
                        <button
                          onClick={() => {
                            setEditForm({
                              _id: item._id,
                              title: item.title || '',
                              description: item.description || '',
                              fileType: item.fileType || '',
                              categoryId: (item.categoryId as any) || '',
                              thumbnailUrl: item.thumbnailUrl || '',
                              tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
                              isFeatured: item.isFeatured || false,
                              fileUrl: item.fileUrl || ''
                            });
                            setShowEdit(true);
                          }}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(item._id, item.title, item.fileUrl)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination?.total > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * (pagination.limit || limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * (pagination.limit || limit), pagination.total)}</span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-lg font-medium text-gray-900">Create Media</h3>
                  <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <form id="create-media-form" onSubmit={handleCreate} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required minLength={2} maxLength={255} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">File URL (or upload below)</label>
                          <input 
                            value={form.fileUrl} 
                            onChange={e => setForm({ ...form, fileUrl: e.target.value })} 
                            placeholder="https://example.com/file.jpg"
                            maxLength={500} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500 px-2">OR</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Upload from device</label>
                          <CloudinaryUploader
                            onUploadComplete={handleCloudinaryUpload}
                            label="Choose File"
                            folder="newtonbotics/media"
                            resourceType="auto"
                            showPreview={true}
                            previewWidth={200}
                            previewHeight={150}
                            maxFileSizeBytes={50 * 1024 * 1024} // 50MB
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                      <select value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value as FileType })} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
                        <option value="">Select type</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="audio">Audio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
                      <select
                        value={form.uploadedBy}
                        onChange={e => setForm({ ...form, uploadedBy: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                      >
                        <option value="">Select user</option>
                        {Array.isArray(users) && users.map((u) => {
                          const uid = (u.id || u._id) as string;
                          const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || uid;
                          return (
                            <option key={uid} value={uid}>{name}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" />
                    </div>

                    {form.fileType !== 'image' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Thumbnail URL</label>
                            <input 
                              value={form.thumbnailUrl} 
                              onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} 
                              placeholder="https://example.com/thumbnail.jpg"
                              maxLength={500} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" 
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="text-xs text-gray-500 px-2">OR</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Upload thumbnail image</label>
                            <CloudinaryUploader
                              onUploadComplete={(result) => {
                                setForm(prev => ({
                                  ...prev,
                                  thumbnailUrl: result.secureUrl
                                }));
                              }}
                              label="Choose Thumbnail"
                              folder="newtonbotics/thumbnails"
                              resourceType="image"
                              showPreview={true}
                              previewWidth={150}
                              previewHeight={100}
                              maxFileSizeBytes={5 * 1024 * 1024} // 5MB
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Size (bytes)</label>
                      <input value={form.fileSize} readOnly title="Auto-detected" type="number" min={0} className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (e.g., 1920x1080)</label>
                      <input value={form.dimensions} readOnly title="Auto-detected for images/videos" maxLength={50} className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
                        <option value="">None</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={form.isFeatured}
                          onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isFeatured" className="ml-2 block text-sm font-medium text-gray-700">
                          Mark as Featured
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Featured items will be highlighted and prioritized in galleries</p>
                    </div>
                  </div>
                  </form>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                  <button type="submit" form="create-media-form" disabled={createLoading} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                    {createLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCreateCategory && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateCategory(false)}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Create Category</h3>
                  <button onClick={() => setShowCreateCategory(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setCreateCategoryLoading(true);
                  try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) { window.location.href = '/'; return; }
                    const payload: any = { name: categoryForm.name };
                    if (categoryForm.description) payload.description = categoryForm.description;
                    if (categoryForm.parentCategoryId) payload.parentCategoryId = categoryForm.parentCategoryId;
                    const res = await fetch('/api/media/categories', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setError(data.message || 'Failed to create category');
                      return;
                    }
                    // Refresh categories list
                    setCategories([]);
                    await fetchCategoriesOnce(true); // Force refresh categories
                    setCategoryForm({ name: '', description: '', parentCategoryId: '' });
                    setShowCreateCategory(false);
                  } catch (err) {
                    console.error('Create category error', err);
                    setError('Failed to create category');
                  } finally {
                    setCreateCategoryLoading(false);
                  }
                }} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required minLength={2} maxLength={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                    <select
                      value={categoryForm.parentCategoryId}
                      onChange={e => setCategoryForm({ ...categoryForm, parentCategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    >
                      <option value="">None</option>
                      {Array.isArray(categories) && categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowCreateCategory(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={createCategoryLoading} className="px-4 py-2 rounded-md text-white bg-gray-900 hover:bg-black disabled:opacity-50">
                      {createCategoryLoading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEdit && editForm && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowEdit(false)}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-lg font-medium text-gray-900">Edit Media</h3>
                  <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                <form id="edit-media-form" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editForm) return;
                  setEditLoading(true);
                  setError('');
                  try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) { window.location.href = '/'; return; }
                    const payload: any = {
                      title: editForm.title,
                      description: editForm.description || undefined,
                      fileType: editForm.fileType || undefined,
                      categoryId: editForm.categoryId || undefined,
                      thumbnailUrl: editForm.thumbnailUrl || undefined,
                      tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                      isFeatured: editForm.isFeatured
                    };
                    
                    // Include fileUrl if it was updated via Cloudinary upload
                    if (editForm.fileUrl) {
                      payload.fileUrl = editForm.fileUrl;
                    }
                    const res = await fetch(`/api/media/${editForm._id}`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setError(data.message || 'Failed to update media');
                      return;
                    }
                    setShowEdit(false);
                    setEditForm(null);
                    fetchMedia();
                  } catch (err) {
                    console.error('Failed to update media', err);
                    setError('Failed to update media');
                  } finally {
                    setEditLoading(false);
                  }
                }} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required minLength={2} maxLength={255} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Replace File</label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Current File URL</label>
                          <input 
                            value={editForm.fileUrl || ''} 
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500 px-2">OR</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Upload new file</label>
                          <CloudinaryUploader
                            onUploadComplete={handleEditCloudinaryUpload}
                            label="Choose New File"
                            folder="newtonbotics/media"
                            resourceType="auto"
                            showPreview={true}
                            previewWidth={200}
                            previewHeight={150}
                            maxFileSizeBytes={50 * 1024 * 1024} // 50MB
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                      <select value={editForm.fileType} onChange={e => setEditForm({ ...editForm, fileType: e.target.value as FileType })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
                        <option value="">Unchanged</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="audio">Audio</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Thumbnail URL</label>
                          <input 
                            value={editForm.thumbnailUrl} 
                            onChange={e => setEditForm({ ...editForm, thumbnailUrl: e.target.value })} 
                            placeholder="https://example.com/thumbnail.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500 px-2">OR</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Upload thumbnail image</label>
                          <CloudinaryUploader
                            onUploadComplete={(result) => {
                              if (editForm) {
                                setEditForm(prev => prev ? ({
                                  ...prev,
                                  thumbnailUrl: result.secureUrl
                                }) : null);
                              }
                            }}
                            label="Choose Thumbnail"
                            folder="newtonbotics/thumbnails"
                            resourceType="image"
                            showPreview={true}
                            previewWidth={150}
                            previewHeight={100}
                            maxFileSizeBytes={5 * 1024 * 1024} // 5MB
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={editForm.categoryId} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
                        <option value="">None</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <input value={editForm.tags} onChange={e => setEditForm({ ...editForm, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500" />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="editIsFeatured"
                          checked={editForm.isFeatured}
                          onChange={e => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="editIsFeatured" className="ml-2 block text-sm font-medium text-gray-700">
                          Mark as Featured
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Featured items will be highlighted and prioritized in galleries</p>
                    </div>
                  </div>
                </form>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                  <button type="submit" form="edit-media-form" disabled={editLoading} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                    {editLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && itemToDelete && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => !deleteLoading && setShowDeleteModal(false)}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Delete Media</h3>
                  <button 
                    onClick={() => !deleteLoading && setShowDeleteModal(false)} 
                    disabled={deleteLoading}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Are you sure you want to delete <strong>"{itemToDelete.title}"</strong>?
                    </p>
                    <p className="text-xs text-gray-500">
                      This action cannot be undone.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="deleteFromCloudinary"
                        checked={deleteFromCloudinary}
                        onChange={e => setDeleteFromCloudinary(e.target.checked)}
                        disabled={deleteLoading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5"
                      />
                      <div className="ml-3">
                        <label htmlFor="deleteFromCloudinary" className="text-sm font-medium text-gray-700">
                          Also delete from Cloudinary
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Remove the file from Cloudinary storage as well. Uncheck to keep the file in Cloudinary.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowDeleteModal(false)} 
                      disabled={deleteLoading}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDeleteConfirm}
                      disabled={deleteLoading}
                      className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {deleteLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
