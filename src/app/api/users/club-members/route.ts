import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Access token required',
          details: { statusCode: 401, isOperational: true, message: 'Access token required' }
        },
        timestamp: new Date().toISOString(),
        path: '/api/users/club-members',
        method: 'GET'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || undefined;
    const department = searchParams.get('department') || undefined;
    const skills = searchParams.get('skills') || undefined; // comma-separated
    const limit = searchParams.get('limit') || undefined;
    const skip = searchParams.get('skip') || undefined;

    const forwardParams = new URLSearchParams();
    if (q) forwardParams.set('q', q);
    if (department) forwardParams.set('department', department);
    if (skills) forwardParams.set('skills', skills);
    if (limit) forwardParams.set('limit', limit);
    if (skip) forwardParams.set('skip', skip);

    const url = `${backendUrl}/api/users/club-members${forwardParams.toString() ? `?${forwardParams.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    // Fallback: backend route missing -> fetch from /api/users and transform
    if (response.status === 404) {
      const usersUrlParams = new URLSearchParams();
      // Try to leverage backend-side search/filters when available
      if (q) usersUrlParams.set('q', q);
      if (department) usersUrlParams.set('department', department);
      // Fetch a reasonable page; we will paginate after filtering
      usersUrlParams.set('limit', String(Math.max(Number(limit) || 50, 50)));
      usersUrlParams.set('skip', String(Number(skip) || 0));

      const usersRes = await fetch(`${backendUrl}/api/users?${usersUrlParams.toString()}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      const usersData = await usersRes.json();

      if (!usersRes.ok) {
        return NextResponse.json({
          success: false,
          error: usersData?.error || { message: usersData?.message || 'Failed to fetch users for fallback' },
          timestamp: new Date().toISOString(),
          path: '/api/users/club-members',
          method: 'GET'
        }, { status: usersRes.status });
      }

      const rawUsers: any[] = usersData?.data?.users || usersData?.users || [];

      const requiredSkills = (skills || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.toLowerCase());

      const allowedRoles = new Set(['team_member', 'mentor', 'researcher', 'admin', 'community']);

      // Filter and map to club members
      const filtered = rawUsers
        .filter((u) => {
          if (!u) return false;
          const role = (u.role || '').toString().toLowerCase();
          if (role === 'student') return false;
          if (u.isActive === false) return false;
          if (department && u.department !== department) return false;
          // If backend returned roles beyond allowed set, keep them but prefer allowed; we only exclude students explicitly
          // Skills filter (AND semantics)
          if (requiredSkills.length > 0) {
            const userSkills: string[] = Array.isArray(u.skills)
              ? u.skills.map((s: any) => (s ?? '').toString().toLowerCase())
              : typeof u.skills === 'string' && u.skills
                ? u.skills.split(',').map((s: string) => s.trim().toLowerCase())
                : [];
            const hasAll = requiredSkills.every(rs => userSkills.includes(rs));
            if (!hasAll) return false;
          }
          // Text search fallback if backend didn't filter
          if (q) {
            const ql = q.toLowerCase();
            const hay = [
              u.firstName,
              u.lastName,
              u.email,
              u.bio,
              ...(Array.isArray(u.skills) ? u.skills : (typeof u.skills === 'string' ? u.skills.split(',') : []))
            ].filter(Boolean).map((x: any) => x.toString().toLowerCase());
            if (!hay.some((h: string) => h.includes(ql))) return false;
          }
          return true;
        })
        .map((u) => {
          const firstName = u.firstName || '';
          const lastName = u.lastName || '';
          const fullName = (u.fullName as string) || `${firstName} ${lastName}`.trim();
          const role = (u.role || '').toString();
          const displayName = `${fullName || u.email}${role ? ` (${role.charAt(0).toUpperCase()}${role.slice(1)})` : ''}`;
          return {
            id: u.id || u._id || u.userId || String(u.email || fullName || Math.random()),
            email: u.email,
            firstName,
            lastName,
            fullName,
            displayName,
            role,
            subroles: Array.isArray(u.subroles) ? u.subroles : [],
            specialization: u.specialization || undefined,
            experienceYears: typeof u.experienceYears === 'number' ? u.experienceYears : undefined,
            department: u.department || undefined,
            yearOfStudy: typeof u.yearOfStudy === 'number' ? u.yearOfStudy : null,
            phone: u.phone || undefined,
            profileImageUrl: u.profileImageUrl || u.avatarUrl || undefined,
            bio: u.bio || u.about || undefined,
            skills: Array.isArray(u.skills) ? u.skills : (typeof u.skills === 'string' ? u.skills.split(',').map((s: string) => s.trim()) : []),
            achievements: Array.isArray(u.achievements) ? u.achievements : [],
            socialLinks: typeof u.socialLinks === 'object' ? u.socialLinks : undefined,
            currentProjects: Array.isArray(u.currentProjects) ? u.currentProjects : [],
            emailVerified: Boolean(u.emailVerified),
            lastLogin: u.lastLogin || undefined,
            createdAt: u.createdAt || undefined,
            updatedAt: u.updatedAt || undefined
          };
        });

      const total = filtered.length;
      const lim = Math.min(Number(limit) || 50, 100);
      const sk = Math.max(Number(skip) || 0, 0);
      const clubMembers = filtered.slice(sk, sk + lim);

      return NextResponse.json({
        success: true,
        data: {
          clubMembers,
          pagination: {
            total,
            limit: lim,
            skip: sk,
            hasMore: sk + lim < total
          }
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: data?.error || { message: data?.message || 'Failed to fetch club members' },
      timestamp: new Date().toISOString(),
      path: '/api/users/club-members',
      method: 'GET'
    }, { status: response.status });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Internal server error'
      },
      timestamp: new Date().toISOString(),
      path: '/api/users/club-members',
      method: 'GET'
    }, { status: 500 });
  }
}


