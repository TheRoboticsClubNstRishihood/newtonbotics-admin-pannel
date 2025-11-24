'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { canManageProject, getCurrentUser, getUserId, getProjectLeaderId, isProjectLeader } from '@/lib/projectPermissions';
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  HashtagIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import CloudinaryUploader from '@/components/CloudinaryUploader';

interface User {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
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

interface Milestone {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
  completedAt?: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id?: string; _id?: string; role?: string; email?: string } | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [existingMembers, setExistingMembers] = useState<Array<{
    id?: string;
    userId?: string;
    user?: { id?: string; firstName?: string; lastName?: string; email?: string };
    role?: string;
    skills?: string[];
    responsibilities?: string[];
    timeCommitment?: { hoursPerWeek?: number };
    hoursPerWeek?: number;
    contribution?: string;
  }>>([]);

  const getUserId = (u: Partial<User> | undefined | null) => {
    if (!u) return '';
    return (typeof u.id === 'string' && u.id) || (typeof u._id === 'string' && u._id) || '';
  };

  const formatUserLabel = (u: Partial<User>) => {
    const first = typeof u.firstName === 'string' ? u.firstName : '';
    const last = typeof u.lastName === 'string' ? u.lastName : '';
    const email = typeof u.email === 'string' ? u.email : '';
    const name = `${first} ${last}`.trim();
    return name || email || getUserId(u);
  };

  const getMemberDisplay = (m: { user?: Partial<User>; userId?: unknown }) => {
    const userObj = m.user as Partial<User> | undefined;
    const idFromObj = (m.userId as { id?: string } | undefined)?.id;
    const idFromStr = typeof m.userId === 'string' ? m.userId : (typeof idFromObj === 'string' ? idFromObj : '');
    const fallback = users.find(u => getUserId(u) === idFromStr);
    const label = userObj ? formatUserLabel(userObj) : (fallback ? formatUserLabel(fallback) : '');
    const email = userObj?.email || fallback?.email || '';
    return { label, email, userIdStr: idFromStr };
  };

  const extractMemberId = (m: { id?: string; _id?: string; memberId?: unknown; userId?: unknown }) => {
    const memberIdDirect = (m.id as string) || (m._id as string);
    if (memberIdDirect) return memberIdDirect;
    const memberIdField = typeof m.memberId === 'string' ? m.memberId : (m.memberId as { id?: string })?.id;
    if (memberIdField) return memberIdField as string;
    const userIdField = typeof m.userId === 'string' ? (m.userId as string) : (m.userId as { id?: string })?.id;
    return userIdField || '';
  };

  const [roleEdits, setRoleEdits] = useState<Record<string, string>>({});

  const handleChangeMemberRole = (memberKey: string, value: string) => {
    setRoleEdits(prev => ({ ...prev, [memberKey]: value }));
  };

  const handleSaveMemberRole = async (member: typeof existingMembers[number]) => {
    const memberId = extractMemberId(member);
    if (!memberId) return alert('Member id not found');
    const token = localStorage.getItem('accessToken');
    try {
      const newRole = roleEdits[memberId] || member.role || '';
      const res = await fetch(`/api/projects/${params.id}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update member');
      // Refresh members
      await fetchExistingMembers();
      setRoleEdits(prev => { const { [memberId]: _, ...rest } = prev; return rest; });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update member');
    }
  };

  const handleDeleteMember = async (member: typeof existingMembers[number]) => {
    if (!confirm('Remove this team member?')) return;
    const memberId = extractMemberId(member);
    if (!memberId) return alert('Member id not found');
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/projects/${params.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to remove member');
      }
      await fetchExistingMembers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove member');
    }
  };
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

  // Milestones state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState<{ title: string; description: string; dueDate: string; assignedTo: string }>({
    title: '', description: '', dueDate: '', assignedTo: ''
  });
  const [savingMilestoneId, setSavingMilestoneId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = getCurrentUser();
    setCurrentUser(user);
    
    fetchUsers();
    if (params.id) {
      fetchProject();
      fetchExistingMembers();
    }
  }, [params.id]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Try club-members endpoint first (accessible to any authenticated user, no role restriction)
      // This endpoint is available to team_member, admin, mentor, etc. - any authenticated user
      // Fetch all club members with pagination
      console.log('Edit Project: Fetching all club members with pagination...');
      let allRawUsers: any[] = [];
      const limit = 100;
      let skip = 0;
      let hasMore = true;
      let response: Response;
      let data: any;
      let clubMembersSuccess = false;

      // Fetch all club members with pagination
      while (hasMore) {
        console.log(`Edit Project: Fetching club members: limit=${limit}, skip=${skip}`);
        response = await fetch(`/api/users/club-members?limit=${limit}&skip=${skip}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        data = await response.json();
        console.log(`Edit Project: Club-members API response status (skip=${skip}):`, response.status);
        console.log(`Edit Project: Club-members API response data:`, data);

        if (response.ok && data.success) {
          clubMembersSuccess = true;
          const pageUsers = Array.isArray(data.data?.clubMembers) 
            ? data.data.clubMembers 
            : Array.isArray(data.clubMembers)
            ? data.clubMembers
            : [];
          
          console.log(`Edit Project: Extracted ${pageUsers.length} club members from response`);
          console.log(`Edit Project: Response structure - data.data?.clubMembers:`, Array.isArray(data.data?.clubMembers) ? data.data.clubMembers.length : 'not array');
          console.log(`Edit Project: Response structure - data.clubMembers:`, Array.isArray(data.clubMembers) ? data.clubMembers.length : 'not array');
          console.log(`Edit Project: Full response keys:`, Object.keys(data));
          if (data.data) {
            console.log(`Edit Project: data.data keys:`, Object.keys(data.data));
          }
          
          allRawUsers = [...allRawUsers, ...pageUsers];
          console.log(`Edit Project: Fetched ${pageUsers.length} club members (total so far: ${allRawUsers.length})`);
          
          // Check if there are more pages
          const pagination = data.data?.pagination;
          hasMore = pagination?.hasMore === true;
          console.log(`Edit Project: Pagination info:`, pagination);
          console.log(`Edit Project: hasMore: ${hasMore}, pageUsers.length: ${pageUsers.length}`);
          
          // Only stop if we've fetched a reasonable amount OR if pagination says no more
          // Don't stop just because first page is empty - might be a response structure issue
          if (allRawUsers.length >= 500) {
            hasMore = false;
          } else if (pageUsers.length === 0 && !hasMore) {
            // Only stop if no more pages AND no users on this page
            hasMore = false;
          }
          
          skip += limit;
        } else {
          console.error(`Edit Project: Club-members API failed - status: ${response.status}, success: ${data.success}`);
          console.error(`Edit Project: Error message:`, data.message || data.error?.message || data.error || 'Unknown error');
          console.error(`Edit Project: Full error response:`, data);
          hasMore = false;
        }
      }

      const rawUsers = allRawUsers;
      console.log('Edit Project: Total club members fetched:', rawUsers.length);
      
      // If club-members returned no data, log the full response for debugging
      if (!clubMembersSuccess || rawUsers.length === 0) {
        console.error('Edit Project: Club-members endpoint returned no data. Full response:', data);
      }

      // Normalize user IDs
      const normalizedUsers = rawUsers.map((user: Record<string, unknown>) => {
        const resolvedId = typeof user.id === 'string' && user.id
          ? user.id
          : typeof (user as { _id?: string })._id === 'string' && (user as { _id?: string })._id
            ? (user as { _id?: string })._id
            : typeof (user as { userId?: string }).userId === 'string' && (user as { userId?: string }).userId
              ? (user as { userId?: string }).userId
              : '';
        return {
          ...user,
          id: resolvedId || undefined,
          _id: (user as { _id?: string })._id || resolvedId || undefined,
          firstName: (user.firstName as string) || ((user.fullName as string)?.split(' ')[0]) || '',
          lastName: (user.lastName as string) || ((user.fullName as string)?.split(' ').slice(1).join(' ')) || '',
          email: user.email || '',
          role: user.role || 'team_member'
        } as User;
      }).filter(user => user.id); // Filter out users without valid IDs

      if (normalizedUsers.length > 0) {
        setUsers(normalizedUsers);
      } else {
        // Add current user as fallback
        const currentUser = getCurrentUser();
        if (currentUser) {
          const userId = getUserId(currentUser);
          if (userId) {
            setUsers([{
              id: userId,
              _id: userId,
              firstName: (currentUser as any).firstName || '',
              lastName: (currentUser as any).lastName || '',
              email: (currentUser as any).email || '',
              role: currentUser.role || 'team_member'
            } as User]);
            console.log('Edit Project: Added current user as fallback');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Add current user as fallback on error
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userId = getUserId(currentUser);
        if (userId) {
          const userAny = currentUser as any;
          setUsers([{
            id: userId,
            _id: userId,
            firstName: userAny.firstName || '',
            lastName: userAny.lastName || '',
            email: userAny.email || '',
            role: currentUser.role || 'team_member'
          } as User]);
        }
      }
    }
  };

  const extractUserId = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const candidate = value as { id?: string; _id?: string };
      return candidate.id || candidate._id || '';
    }
    return '';
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
      console.log('EditProjectPage: fetched project response', data);
      if (data.success) {
        // Normalize possible shapes: {data: {project: {...}}} or {data: {...}} or {project: {...}}
        const raw = (data?.data && (data.data.project || data.data)) || data.project || data.item || {};
        console.log('EditProjectPage: normalized projectData', raw);
        setProject(raw);
        
        // Check if user has permission to edit
        const user = getCurrentUser();
        if (!canManageProject(raw, user)) {
          setAccessError('You do not have permission to manage this project. Only project leaders, mentors, or admins can edit projects.');
        }
        // Extract milestones if present
        const rawMilestones = Array.isArray((raw as unknown as { milestones?: Milestone[] }).milestones)
          ? (raw as unknown as { milestones: Milestone[] }).milestones
          : [];
        setMilestones(rawMilestones);
        setFormData({
          title: raw.title ?? '',
          description: raw.description ?? '',
          category: raw.category ?? '',
          status: raw.status ?? 'upcoming',
          startDate: raw.startDate ? String(raw.startDate).split('T')[0] : '',
          endDate: raw.endDate ? String(raw.endDate).split('T')[0] : '',
          budget: raw.budget != null ? String(raw.budget) : '',
          mentorId: extractUserId((raw as { mentorId?: unknown }).mentorId ?? (raw as { mentor?: unknown }).mentor),
          teamLeaderId: extractUserId((raw as { teamLeaderId?: unknown }).teamLeaderId ?? (raw as { teamLeader?: unknown }).teamLeader),
          imageUrl: raw.imageUrl ?? '',
          videoUrl: raw.videoUrl ?? '',
          githubUrl: raw.githubUrl ?? '',
          documentationUrl: raw.documentationUrl ?? '',
          achievements: Array.isArray(raw.achievements) ? raw.achievements.join('\n') : '',
          tags: Array.isArray(raw.tags) ? raw.tags.join(', ') : '',
          priority: raw.priority ?? 'medium',
          difficulty: raw.difficulty ?? 'intermediate',
          estimatedHours: raw.estimatedHours != null ? String(raw.estimatedHours) : '',
          isPublic: raw.isPublic !== undefined ? raw.isPublic : true,
          isFeatured: Boolean(raw.isFeatured)
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

  const fetchExistingMembers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${params.id}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        // Normalize various possible shapes
        const list = (data?.data?.members)
          || (data?.members)
          || (Array.isArray(data?.data) ? data.data : [])
          || [];
        setExistingMembers(Array.isArray(list) ? list : []);
      } else {
        console.warn('Failed to fetch existing members', data);
        setExistingMembers([]);
      }
    } catch (error) {
      console.error('Error fetching existing members:', error);
      setExistingMembers([]);
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
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        achievements: formData.achievements ? formData.achievements.split('\n').map(a => a.trim()).filter(Boolean) : undefined
      };
      // Ensure only valid keys are sent
      Object.keys(projectData).forEach((k) => {
        const value = (projectData as Record<string, unknown>)[k];
        if (value === '' || value === undefined) {
          delete (projectData as Record<string, unknown>)[k];
        }
      });

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
        // Clear any previous access errors
        setAccessError(null);
        
        // Add new team members if any were specified
        const membersToAdd = teamMembers.filter(member => member.userId && member.role);
        
        if (membersToAdd.length > 0) {
          // Add each new team member
          for (const member of membersToAdd) {
            // Validate userId before sending
            const idToUse = String(member.userId || '').trim();
            const looksLikeObjectId = /^[a-fA-F0-9]{24}$/.test(idToUse);
            const selectedUser = users.find(u => getUserId(u) === idToUse);
            if (!idToUse || !looksLikeObjectId || !selectedUser) {
              console.warn('Skipping invalid team member userId', { idToUse, looksLikeObjectId, hasSelectedUser: !!selectedUser });
              alert('Please select a valid user for the team member.');
              continue;
            }
            const computedFirst = selectedUser?.firstName || undefined;
            const computedLast = selectedUser?.lastName || undefined;
            const computedName = [computedFirst, computedLast].filter(Boolean).join(' ') || undefined;
            const memberData = {
              userId: idToUse,
              role: member.role,
              // Provide name fields for backend validation
              name: computedName,
              userName: computedName,
              firstName: computedFirst,
              lastName: computedLast,
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
              let errMsg = '';
              try {
                const errJson = await memberResponse.json();
                errMsg = errJson.message || errJson.error?.message || JSON.stringify(errJson);
              } catch {
                try { errMsg = await memberResponse.text(); } catch {}
              }
              console.error('Failed to add team member:', member.userId, errMsg);
              alert(errMsg || 'Failed to add team member');
            }
          }
        }
        
        router.push(`/projects/${params.id}`);
      } else {
        const errorMessage = data.error?.message || data.message || 'Failed to update project';
        if (errorMessage.includes('Access denied') || errorMessage.includes('permission')) {
          setAccessError(errorMessage);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      if (errorMessage.includes('Access denied') || errorMessage.includes('permission')) {
        setAccessError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const mentors = users.filter(user => {
    const role = (user.role || '').toLowerCase().trim();
    return role === 'mentor' || role === 'admin' || role === 'researcher';
  });
  
  const teamLeaders = users.filter(user => {
    const userId = getUserId(user);
    // Show ALL club members as potential team leaders (any authenticated user can be a team leader)
    return userId; // Include all users with valid IDs
  });
  
  // Debug logging
  useEffect(() => {
    if (users.length > 0) {
      console.log('Edit Project - Total users fetched:', users.length);
      console.log('Edit Project - Users with roles:', users.map(u => ({ id: getUserId(u), role: u.role, name: formatUserLabel(u) })));
      console.log('Edit Project - Team leaders filtered:', teamLeaders.length);
      console.log('Edit Project - Team leaders details:', teamLeaders.map(u => ({ id: getUserId(u), role: u.role, name: formatUserLabel(u) })));
    }
  }, [users, teamLeaders]);

  // Debug logging for permission check (must be before any conditional returns)
  useEffect(() => {
    if (project && currentUser) {
      const userId = getUserId(currentUser);
      const leaderId = getProjectLeaderId(project as any);
      const canEditValue = canManageProject(project as any, currentUser);
      const isLeader = isProjectLeader(project as any, currentUser);
      console.log('=== PERMISSION DEBUG ===');
      console.log('Current User:', {
        id: userId,
        _id: (currentUser as any)._id,
        role: currentUser.role,
        fullUser: currentUser
      });
      console.log('Project:', {
        id: (project as any).id,
        teamLeaderId: (project as any).teamLeaderId,
        teamLeaderIdType: typeof (project as any).teamLeaderId,
        teamLeaderIdValue: (project as any).teamLeaderId
      });
      console.log('Extracted Leader ID:', leaderId);
      console.log('IDs Match:', userId === leaderId);
      console.log('Can Edit:', canEditValue);
      console.log('Is Project Leader:', isLeader);
      console.log('======================');
    }
  }, [project, currentUser]);

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

  // Check if user has permission to edit
  const canEdit = canManageProject(project as any, currentUser);
  
  if (accessError || !canEdit) {
    return (
      <AdminLayout pageTitle="Edit Project">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md shadow-sm"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="ml-2 font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
              <p className="text-gray-600">Access Restricted</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {accessError || 'You do not have permission to manage this project. Only project leaders, mentors, or admins can edit projects.'}
          </div>
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
            className="flex items-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="ml-2 font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600">Update project information</p>
          </div>
        </div>

        {/* Access Error Display */}
        {accessError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm mt-1">{accessError}</p>
          </div>
        )}

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
                  {teamLeaders.map(user => {
                    const id = getUserId(user);
                    if (!id) return null;
                    return (
                      <option key={id} value={id}>
                        {formatUserLabel(user)}{user.email ? ` (${user.email})` : ''}
                      </option>
                    );
                  })}
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
                  {mentors.map(user => {
                    const id = getUserId(user);
                    if (!id) return null;
                    return (
                      <option key={id} value={id}>
                        {formatUserLabel(user)}{user.email ? ` (${user.email})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Existing Team Members */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Existing Team Members</h3>
              <p className="text-sm text-gray-600 mt-1">These members are already part of this project.</p>
            </div>
            <div className="px-6 py-4">
              {existingMembers.length === 0 ? (
                <p className="text-sm text-gray-500">No team members found.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {existingMembers.map((m, idx) => {
                    const { label, email, userIdStr } = getMemberDisplay(m);
                    const memberKey = extractMemberId(m) || userIdStr || String(idx);
                    const hours = typeof m.hoursPerWeek === 'number' ? m.hoursPerWeek : (m.timeCommitment?.hoursPerWeek || undefined);
                    return (
                      <div key={memberKey} className="py-3 flex flex-col gap-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{label || email || userIdStr || 'Member'}</div>
                            {email && <div className="text-xs text-gray-600">{email}</div>}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Role:</span>
                              <input
                                type="text"
                                value={roleEdits[memberKey] ?? (m.role || '')}
                                onChange={(e) => handleChangeMemberRole(memberKey, e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveMemberRole(m)}
                                className="px-2 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
                                disabled={(roleEdits[memberKey] ?? (m.role || '')) === (m.role || '')}
                              >
                                Save
                              </button>
                            </div>
                            {typeof hours === 'number' && <span><span className="text-gray-500">Hours/Week:</span> {hours}</span>}
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m)}
                              className="px-2 py-1 bg-red-600 text-white rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {m.contribution && <div className="text-sm text-gray-700"><span className="text-gray-500">Contribution:</span> {m.contribution}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
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
                  <div>
                    <CloudinaryUploader
                      label={formData.imageUrl ? 'Replace Image' : 'Upload Image'}
                      folder="newtonbotics/projects/images"
                      resourceType="image"
                      onUploadComplete={(res) => setFormData(prev => ({ ...prev, imageUrl: res.secureUrl || res.url }))}
                      showPreview={false}
                    />
                    <p className="text-xs text-gray-500 mt-1">You can paste a URL or upload an image.</p>
                  </div>
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

          {/* Milestones */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
              <p className="text-sm text-gray-600 mt-1">Add and update project milestones. These are managed via dedicated endpoints.</p>
            </div>
            <div className="px-6 py-4 space-y-6">
              {/* Existing milestones list */}
              {milestones.length === 0 ? (
                <p className="text-sm text-gray-500">No milestones yet.</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map((m) => {
                    const id = String((m as { id?: string; _id?: string }).id || (m as { _id?: string })._id || '');
                    // Resolve assignee name for display
                    const assignedRaw = (m as { assignedTo?: unknown }).assignedTo;
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
                    if (assignedId && users.length > 0) {
                      const matchUser = users.find(u => getUserId(u) === String(assignedId));
                      if (matchUser) nameCandidates.push(`${matchUser.firstName || ''} ${matchUser.lastName || ''}`.trim());
                    }
                    if (assignedId && existingMembers.length > 0) {
                      const matchMember = existingMembers.find(em => String((em.userId as string) || (em.user as { id?: string })?.id) === String(assignedId));
                      const label = matchMember ? `${(matchMember.user?.firstName || '')} ${(matchMember.user?.lastName || '')}`.trim() : '';
                      if (label) nameCandidates.push(label);
                    }
                    const assigneeName = (nameCandidates.find(n => n && n.trim().length > 0) || '').trim();
                    return (
                      <div key={id || m.title} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={m.title}
                              onChange={(e) => setMilestones(prev => prev.map(x => (x === m ? { ...x, title: e.target.value } : x)))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={m.dueDate ? String(m.dueDate).split('T')[0] : ''}
                              onChange={(e) => setMilestones(prev => prev.map(x => (x === m ? { ...x, dueDate: e.target.value } : x)))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={m.status || 'pending'}
                              onChange={(e) => setMilestones(prev => prev.map(x => (x === m ? { ...x, status: e.target.value as Milestone['status'] } : x)))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="overdue">Overdue</option>
                            </select>
                          </div>
                          <div className="text-sm text-gray-600 md:pl-2">
                            <div className="mb-1 font-medium">Assignee</div>
                            <div>{assigneeName || 'Unassigned'}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={!id || savingMilestoneId === id}
                              onClick={async () => {
                                if (!id) return;
                                setSavingMilestoneId(id);
                                try {
                                  const token = localStorage.getItem('accessToken');
                                  const payload: Partial<Milestone> = {
                                    title: m.title,
                                    description: m.description,
                                    dueDate: m.dueDate,
                                    status: m.status,
                                    completedAt: m.completedAt
                                  };
                                  const res = await fetch(`/api/projects/${params.id}/milestones/${id}`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data?.message || 'Failed to update milestone');
                                  const updated = (data?.data?.milestones) || (data?.milestones) || [];
                                  if (Array.isArray(updated)) setMilestones(updated);
                                } catch (e) {
                                  alert(e instanceof Error ? e.message : 'Failed to update milestone');
                                } finally {
                                  setSavingMilestoneId(null);
                                }
                              }}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
                            >
                              {savingMilestoneId === id ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </div>
                        {m.description !== undefined && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={m.description || ''}
                              onChange={(e) => setMilestones(prev => prev.map(x => (x === m ? { ...x, description: e.target.value } : x)))}
                              rows={2}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Optional short description"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new milestone */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Add Milestone</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Prototype v1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <select
                      value={newMilestone.assignedTo}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => {
                        const id = getUserId(u);
                        if (!id) return null;
                        return (
                          <option key={id} value={id}>
                            {formatUserLabel(u)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newMilestone.title || !newMilestone.dueDate) {
                          alert('Title and Due Date are required');
                          return;
                        }
                        setSavingMilestoneId('new');
                        try {
                          const token = localStorage.getItem('accessToken');
                          const payload = {
                            title: newMilestone.title,
                            description: newMilestone.description || undefined,
                            dueDate: newMilestone.dueDate,
                            assignedTo: newMilestone.assignedTo || undefined
                          };
                          const res = await fetch(`/api/projects/${params.id}/milestones`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data?.message || 'Failed to add milestone');
                          const updated = (data?.data?.milestones) || (data?.milestones) || [];
                          if (Array.isArray(updated)) setMilestones(updated);
                          setNewMilestone({ title: '', description: '', dueDate: '', assignedTo: '' });
                        } catch (e) {
                          alert(e instanceof Error ? e.message : 'Failed to add milestone');
                        } finally {
                          setSavingMilestoneId(null);
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      {savingMilestoneId === 'new' ? 'Adding…' : 'Add Milestone'}
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Optional short description"
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
