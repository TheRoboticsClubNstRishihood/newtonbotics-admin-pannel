'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import TeamAnalytics from '@/components/TeamAnalytics';
import ProjectMediaForm from '@/components/ProjectMediaForm';
import { canManageProject, getCurrentUser } from '@/lib/projectPermissions';
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
  ChevronDownIcon,
  ChevronUpIcon
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
    createdAt?: string;
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

interface TeamMemberDetails {
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  profileImageUrl?: string;
  bio?: string;
  skills?: string[];
  department?: string;
  role?: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; _id?: string; role?: string; email?: string } | null>(null);
  const [teamMemberDetails, setTeamMemberDetails] = useState<Map<string, TeamMemberDetails>>(new Map());

  useEffect(() => {
    // Get current user from localStorage
    const user = getCurrentUser();
    setCurrentUser(user);
    
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
      console.log('ProjectDetailsPage: fetched project response', data);

      if (data.success) {
        // Normalize possible shapes: {data: {project: {...}}} or {data: {...}} or {project: {...}}
        const raw = (data?.data && (data.data.project || data.data)) || data.project || data.item || {};
        // Map backend keys to UI expectations
        type MinimalUser = { id?: string; _id?: string; firstName?: string; lastName?: string };
        const normalized = {
          ...raw,
          mentor: raw.mentor || raw.mentorId, // backend sends mentorId as object
          teamLeader: raw.teamLeader || raw.teamLeaderId
        } as Project;
        console.log('ProjectDetailsPage: normalized projectData', normalized);
        setProject(normalized);
        
        // Fetch project members separately to get complete user data
        fetchProjectMembers(params.id as string);
        
        // Also fetch user details for allTeamMembers if they exist
        if (normalized.allTeamMembers && normalized.allTeamMembers.length > 0) {
          fetchAllTeamMemberDetails(normalized.allTeamMembers);
        }
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

  const fetchProjectMembers = async (projectId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Fetch project members from the members endpoint (has more complete user data)
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Project members API response:', data);
        
        const members = data?.data?.members || data?.data?.teamMembers || data?.members || data?.teamMembers || [];
        console.log('Extracted members:', members);
        
        // Build a map of user details from the members response
        const detailsMap = new Map<string, TeamMemberDetails>();
        const userIds = new Set<string>();
        
        // Extract user IDs from members
        members.forEach((member: any) => {
          const userId = member.userId || member.user?.id || member.user?._id || member.id || member._id;
          if (userId) {
            userIds.add(userId);
            
            // If member already has user data, use it
            if (member.user) {
              const user = member.user;
              const firstName = user.firstName || user.fullName?.split(' ')[0] || '';
              const lastName = user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '';
              const fullName = user.fullName || user.displayName || `${firstName} ${lastName}`.trim() || user.email || '';
              
              detailsMap.set(userId, {
                userId,
                firstName,
                lastName,
                fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl || user.avatarUrl,
                bio: user.bio || user.about,
                skills: Array.isArray(user.skills) ? user.skills : (typeof user.skills === 'string' ? user.skills.split(',') : []),
                department: user.department,
                role: member.role || user.role
              });
            }
          }
        });

        // Fetch missing user details from club-members endpoint
        const missingUserIds = Array.from(userIds).filter(id => !detailsMap.has(id));
        console.log('Missing user IDs to fetch:', missingUserIds);
        
        if (missingUserIds.length > 0) {
          // Fetch all club members with pagination
          let allClubMembers: any[] = [];
          const limit = 100;
          let skip = 0;
          let hasMore = true;
          
          while (hasMore && missingUserIds.length > 0) {
            const response = await fetch(`/api/users/club-members?limit=${limit}&skip=${skip}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              const clubMembers = data?.data?.clubMembers || data?.clubMembers || [];
              allClubMembers = [...allClubMembers, ...clubMembers];
              
              const pagination = data?.data?.pagination;
              hasMore = pagination?.hasMore === true;
              skip += limit;
              
              if (clubMembers.length === 0 || allClubMembers.length >= 500) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          }
          
          console.log('Fetched club members:', allClubMembers.length);
          
          // Match missing user IDs with club members
          missingUserIds.forEach(userId => {
            const user = allClubMembers.find((u: any) => (u.id || u._id) === userId);
            if (user) {
              const firstName = user.firstName || user.fullName?.split(' ')[0] || '';
              const lastName = user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '';
              const fullName = user.fullName || user.displayName || `${firstName} ${lastName}`.trim() || user.email || '';
              
              detailsMap.set(userId, {
                userId,
                firstName,
                lastName,
                fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl || user.avatarUrl,
                bio: user.bio || user.about,
                skills: Array.isArray(user.skills) ? user.skills : (typeof user.skills === 'string' ? user.skills.split(',') : []),
                department: user.department,
                role: user.role
              });
            }
          });
        }
        
        console.log('Team member details map:', Array.from(detailsMap.entries()));
        setTeamMemberDetails(detailsMap);
      }
    } catch (err) {
      console.error('Error fetching project members:', err);
    }
  };

  const fetchAllTeamMemberDetails = async (allTeamMembers: Project['allTeamMembers']) => {
    if (!allTeamMembers || allTeamMembers.length === 0) return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Extract unique user IDs from allTeamMembers
    const userIds = new Set<string>();
    allTeamMembers.forEach(member => {
      const memberAny = member as any;
      let userId: string | undefined;
      
      if (typeof memberAny.userId === 'string') {
        userId = memberAny.userId;
      } else if (memberAny.userId && typeof memberAny.userId === 'object') {
        userId = memberAny.userId.id || memberAny.userId._id || memberAny.userId.userId;
      } else {
        userId = memberAny.id || memberAny._id;
      }
      
      if (userId) {
        userIds.add(userId);
      }
    });

    console.log('Fetching details for allTeamMembers, userIds:', Array.from(userIds));

    // Fetch user details from club-members endpoint
    const detailsMap = new Map<string, TeamMemberDetails>();
    
    if (userIds.size > 0) {
      // Fetch all club members with pagination
      let allClubMembers: any[] = [];
      const limit = 100;
      let skip = 0;
      let hasMore = true;
      
      while (hasMore && allClubMembers.length < 500) {
        const response = await fetch(`/api/users/club-members?limit=${limit}&skip=${skip}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const clubMembers = data?.data?.clubMembers || data?.clubMembers || [];
          allClubMembers = [...allClubMembers, ...clubMembers];
          
          const pagination = data?.data?.pagination;
          hasMore = pagination?.hasMore === true;
          skip += limit;
          
          if (clubMembers.length === 0) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log('Fetched club members for allTeamMembers:', allClubMembers.length);
      
          // Match user IDs with club members
          Array.from(userIds).forEach(userId => {
            const user = allClubMembers.find((u: any) => {
              const uId = u.id || u._id;
              const userIdStr = String(userId);
              const uIdStr = String(uId);
              const matches = uIdStr === userIdStr;
              if (!matches && userIdStr && uIdStr) {
                console.log('ID mismatch:', { userId: userIdStr, uId: uIdStr, user: u });
              }
              return matches;
            });
            
            if (user) {
              const firstName = user.firstName || user.fullName?.split(' ')[0] || '';
              const lastName = user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '';
              const fullName = user.fullName || user.displayName || `${firstName} ${lastName}`.trim() || user.email || '';
              
              console.log('Found user for allTeamMembers:', { userId, fullName, profileImageUrl: user.profileImageUrl });
              
              detailsMap.set(userId, {
                userId,
                firstName,
                lastName,
                fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl || user.avatarUrl,
                bio: user.bio || user.about,
                skills: Array.isArray(user.skills) ? user.skills : (typeof user.skills === 'string' ? user.skills.split(',') : []),
                department: user.department,
                role: user.role
              });
            } else {
              console.warn('User not found in club members for allTeamMembers:', userId, 'Searched in', allClubMembers.length, 'members');
              // Log first few club member IDs for debugging
              if (allClubMembers.length > 0) {
                console.log('Sample club member IDs:', allClubMembers.slice(0, 5).map((u: any) => u.id || u._id));
              }
            }
          });
      
      // Merge with existing teamMemberDetails
      setTeamMemberDetails(prev => {
        const merged = new Map(prev);
        detailsMap.forEach((value, key) => {
          merged.set(key, value);
        });
        console.log('Merged team member details for allTeamMembers:', {
          added: detailsMap.size,
          total: merged.size,
          entries: Array.from(merged.entries()).map(([k, v]) => ({ userId: k, name: v.fullName, hasImage: !!v.profileImageUrl }))
        });
        return merged;
      });
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

  const handleMemberAdded = (member: { userId: string; role: string; skills?: string[]; responsibilities?: string[]; timeCommitment?: { hoursPerWeek: number } }) => {
    if (project) {
      // Convert member format to match teamMembers interface
      const convertedMember = {
        id: member.userId,
        firstName: 'New', // Default values since TeamMemberModal doesn't provide name
        lastName: 'Member',
        role: member.role,
        skills: member.skills || [],
        responsibilities: member.responsibilities || [],
        timeCommitment: member.timeCommitment
      };
      
      setProject({
        ...project,
        teamMembers: [...(project.teamMembers || []), convertedMember]
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

  const handleMilestoneAdded = (milestone: { id: string; title: string; description?: string; dueDate: string; status: 'pending' | 'in_progress' | 'completed' | 'overdue'; assignedTo?: { id: string; firstName: string; lastName: string }; completedAt?: string; createdAt: string }) => {
    if (project) {
      // Convert milestone format to match milestones interface
      const convertedMilestone = {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
        status: milestone.status,
        assignedTo: milestone.assignedTo,
        completedAt: milestone.completedAt,
        createdAt: milestone.createdAt
      };
      
      setProject({
        ...project,
        milestones: [...(project.milestones || []), convertedMilestone]
      });
    }
  };

  const handleMilestoneUpdated = (updatedMilestone: { id: string; title: string; description?: string; dueDate: string; status: 'pending' | 'in_progress' | 'completed' | 'overdue'; assignedTo?: { id: string; firstName: string; lastName: string }; completedAt?: string; createdAt: string }) => {
    if (project) {
      // Convert milestone format to match milestones interface
      const convertedMilestone = {
        id: updatedMilestone.id,
        title: updatedMilestone.title,
        description: updatedMilestone.description,
        dueDate: updatedMilestone.dueDate,
        status: updatedMilestone.status,
        assignedTo: updatedMilestone.assignedTo,
        completedAt: updatedMilestone.completedAt,
        createdAt: updatedMilestone.createdAt
      };
      
      setProject({
        ...project,
        milestones: project.milestones?.map(m => 
          m.id === convertedMilestone.id ? convertedMilestone : m
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
              className="flex items-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md shadow-sm"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="ml-2 font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title || 'Untitled Project'}</h1>
              <p className="text-gray-600">Project Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(project.status || 'upcoming')}`}>
              {(project.status || 'upcoming').replace('_', ' ').toUpperCase()}
            </span>
            {canManageProject(project as any, currentUser) && (
              <>
                <a
                  href={`/projects/edit/${project.id || ''}`}
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
              </>
            )}
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
                  <p className="text-gray-900">{project.description || 'No description available'}</p>
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
              </div>
              <div className="px-6 py-4">
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {project.teamMembers.map((member, index) => {
                      const memberAny = member as any;
                      
                      // Extract userId - handle both string and object cases
                      let userId: string | undefined;
                      let userData: any = null;
                      
                      if (typeof memberAny.userId === 'string') {
                        userId = memberAny.userId;
                      } else if (memberAny.userId && typeof memberAny.userId === 'object') {
                        // userId is an object with user data
                        userData = memberAny.userId;
                        userId = userData.id || userData._id || userData.userId;
                      } else {
                        userId = memberAny.id || memberAny.user?.id || memberAny.user?._id;
                      }
                      
                      // Get user data from various sources
                      if (!userData) {
                        userData = memberAny.user || memberAny.userId;
                      }
                      
                      const memberDetails = userId ? teamMemberDetails.get(userId) : null;
                      
                      // Also check allTeamMembers for name
                      const allTeamMemberMatch = userId && project.allTeamMembers 
                        ? project.allTeamMembers.find(m => m.userId === userId || (typeof m.userId === 'object' && (m.userId as any)?.id === userId))
                        : null;
                      
                      // Get name from various sources (prioritize: userData object, fetched details, allTeamMembers, then member data)
                      const firstName = userData?.firstName || 
                        memberDetails?.firstName || 
                        memberAny.firstName || 
                        (allTeamMemberMatch?.name?.split(' ')[0]) || '';
                      const lastName = userData?.lastName || 
                        memberDetails?.lastName || 
                        memberAny.lastName || 
                        (allTeamMemberMatch?.name?.split(' ').slice(1).join(' ')) || '';
                      
                      const fullName = userData?.fullName || 
                        userData?.displayName ||
                        (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}`.trim() : '') ||
                        memberDetails?.fullName || 
                        (memberDetails?.firstName && memberDetails?.lastName ? `${memberDetails.firstName} ${memberDetails.lastName}`.trim() : '') ||
                        allTeamMemberMatch?.name ||
                        memberAny.name || 
                        (firstName && lastName ? `${firstName} ${lastName}`.trim() : '') ||
                        userData?.email ||
                        memberDetails?.email ||
                        memberAny.email ||
                        '';
                      
                      const displayName = fullName || (firstName && lastName ? `${firstName} ${lastName}`.trim() : '') || 'Team Member';
                      const parts = displayName.split(' ').filter(Boolean);
                      const displayFirstName = parts[0] || '';
                      const displayLastName = parts.slice(1).join(' ') || '';
                      const initials = displayFirstName && displayLastName 
                        ? `${displayFirstName.charAt(0).toUpperCase()}${displayLastName.charAt(0).toUpperCase()}`
                        : displayFirstName 
                          ? displayFirstName.substring(0, 2).toUpperCase()
                          : 'TM';
                      
                      const memberRole = memberAny.role || memberDetails?.role || allTeamMemberMatch?.role || 'Member';
                      const memberEmail = userData?.email || memberDetails?.email || memberAny.email;
                      const memberSkills = userData?.skills || memberDetails?.skills || memberAny.skills || [];
                      const memberBio = userData?.bio || memberDetails?.bio || memberAny.bio;
                      const memberDepartment = userData?.department || memberDetails?.department || memberAny.department;
                      const profileImageUrl = userData?.profileImageUrl || memberDetails?.profileImageUrl || memberAny.profileImageUrl;
                      
                      const key = memberAny.id || memberAny._id || userId || `member-${index}`;
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4 flex-1">
                            {profileImageUrl ? (
                              <img 
                                src={profileImageUrl} 
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-medium">
                                  {initials}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {displayName}
                              </p>
                              <p className="text-sm text-gray-600">{memberRole}</p>
                              {memberEmail && (
                                <p className="text-xs text-gray-500 truncate">{memberEmail}</p>
                              )}
                              {memberDepartment && (
                                <p className="text-xs text-gray-500">{memberDepartment}</p>
                              )}
                              {memberSkills && memberSkills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {memberSkills.slice(0, 3).map((skill: string, skillIndex: number) => (
                                    <span 
                                      key={skillIndex}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {memberSkills.length > 3 && (
                                    <span className="text-xs text-gray-500">+{memberSkills.length - 3} more</span>
                                  )}
                                </div>
                              )}
                              {memberBio && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{memberBio}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                      .map((member, index) => {
                        // Extract userId - handle both string and object cases
                        const memberAny = member as any;
                        let userId: string | undefined;
                        
                        if (typeof memberAny.userId === 'string') {
                          userId = memberAny.userId;
                        } else if (memberAny.userId && typeof memberAny.userId === 'object') {
                          userId = memberAny.userId.id || memberAny.userId._id || memberAny.userId.userId;
                        } else {
                          userId = memberAny.id || memberAny._id;
                        }
                        
                        // Get profile image from teamMemberDetails map
                        const memberDetails = userId ? teamMemberDetails.get(userId) : null;
                        const profileImageUrl = memberDetails?.profileImageUrl;
                        
                        // Debug logging
                        if (index === 0) {
                          console.log('Team History - First member:', {
                            member,
                            userId,
                            memberDetails,
                            profileImageUrl,
                            allTeamMemberDetails: Array.from(teamMemberDetails.entries())
                          });
                        }
                        
                        // Generate initials from name
                        const nameParts = member.name.split(' ').filter(Boolean);
                        const initials = nameParts.length >= 2
                          ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
                          : nameParts[0]?.substring(0, 2).toUpperCase() || 'TM';
                        
                        return (
                          <div key={`${userId || member.userId}-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {profileImageUrl ? (
                                <img 
                                  src={profileImageUrl} 
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  <span className="text-sm font-medium">
                                    {initials}
                                  </span>
                                </div>
                              )}
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
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Milestones */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
              </div>
              <div className="px-6 py-4">
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.milestones.map((milestone) => {
                      // Compute assignee display name from various shapes
                      const assignedRaw = milestone.assignedTo as unknown;
                      const assignedObj = (typeof assignedRaw === 'object' && assignedRaw !== null ? assignedRaw : undefined) as
                        | { id?: string; _id?: string; firstName?: string; lastName?: string; name?: string; fullName?: string; displayName?: string }
                        | undefined;
                      const assignedId = (
                        typeof assignedRaw === 'string'
                          ? assignedRaw
                          : (assignedObj?.id || (assignedObj as { _id?: string })?._id)
                      ) as string | undefined;
                      const nameCandidates: string[] = [];
                      if (assignedObj?.firstName || assignedObj?.lastName) {
                        nameCandidates.push(`${assignedObj.firstName || ''} ${assignedObj.lastName || ''}`.trim());
                      }
                      if ((assignedObj as { name?: string })?.name) nameCandidates.push(String((assignedObj as { name?: string }).name));
                      if ((assignedObj as { fullName?: string })?.fullName) nameCandidates.push(String((assignedObj as { fullName?: string }).fullName));
                      if ((assignedObj as { displayName?: string })?.displayName) nameCandidates.push(String((assignedObj as { displayName?: string }).displayName));
                      if (assignedId && project.allTeamMembers) {
                        const match = project.allTeamMembers.find(m => m.userId === assignedId);
                        if (match?.name) nameCandidates.push(match.name);
                      }
                      if (assignedId && project.teamMembers) {
                        const match = project.teamMembers.find(m => m.id === assignedId);
                        if (match) nameCandidates.push(`${match.firstName || ''} ${match.lastName || ''}`.trim());
                      }
                      const assigneeName = (nameCandidates.find(n => n && n.trim().length > 0) || '').trim();

                      return (
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
                          {(assigneeName || milestone.assignedTo) && (
                            <span>Assigned to: {assigneeName || 'Unassigned'}</span>
                          )}
                        </div>
                      </div>
                      );
                    })}
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
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Resources</h3>
                {canManageProject(project as any, currentUser) && (
                  <button
                    onClick={() => setShowMediaForm(!showMediaForm)}
                    className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                  >
                    <span>Manage Media</span>
                    {showMediaForm ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
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
              
              {/* Media Management Form */}
              {showMediaForm && canManageProject(project as any, currentUser) && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <ProjectMediaForm
                    projectId={project.id || (params.id as string)}
                    initialMedia={{
                      imageUrl: project.imageUrl,
                      videoUrl: project.videoUrl,
                      githubUrl: project.githubUrl,
                      documentationUrl: project.documentationUrl,
                    }}
                    onSuccess={(media) => {
                      // Update project state with new media
                      setProject({
                        ...project,
                        ...media
                      });
                      // Optionally close the form after success
                      // setShowMediaForm(false);
                    }}
                    onError={(error) => {
                      console.error('Error updating media:', error);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals removed on read-only page; editing happens in edit view */}
    </AdminLayout>
  );
}
