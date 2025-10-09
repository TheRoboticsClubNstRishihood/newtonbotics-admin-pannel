'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { 
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  TrophyIcon,
  HashtagIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'on_hold';
  category?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  mentorId?: string;
  teamLeaderId?: string;
  imageUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
  achievements?: string[];
  tags?: string[];
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{
    userId: string;
    role: string;
    skills: string;
    responsibilities: string;
    hoursPerWeek: string;
    contribution: string;
  }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    budget: '',
    mentorId: '',
    teamLeaderId: '',
    imageUrl: '',
    videoUrl: '',
    githubUrl: '',
    documentationUrl: '',
    achievements: '',
    tags: '',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedHours: '',
    isPublic: true,
    isFeatured: false
  });

  useEffect(() => {
    fetchUsers();
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProject = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        const projectData = data.data;
        setProject(projectData);
        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          category: projectData.category || '',
          status: projectData.status || 'upcoming',
          startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
          endDate: projectData.endDate ? projectData.endDate.split('T')[0] : '',
          budget: projectData.budget ? projectData.budget.toString() : '',
          mentorId: projectData.mentorId || '',
          teamLeaderId: projectData.teamLeaderId || '',
          imageUrl: projectData.imageUrl || '',
          videoUrl: projectData.videoUrl || '',
          githubUrl: projectData.githubUrl || '',
          documentationUrl: projectData.documentationUrl || '',
          achievements: projectData.achievements ? projectData.achievements.join('\n') : '',
          tags: projectData.tags ? projectData.tags.join(', ') : '',
          priority: projectData.priority || 'medium',
          difficulty: projectData.difficulty || 'intermediate',
          estimatedHours: projectData.estimatedHours ? projectData.estimatedHours.toString() : '',
          isPublic: projectData.isPublic !== undefined ? projectData.isPublic : true,
          isFeatured: projectData.isFeatured || false
        });
      } else {
        alert(data.message || 'Failed to fetch project details');
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to fetch project details');
      router.push('/projects');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTeamMemberField = () => {
    setTeamMembers(prev => [...prev, {
      userId: '',
      role: '',
      skills: '',
      responsibilities: '',
      hoursPerWeek: '',
      contribution: ''
    }]);
  };

  const removeTeamMemberField = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Prepare the project data (without team members)
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
        achievements: formData.achievements ? formData.achievements.split('\n').filter(a => a.trim()) : undefined
      };

      // Update the project first
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (data.success) {
        // Add new team members if any were specified
        const membersToAdd = teamMembers.filter(member => member.userId && member.role);
        
        if (membersToAdd.length > 0) {
          // Add each new team member
          for (const member of membersToAdd) {
            const memberData = {
              userId: member.userId,
              role: member.role,
              skills: member.skills ? member.skills.split(',').map(s => s.trim()) : undefined,
              responsibilities: member.responsibilities ? member.responsibilities.split(',').map(r => r.trim()) : undefined,
              timeCommitment: member.hoursPerWeek ? {
                hoursPerWeek: parseInt(member.hoursPerWeek)
              } : undefined,
              contribution: member.contribution || undefined
            };

            const memberResponse = await fetch(`/api/projects/${params.id}/members`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(memberData)
            });

            if (!memberResponse.ok) {
              console.error('Failed to add team member:', member.userId);
            }
          }
        }
        
        router.push(`/projects/${params.id}`);
      } else {
        alert(data.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const mentors = users.filter(user => user.role === 'mentor' || user.role === 'admin');
  const teamLeaders = users.filter(user => 
    user.role === 'team_leader' || 
    user.role === 'admin' || 
    user.role === 'member'
  );

  if (fetchLoading) {
    return (
      <AdminLayout pageTitle="Edit Project">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout pageTitle="Edit Project">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Project not found
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Edit Project">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600">Update project information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                  maxLength={255}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter project title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the project in detail"
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Robotics, AI, Web Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Priority and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Budget and Estimated Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 120"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Team Assignment</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Team Leader */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Leader *
                </label>
                <select
                  name="teamLeaderId"
                  value={formData.teamLeaderId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Team Leader</option>
                  {teamLeaders.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mentor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mentor
                </label>
                <select
                  name="mentorId"
                  value={formData.mentorId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Mentor (Optional)</option>
                  {mentors.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Team Members */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Team Members</h3>
              <p className="text-sm text-gray-600 mt-1">Add new team members to this project. Existing members can be managed from the project details page.</p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">New Team Member {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeTeamMemberField(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User *
                        </label>
                        <select
                          value={member.userId}
                          onChange={(e) => updateTeamMember(index, 'userId', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select User</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Developer, Designer, Researcher"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills
                        </label>
                        <input
                          type="text"
                          value={member.skills}
                          onChange={(e) => updateTeamMember(index, 'skills', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="JavaScript, React, Node.js"
                        />
                        <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hours per Week
                        </label>
                        <input
                          type="number"
                          value={member.hoursPerWeek}
                          onChange={(e) => updateTeamMember(index, 'hoursPerWeek', e.target.value)}
                          min="1"
                          max="40"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., 20"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Responsibilities
                      </label>
                      <textarea
                        value={member.responsibilities}
                        onChange={(e) => updateTeamMember(index, 'responsibilities', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Frontend development, UI/UX design, Testing"
                      />
                      <p className="text-sm text-gray-500 mt-1">Separate responsibilities with commas</p>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contribution Description
                      </label>
                      <textarea
                        value={member.contribution}
                        onChange={(e) => updateTeamMember(index, 'contribution', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe their key contributions to the project"
                      />
                      <p className="text-sm text-gray-500 mt-1">This will be recorded in the project history</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addTeamMemberField}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resources & Links</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Image URL
                </label>
                <div className="relative">
                  <PhotoIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <div className="relative">
                  <VideoCameraIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository
                </label>
                <div className="relative">
                  <CodeBracketIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://github.com/username/repository"
                  />
                </div>
              </div>

              {/* Documentation URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentation URL
                </label>
                <div className="relative">
                  <DocumentTextIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="documentationUrl"
                    value={formData.documentationUrl}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://docs.example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Achievements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievements
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="List key achievements (one per line)"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <HashtagIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              {/* Visibility and Featured Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Public Project
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Featured Project
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
