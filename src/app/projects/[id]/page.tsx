'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import TeamMemberModal from '@/components/TeamMemberModal';
import MilestoneModal from '@/components/MilestoneModal';
import TeamAnalytics from '@/components/TeamAnalytics';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
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
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'on_hold';
  category?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedHours?: number;
  actualHours?: number;
  isPublic?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  rating?: {
    average: number;
    count: number;
  };
  mentor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamLeader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamMembers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    skills?: string[];
    responsibilities?: string[];
    timeCommitment?: {
      hoursPerWeek: number;
    };
  }>;
  allTeamMembers?: Array<{
    userId: string;
    name: string;
    role: string;
    joinedAt: string;
    leftAt?: string;
    isActive: boolean;
    contribution?: string;
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    assignedTo?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    completedAt?: string;
  }>;
  imageUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
  achievements?: string[];
  tags?: string[];
  comments?: Array<{
    userId: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`/api/projects/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setProject(data.data);
      } else {
        setError(data.message || 'Failed to fetch project details');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        router.push('/projects');
      } else {
        alert(data.message || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMemberAdded = (member: any) => {
    if (project) {
      setProject({
        ...project,
        teamMembers: [...(project.teamMembers || []), member]
      });
    }
  };

  const handleMemberRemoved = (userId: string) => {
    if (project) {
      setProject({
        ...project,
        teamMembers: project.teamMembers?.filter(member => member.id !== userId) || []
      });
    }
  };

  const handleMilestoneAdded = (milestone: any) => {
    if (project) {
      setProject({
        ...project,
        milestones: [...(project.milestones || []), milestone]
      });
    }
  };

  const handleMilestoneUpdated = (updatedMilestone: any) => {
    if (project) {
      setProject({
        ...project,
        milestones: project.milestones?.map(m => 
          m.id === updatedMilestone.id ? updatedMilestone : m
        ) || []
      });
    }
  };

  const handleMilestoneDeleted = (milestoneId: string) => {
    if (project) {
      setProject({
        ...project,
        milestones: project.milestones?.filter(m => m.id !== milestoneId) || []
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Project Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !project) {
    return (
      <AdminLayout pageTitle="Project Details">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Project not found'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Project Details">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600">Project Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
            <a
              href={`/projects/edit/${project.id}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Edit</span>
            </a>
            <button
              onClick={handleDeleteProject}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Project Overview</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900">{project.description}</p>
                </div>

                {project.category && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                    <div className="flex items-center">
                      <TagIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{project.category}</span>
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full" 
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{project.progress || 0}%</span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <HashtagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {project.achievements && project.achievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Achievements</h4>
                    <ul className="space-y-2">
                      {project.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <TrophyIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Team Analytics */}
            {project.allTeamMembers && project.allTeamMembers.length > 0 && (
              <TeamAnalytics allTeamMembers={project.allTeamMembers} />
            )}

            {/* Team Members */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Current Team Members</h3>
                <button 
                  onClick={() => setShowTeamModal(true)}
                  className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm">Add Member</span>
                </button>
              </div>
              <div className="px-6 py-4">
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {project.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-900 text-sm">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No team members assigned</p>
                )}
              </div>
            </div>

            {/* Team History */}
            {project.allTeamMembers && project.allTeamMembers.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Team History</h3>
                  <p className="text-sm text-gray-600">Complete record of all team members who have contributed to this project</p>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {project.allTeamMembers
                      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
                      .map((member, index) => (
                        <div key={`${member.userId}-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              <span className="text-sm font-medium">
                                {member.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {member.isActive ? 'ACTIVE' : 'FORMER'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{member.role}</p>
                              {member.contribution && (
                                <p className="text-sm text-gray-600 mt-1">{member.contribution}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div>
                                <span className="font-medium">Joined:</span> {formatDate(member.joinedAt)}
                              </div>
                              {member.leftAt && (
                                <div>
                                  <span className="font-medium">Left:</span> {formatDate(member.leftAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Milestones */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
                <button 
                  onClick={() => setShowMilestoneModal(true)}
                  className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm">Add Milestone</span>
                </button>
              </div>
              <div className="px-6 py-4">
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.milestones.map((milestone) => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>Due: {formatDate(milestone.dueDate)}</span>
                          </div>
                          {milestone.assignedTo && (
                            <span>Assigned to: {milestone.assignedTo.firstName} {milestone.assignedTo.lastName}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No milestones defined</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Dates */}
                {project.startDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Start Date</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDate(project.startDate)}
                    </div>
                  </div>
                )}

                {project.endDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">End Date</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDate(project.endDate)}
                    </div>
                  </div>
                )}

                {/* Budget */}
                {project.budget && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Budget</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      ${project.budget.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Priority */}
                {project.priority && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Priority</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Difficulty */}
                {project.difficulty && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Difficulty</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Estimated Hours */}
                {project.estimatedHours && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Estimated Hours</h4>
                    <div className="text-sm text-gray-900">
                      {project.estimatedHours.toLocaleString()} hours
                    </div>
                  </div>
                )}

                {/* Actual Hours */}
                {project.actualHours && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Actual Hours</h4>
                    <div className="text-sm text-gray-900">
                      {project.actualHours.toLocaleString()} hours
                    </div>
                  </div>
                )}

                {/* View Count */}
                {project.viewCount !== undefined && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Views</h4>
                    <div className="text-sm text-gray-900">
                      {project.viewCount.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Rating */}
                {project.rating && project.rating.count > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Rating</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-1">⭐</span>
                      {project.rating.average.toFixed(1)} ({project.rating.count} reviews)
                    </div>
                  </div>
                )}

                {/* Visibility */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Visibility</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.isPublic ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                    {project.isFeatured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Leader */}
                {project.teamLeader && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Team Leader</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      {project.teamLeader.firstName} {project.teamLeader.lastName}
                    </div>
                  </div>
                )}

                {/* Mentor */}
                {project.mentor && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Mentor</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      {project.mentor.firstName} {project.mentor.lastName}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                  <div className="flex items-center text-sm text-gray-900">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(project.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Resources</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {project.imageUrl && (
                  <a
                    href={project.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <PhotoIcon className="w-4 h-4 mr-2" />
                    Project Image
                  </a>
                )}

                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    Project Video
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <CodeBracketIcon className="w-4 h-4 mr-2" />
                    GitHub Repository
                  </a>
                )}

                {project.documentationUrl && (
                  <a
                    href={project.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Documentation
                  </a>
                )}

                {!project.imageUrl && !project.videoUrl && !project.githubUrl && !project.documentationUrl && (
                  <p className="text-gray-500 text-sm">No resources available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Member Modal */}
      <TeamMemberModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        projectId={params.id as string}
        existingMembers={project?.teamMembers || []}
        onMemberAdded={handleMemberAdded}
        onMemberRemoved={handleMemberRemoved}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        projectId={params.id as string}
        existingMilestones={project?.milestones || []}
        onMilestoneAdded={handleMilestoneAdded}
        onMilestoneUpdated={handleMilestoneUpdated}
        onMilestoneDeleted={handleMilestoneDeleted}
      />
    </AdminLayout>
  );
}
