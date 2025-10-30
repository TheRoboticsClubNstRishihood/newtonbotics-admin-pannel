'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  TagIcon,
  ArrowPathIcon,
  PencilIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/ToastContext';

interface NewsCategory {
  _id: string;
  id?: string; // For compatibility
  name: string;
  description: string;
  createdAt: string;
}

interface NewsArticle {
  _id: string;
  id?: string; // For compatibility
  title: string;
  content: string;
  excerpt?: string;
  authorId: {
    _id: string;
    id?: string; // For compatibility
    firstName?: string;
    lastName?: string;
  };
  categoryId: {
    _id: string;
    id?: string; // For compatibility
    name: string;
    description: string;
  };
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  featuredImageUrl?: string;
  featureOptions: {
    showInNav: boolean;
    navOrder: number;
    navLabel?: string;
  };
  viewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  application?: {
    isEnabled: boolean;
    type: 'workshop' | 'event' | 'competition' | 'other';
    requireLogin: boolean;
    deadline?: string;
    maxApplicants?: number;
    targetType: 'Workshop' | 'Event' | 'Competition' | 'Other';
    targetId?: string;
    formFields: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  };
}

export default function News() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  
  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    isPublished: '',
    isFeatured: '',
    categoryId: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    console.log('User authenticated, fetching news data');
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';
      
      // Fetch articles and categories in parallel
      const [articlesResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/news?${new URLSearchParams({
          limit: '50',
          skip: '0',
          ...(filters.isPublished && { isPublished: filters.isPublished }),
          ...(filters.isFeatured && { isFeatured: filters.isFeatured }),
          ...(filters.categoryId && { categoryId: filters.categoryId })
        })}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/news/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (articlesResponse.ok && categoriesResponse.ok) {
        const [articlesData, categoriesData] = await Promise.all([
          articlesResponse.json(),
          categoriesResponse.json()
        ]);

        console.log('Articles data:', articlesData);
        console.log('Categories data:', categoriesData);

        const normalizedArticles =
          (articlesData && articlesData.data && Array.isArray(articlesData.data.items) && articlesData.data.items) ||
          (articlesData && articlesData.data && Array.isArray(articlesData.data.articles) && articlesData.data.articles) ||
          (articlesData && articlesData.data && Array.isArray(articlesData.data.news) && articlesData.data.news) ||
          (Array.isArray(articlesData.items) && articlesData.items) ||
          (Array.isArray(articlesData.articles) && articlesData.articles) ||
          (Array.isArray(articlesData.news) && articlesData.news) ||
          (Array.isArray(articlesData.data) && articlesData.data) ||
          (Array.isArray(articlesData) ? articlesData : []);

        const normalizedCategories =
          (categoriesData && categoriesData.data && Array.isArray(categoriesData.data.categories) && categoriesData.data.categories) ||
          (Array.isArray(categoriesData.categories) && categoriesData.categories) ||
          (Array.isArray(categoriesData.data) && categoriesData.data) ||
          (Array.isArray(categoriesData) ? categoriesData : []);

        setArticles(normalizedArticles || []);
        setCategories(normalizedCategories || []);
      } else {
        console.log('Backend responses:', {
          articles: articlesResponse.status,
          categories: categoriesResponse.status
        });
        // No data available
        setArticles([]);
        setCategories([]);
        showError(`Unable to fetch news data (Articles: ${articlesResponse.status}, Categories: ${categoriesResponse.status}). Please try again later.`);
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
      showError('Network error while fetching news data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (formData: { name: string; description: string }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';
      const url = isEditing 
        ? `/api/news/categories/${selectedCategory?._id || selectedCategory?.id}`
        : `/api/news/categories`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (isEditing) {
          setCategories(prev => prev.map(category => 
            (category._id || category.id) === (selectedCategory?._id || selectedCategory?.id)
              ? data.data.category
              : category
          ));
          showSuccess('Category updated successfully!');
        } else {
          setCategories(prev => [...prev, data.data.category]);
          showSuccess('Category created successfully!');
        }
        
        setIsCategoryModalOpen(false);
        setSelectedCategory(null);
        setIsEditing(false);
        resetCategoryForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to save category: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showError('Network error while saving category');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setArticles(prev => prev.filter(article => (article._id || article.id) !== id));
        showSuccess('Article deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to delete article: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      showError('Network error while deleting article');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';
      const response = await fetch(`/api/news/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCategories(prev => prev.filter(category => (category._id || category.id) !== id));
        showSuccess('Category deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to delete category: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Network error while deleting category');
    }
  };

  const handleEditCategory = (category: NewsCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setIsEditing(true);
    setIsCategoryModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    setIsCategoryModalOpen(true);
    resetCategoryForm();
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Filter articles based on search query and filters
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout pageTitle="News Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600">Manage news articles and categories</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchNewsData}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            {activeTab === 'articles' ? (
              <button
                onClick={() => router.push('/news/create')}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Article</span>
              </button>
            ) : (
              <button
                onClick={handleCreateCategory}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('articles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'articles'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Articles ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories ({categories.length})
            </button>
          </nav>
        </div>

        {activeTab === 'articles' ? (
          <>
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                <select
                  value={filters.isPublished}
                  onChange={(e) => setFilters(prev => ({ ...prev, isPublished: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="">All Status</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
                <select
                  value={filters.isFeatured}
                  onChange={(e) => setFilters(prev => ({ ...prev, isFeatured: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="">All Featured</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
                                 <select
                   value={filters.categoryId}
                   onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                   className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                 >
                   <option value="">All Categories</option>
                   {categories.map(category => (
                     <option key={category._id || category.id} value={category._id || category.id}>{category.name}</option>
                   ))}
                 </select>
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Articles ({filteredArticles.length})
                </h3>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading articles...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-600">
                    {searchQuery ? 'No articles found matching your search' : 'No articles found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredArticles.map((article) => (
                    <tr key={article._id || article.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{article.title}</div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">{article.content}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {article.categoryId?.name || 'Unknown Category'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                article.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {article.isPublished ? 'Published' : 'Draft'}
                              </span>
                              {article.isFeatured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Featured
                                </span>
                              )}
                              {article.application?.isEnabled && (
                                <div className="space-y-1">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {article.application.type.charAt(0).toUpperCase() + article.application.type.slice(1)} Application
                                  </span>
                                  {article.application.deadline && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Deadline: {new Date(article.application.deadline).toLocaleDateString()}
                                    </span>
                                  )}
                                  {article.application.maxApplicants && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Max: {article.application.maxApplicants}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {article.authorId?.firstName || 'Admin'} {article.authorId?.lastName || 'User'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <EyeIcon className="h-4 w-4 text-gray-400 mr-1" />
                              {article.viewCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                              {formatDate(article.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/news/edit/${article._id || article.id}`)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                                                             <button
                                 onClick={() => {
                                   const id = article._id || article.id;
                                   if (id) handleDeleteArticle(id);
                                 }}
                                 className="text-red-600 hover:text-red-900"
                                 title="Delete"
                               >
                                <TrashIcon className="h-4 w-4" />
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
          </>
        ) : (
          /* Categories Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Categories ({categories.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <TagIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-600">No categories found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                         {categories.map((category) => (
                       <tr key={category._id || category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {category.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {formatDate(category.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const id = category._id || category.id;
                                if (id) handleDeleteCategory(id);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
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
        )}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white text-gray-900">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? 'Edit Category' : 'Create New Category'}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory(categoryForm); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Enter category name..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Enter category description..."
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setSelectedCategory(null);
                      setIsEditing(false);
                      resetCategoryForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
