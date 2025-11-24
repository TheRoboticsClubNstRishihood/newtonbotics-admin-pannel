/**
 * Utility functions for checking project permissions
 */

interface User {
  id?: string;
  _id?: string;
  role?: string;
  email?: string;
}

interface Project {
  teamLeaderId?: string | { _id?: string; id?: string };
  mentorId?: string | { _id?: string; id?: string };
  [key: string]: unknown;
}

/**
 * Get user ID from user object (handles both id and _id)
 */
export function getUserId(user: User | null | undefined): string {
  if (!user) return '';
  return (typeof user.id === 'string' && user.id) || 
         (typeof user._id === 'string' && user._id) || 
         '';
}

/**
 * Get project leader ID from project (handles both string and object formats)
 */
export function getProjectLeaderId(project: Project | null | undefined): string {
  if (!project || !project.teamLeaderId) return '';
  
  if (typeof project.teamLeaderId === 'string') {
    return project.teamLeaderId;
  }
  
  const leaderObj = project.teamLeaderId as { _id?: string; id?: string };
  return leaderObj._id || leaderObj.id || '';
}

/**
 * Get mentor ID from project (handles both string and object formats)
 */
export function getMentorId(project: Project | null | undefined): string {
  if (!project || !project.mentorId) return '';
  
  if (typeof project.mentorId === 'string') {
    return project.mentorId;
  }
  
  const mentorObj = project.mentorId as { _id?: string; id?: string };
  return mentorObj._id || mentorObj.id || '';
}

/**
 * Check if user is a project leader
 * A user is a project leader if:
 * - They are a team_member AND their ID matches the project's teamLeaderId
 * - They are a mentor/researcher AND their ID matches the project's teamLeaderId
 * - They are an admin (always have access)
 */
export function isProjectLeader(project: Project | null | undefined, currentUser: User | null | undefined): boolean {
  if (!project || !currentUser) return false;
  
  const userId = getUserId(currentUser);
  const leaderId = getProjectLeaderId(project);
  const userRole = currentUser.role || '';
  
  // Admins always have access
  if (userRole === 'admin') return true;
  
  // Check if user is team_member and project leader
  if (userRole === 'team_member' && userId && leaderId && userId === leaderId) {
    return true;
  }
  
  // Check if user is mentor/researcher and project leader
  if ((userRole === 'mentor' || userRole === 'researcher') && userId && leaderId && userId === leaderId) {
    return true;
  }
  
  return false;
}

/**
 * Check if user can manage a project
 * User can manage if:
 * - They are a project leader (team_member who is leader)
 * - They are an admin
 * - They are a mentor of the project (limited access)
 */
export function canManageProject(project: Project | null | undefined, currentUser: User | null | undefined): boolean {
  if (!project || !currentUser) return false;
  
  const userId = getUserId(currentUser);
  const userRole = currentUser.role || '';
  
  // Admins always have access
  if (userRole === 'admin') return true;
  
  // Project leaders have full access
  if (isProjectLeader(project, currentUser)) return true;
  
  // Mentors have limited access if they are the mentor
  if (userRole === 'mentor' || userRole === 'researcher') {
    const mentorId = getMentorId(project);
    if (userId && mentorId && userId === mentorId) {
      return true; // Limited access for mentors
    }
  }
  
  return false;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if user is a project leader by fetching their projects
 * This is an async function that needs to be called with a token
 */
export async function isUserProjectLeader(userId: string, token: string, backendUrl?: string): Promise<boolean> {
  try {
    const baseUrl = backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    const response = await fetch(`${baseUrl}/api/projects?teamLeaderId=${userId}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const projects = data?.data?.projects || data?.data?.items || data?.projects || [];
    
    // Check if user is the team leader of any project
    return projects.some((project: Project) => {
      const leaderId = getProjectLeaderId(project);
      return leaderId === userId;
    });
  } catch (error) {
    console.error('Error checking if user is project leader:', error);
    return false;
  }
}

