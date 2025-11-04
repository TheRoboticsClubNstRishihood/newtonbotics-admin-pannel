'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../../../components/AdminLayout';
import { useToast } from '../../../../components/ToastContext';

interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}

interface ResearchArea {
  _id: string;
  name: string;
  description: string;
  category: string;
  keywords?: string[];
  color?: string;
  order?: number;
  isActive: boolean;
  isFeatured: boolean;
  focusAreas?: string[];
  requiredEquipment?: string[];
  requiredSkills?: string[];
  studentIds?: string[];
  externalLinks?: ExternalLink[];
  collaborationOpportunities?: string;
  fundingInfo?: string;
  publicationCount?: number;
}

interface ResearchAreaFormData {
  name: string;
  description: string;
  category: string;
  keywords: string[];
  color: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  focusAreas: string[];
  requiredEquipment: string[];
  requiredSkills: string[];
  studentIds: string[];
  externalLinks: ExternalLink[];
  collaborationOpportunities: string;
  fundingInfo: string;
  publicationCount: number;
}

export default function EditResearchAreaPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const [researchArea, setResearchArea] = useState<ResearchArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<ResearchAreaFormData>({
    name: '',
    description: '',
    category: '',
    keywords: [],
    color: '#4F46E5',
    order: 0,
    isActive: true,
    isFeatured: false,
    focusAreas: [],
    requiredEquipment: [],
    requiredSkills: [],
    studentIds: [],
    externalLinks: [],
    collaborationOpportunities: '',
    fundingInfo: '',
    publicationCount: 0
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [teamMembers, setTeamMembers] = useState<Array<{id: string; name: string; email: string; studentId?: string}>>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/';
      return;
    }
    
    if (params.id && params.id !== 'undefined') {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const idString = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!objectIdRegex.test(idString)) {
        console.error('Invalid research area ID format:', idString);
        showError('Invalid research area ID format');
        router.push('/research-areas');
        return;
      }
      fetchResearchArea();
    }
    
    fetchCategories();
    fetchTeamMembers();
  }, [params.id]);

  // Update isCustomCategory when both categories and formData.category are loaded
  useEffect(() => {
    if (categories.length > 0 && formData.category) {
      if (!categories.includes(formData.category)) {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }
    }
  }, [categories, formData.category]);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // Fetch all club members with pagination
      let allMembers: Array<{id: string; name: string; email: string; studentId?: string}> = [];
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
          const clubMembers = data.data?.clubMembers || [];
          
          // Filter out admin users
          const filteredMembers = clubMembers.filter((member: { role?: string }) => 
            member.role !== 'admin'
          );
          
          const members = filteredMembers.map((member: {
            id?: string;
            _id?: string;
            email: string;
            firstName?: string;
            lastName?: string;
            fullName?: string;
            displayName?: string;
            studentId?: string;
          }) => ({
            id: member.id || member._id || '',
            name: member.fullName || member.displayName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email,
            email: member.email,
            studentId: member.studentId
          }));

          allMembers = [...allMembers, ...members];
          
          const pagination = data.data?.pagination;
          hasMore = pagination?.hasMore || false;
          skip += limit;
        } else {
          hasMore = false;
        }
      }

      setTeamMembers(allMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchResearchArea = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const researchAreaId = params.id;
      const idString = Array.isArray(researchAreaId) ? researchAreaId[0] : researchAreaId;
      console.log('Fetching research area with ID:', idString);
      
      const response = await fetch(`/api/research-areas/${idString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const areaData = data.data.item;
        setResearchArea(areaData);
        
        const category = areaData.category || '';
        // Check if category is in the fetched categories list (will be set after categories are loaded)
        // For now, we'll set it after categories are fetched
        setIsCustomCategory(false); // Will be updated when categories are loaded
        
        const loadedStudentIds = areaData.studentIds || [];
        console.log('Loaded research area studentIds from backend:', loadedStudentIds);
        
        setFormData({
          name: areaData.name || '',
          description: areaData.description || '',
          category: category,
          keywords: areaData.keywords || [],
          color: areaData.color || '#4F46E5',
          order: areaData.order || 0,
          isActive: areaData.isActive !== undefined ? areaData.isActive : true,
          isFeatured: areaData.isFeatured || false,
          focusAreas: areaData.focusAreas || [],
          requiredEquipment: areaData.requiredEquipment || [],
          requiredSkills: areaData.requiredSkills || [],
          studentIds: loadedStudentIds,
          externalLinks: areaData.externalLinks || [],
          collaborationOpportunities: areaData.collaborationOpportunities || '',
          fundingInfo: areaData.fundingInfo || '',
          publicationCount: areaData.publicationCount || 0
        });
      } else {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          showError('Your session has expired. Please log in again.');
          router.push('/');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to fetch research area: ${errorData.message || `HTTP ${response.status}`}`);
        router.push('/research-areas');
      }
    } catch (error) {
      console.error('Error fetching research area:', error);
      showError('Network error while fetching research area');
      router.push('/research-areas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/research-areas/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const categoriesList = data.data.categories || [];
        // Sort categories alphabetically
        const sortedCategories = categoriesList.sort((a: string, b: string) => a.localeCompare(b));
        setCategories(sortedCategories);
        
        // isCustomCategory will be updated by useEffect when formData.category is set
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.name.trim()) {
      showError('Name is required');
      return;
    }
    
    if (formData.name.trim().length < 3) {
      showError('Name must be at least 3 characters long');
      return;
    }
    
    if (formData.name.trim().length > 200) {
      showError('Name must be less than 200 characters');
      return;
    }
    
    if (!formData.description.trim()) {
      showError('Description is required');
      return;
    }
    
    if (formData.description.trim().length < 10) {
      showError('Description must be at least 10 characters long');
      return;
    }
    
    if (formData.description.trim().length > 2000) {
      showError('Description must be less than 2000 characters');
      return;
    }

    // Validate external links
    for (let i = 0; i < formData.externalLinks.length; i++) {
      const link = formData.externalLinks[i];
      if (!link.title.trim()) {
        showError(`External link #${i + 1}: Title is required`);
        return;
      }
      if (link.title.trim().length > 100) {
        showError(`External link #${i + 1}: Title must be less than 100 characters`);
        return;
      }
      if (!link.url.trim()) {
        showError(`External link #${i + 1}: URL is required`);
        return;
      }
      if (link.url.trim().length > 500) {
        showError(`External link #${i + 1}: URL must be less than 500 characters`);
        return;
      }
      if (!isValidUrl(link.url.trim())) {
        showError(`External link #${i + 1}: URL must be a valid URL`);
        return;
      }
      if (link.description && link.description.trim().length > 500) {
        showError(`External link #${i + 1}: Description must be less than 500 characters`);
        return;
      }
    }
    
    if (!formData.category.trim()) {
      showError('Category is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // Prepare request data - only include fields that have changed or are required
      const requestData: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        order: formData.order,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        publicationCount: formData.publicationCount
      };

      if (formData.keywords.length > 0) {
        requestData.keywords = formData.keywords;
      }

      if (formData.color && formData.color.trim() !== '') {
        requestData.color = formData.color.trim();
      }

      if (formData.focusAreas.length > 0) {
        requestData.focusAreas = formData.focusAreas;
      }

      if (formData.requiredEquipment.length > 0) {
        requestData.requiredEquipment = formData.requiredEquipment;
      }

      if (formData.requiredSkills.length > 0) {
        requestData.requiredSkills = formData.requiredSkills;
      }

      // Always include studentIds (even if empty array) to ensure proper update
      requestData.studentIds = formData.studentIds;

      // Include externalLinks if any exist (trim and normalize)
      if (formData.externalLinks.length > 0) {
        requestData.externalLinks = formData.externalLinks.map(link => ({
          title: link.title.trim(),
          url: link.url.trim(),
          description: link.description?.trim() || undefined
        })).filter(link => link.title && link.url); // Remove any empty links
      }

      if (formData.collaborationOpportunities && formData.collaborationOpportunities.trim() !== '') {
        requestData.collaborationOpportunities = formData.collaborationOpportunities.trim();
      }

      if (formData.fundingInfo && formData.fundingInfo.trim() !== '') {
        requestData.fundingInfo = formData.fundingInfo.trim();
      }

      const researchAreaId = params.id;
      const idString = Array.isArray(researchAreaId) ? researchAreaId[0] : researchAreaId;
      console.log('Updating research area with ID:', idString);
      console.log('Update data:', requestData);
      console.log('Student IDs being sent:', formData.studentIds);
      
      const response = await fetch(`/api/research-areas/${idString}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (response.ok) {
        console.log('Research area updated successfully:', responseData);
        console.log('Updated research area studentIds in response:', responseData.data?.item?.studentIds);
        showSuccess('Research area updated successfully!');
        router.push('/research-areas');
      } else {
        console.error('Failed to update research area:', responseData);
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          showError('Your session has expired. Please log in again.');
          router.push('/');
          return;
        }
        
        let errorMessage = 'Failed to update research area';
        
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error?.message) {
          errorMessage = responseData.error.message;
        } else if (responseData.error?.details?.errors && Array.isArray(responseData.error.details.errors)) {
          const validationErrors = responseData.error.details.errors.map((err: { message: string }) => err.message).join(', ');
          errorMessage = validationErrors;
        } else if (response.status === 400) {
          errorMessage = 'Invalid data provided. Please check all fields and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to update research areas.';
        } else if (response.status === 404) {
          errorMessage = 'Research area not found.';
        }
        
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating research area:', error);
      showError('Network error while updating research area');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && keywordInput.trim().length <= 100) {
      if (!formData.keywords.includes(keywordInput.trim())) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keywordInput.trim()]
        }));
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const addFocusArea = () => {
    if (focusAreaInput.trim() && focusAreaInput.trim().length <= 200) {
      if (!formData.focusAreas.includes(focusAreaInput.trim())) {
        setFormData(prev => ({
          ...prev,
          focusAreas: [...prev.focusAreas, focusAreaInput.trim()]
        }));
      }
      setFocusAreaInput('');
    }
  };

  const removeFocusArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((_, i) => i !== index)
    }));
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && equipmentInput.trim().length <= 200) {
      if (!formData.requiredEquipment.includes(equipmentInput.trim())) {
        setFormData(prev => ({
          ...prev,
          requiredEquipment: [...prev.requiredEquipment, equipmentInput.trim()]
        }));
      }
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredEquipment: prev.requiredEquipment.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && skillInput.trim().length <= 200) {
      if (!formData.requiredSkills.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          requiredSkills: [...prev.requiredSkills, skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }));
  };


  const removeStudentId = (index: number) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.filter((_, i) => i !== index)
    }));
  };

  const addExternalLink = () => {
    setFormData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { title: '', url: '', description: '' }]
    }));
  };

  const removeExternalLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index)
    }));
  };

  const updateExternalLink = (index: number, field: keyof ExternalLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Research Area">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-2 text-black">Loading research area...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!researchArea) {
    return (
      <AdminLayout pageTitle="Edit Research Area">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-black">Research area not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Edit Research Area">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/research-areas')}
            className="flex items-center space-x-2 text-black hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Research Areas</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-black">Edit Research Area</h1>
            <p className="text-black">Update research area details and information</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Enter research area name"
                    minLength={3}
                    maxLength={200}
                    required
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    <span className={formData.name.length > 200 ? 'text-red-500' : ''}>
                      {formData.name.length}/200
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  {isCustomCategory ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        placeholder="Enter custom category"
                        minLength={2}
                        maxLength={100}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setFormData(prev => ({ ...prev, category: '' }));
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Or select from options
                      </button>
                      <div className="text-xs text-gray-500 text-right">
                        <span className={formData.category.length > 100 ? 'text-red-500' : ''}>
                          {formData.category.length}/100
                        </span>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomCategory(true);
                          setFormData(prev => ({ ...prev, category: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, category: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value="custom">Custom (Enter your own)</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                      placeholder="#4F46E5"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Describe the research area, its objectives, and key aspects..."
                    minLength={10}
                    maxLength={2000}
                    required
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Minimum 10 characters required</span>
                    <span className={formData.description.length > 2000 ? 'text-red-500' : ''}>
                      {formData.description.length}/2000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Keywords</h3>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Enter keyword (max 100 chars)"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Focus Areas</h3>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={focusAreaInput}
                  onChange={(e) => setFocusAreaInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFocusArea();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Enter focus area (max 200 chars)"
                  maxLength={200}
                />
                <button
                  type="button"
                  onClick={addFocusArea}
                  className="px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.focusAreas.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => removeFocusArea(index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Required Equipment */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Required Equipment</h3>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEquipment();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Enter equipment (max 200 chars)"
                  maxLength={200}
                />
                <button
                  type="button"
                  onClick={addEquipment}
                  className="px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredEquipment.map((equipment, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {equipment}
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Required Skills</h3>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Enter skill (max 200 chars)"
                  maxLength={200}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Student IDs */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Team Members</h3>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Search team members..."
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="border border-gray-300 rounded-md max-h-60 overflow-auto">
                  {teamMembers
                    .filter(member => 
                      !formData.studentIds.includes(member.id) &&
                      (studentSearchTerm === '' ||
                       member.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                       member.email.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                    )
                    .map((member) => {
                      const isSelected = formData.studentIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between px-4 py-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                            isSelected ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-black">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            {member.studentId && (
                              <div className="text-xs text-gray-400">Student ID: {member.studentId}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                setFormData(prev => ({
                                  ...prev,
                                  studentIds: [...prev.studentIds, member.id]
                                }));
                              }
                            }}
                            disabled={isSelected}
                            className={`ml-4 px-3 py-1 text-sm rounded-md ${
                              isSelected
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {isSelected ? 'Added' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                  {teamMembers.filter(member => 
                    !formData.studentIds.includes(member.id) &&
                    (studentSearchTerm === '' ||
                     member.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                     member.email.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                  ).length === 0 && (
                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                      {studentSearchTerm ? 'No team members found' : 'All team members have been added'}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-black mb-2">Selected Team Members:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.studentIds.map((memberId, index) => {
                    const member = teamMembers.find(m => m.id === memberId);
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
                      >
                        {member ? member.name : memberId}
                        <button
                          type="button"
                          onClick={() => removeStudentId(index)}
                          className="ml-2 text-amber-600 hover:text-amber-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  {formData.studentIds.length === 0 && (
                    <span className="text-sm text-gray-400">No team members selected</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select team members associated with this research area
              </p>
            </div>

            {/* External Links */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">External Links</h3>
              <div className="space-y-4">
                {formData.externalLinks.map((link, index) => (
                  <div key={index} className="p-4 border border-gray-300 rounded-md bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-black">Link #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExternalLink(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateExternalLink(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          placeholder="e.g., Research Paper, GitHub Repository"
                          maxLength={100}
                          required
                        />
                        <div className="mt-1 text-xs text-gray-500 text-right">
                          <span className={link.title.length > 100 ? 'text-red-500' : ''}>
                            {link.title.length}/100
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateExternalLink(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          placeholder="https://example.com"
                          maxLength={500}
                          required
                        />
                        <div className="mt-1 text-xs text-gray-500 text-right">
                          <span className={link.url.length > 500 ? 'text-red-500' : ''}>
                            {link.url.length}/500
                          </span>
                        </div>
                        {link.url && !isValidUrl(link.url) && (
                          <p className="mt-1 text-xs text-red-500">Please enter a valid URL</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={link.description || ''}
                          onChange={(e) => updateExternalLink(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          placeholder="Brief description of the link..."
                          rows={2}
                          maxLength={500}
                        />
                        <div className="mt-1 text-xs text-gray-500 text-right">
                          <span className={(link.description?.length || 0) > 500 ? 'text-red-500' : ''}>
                            {link.description?.length || 0}/500
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExternalLink}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-black hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  + Add External Link
                </button>
                {formData.externalLinks.length === 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    No external links added. Click &quot;Add External Link&quot; to add one.
                  </p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Collaboration Opportunities
                  </label>
                  <textarea
                    value={formData.collaborationOpportunities}
                    onChange={(e) => setFormData(prev => ({ ...prev, collaborationOpportunities: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Describe collaboration opportunities..."
                    maxLength={1000}
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    <span className={formData.collaborationOpportunities.length > 1000 ? 'text-red-500' : ''}>
                      {formData.collaborationOpportunities.length}/1000
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Funding Information
                  </label>
                  <textarea
                    value={formData.fundingInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundingInfo: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Enter funding information..."
                    maxLength={1000}
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    <span className={formData.fundingInfo.length > 1000 ? 'text-red-500' : ''}>
                      {formData.fundingInfo.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Publication Count
                  </label>
                  <input
                    type="number"
                    value={formData.publicationCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, publicationCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-black">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-black">
                    Featured
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/research-areas')}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Research Area'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

