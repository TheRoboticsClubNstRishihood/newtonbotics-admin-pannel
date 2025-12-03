'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarIcon,
  NewspaperIcon,
  UserGroupIcon,
  PhotoIcon,
  UsersIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  EnvelopeIcon,
  TagIcon,
  CubeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  HomeIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import DeveloperCredit from './DeveloperCredit';
import { isUserProjectLeader } from '@/lib/projectPermissions';
import { AdminUser } from '@/types/admin';
import { AdminNavbar } from './AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AdminLayout({ children, pageTitle = "Dashboard" }: AdminLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProjectLeader, setIsProjectLeader] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (!token || !userData) {
      window.location.href = '/';
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Allow admin or team_member (project leaders are allowed via login check)
      if (user.role !== 'admin' && user.role !== 'team_member') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      setUser(user);
      
      // Check if user is a project leader (for team_member users)
      if (user.role === 'team_member' && token) {
        const userId = user.id || user._id || '';
        if (userId) {
          isUserProjectLeader(userId, token)
            .then(setIsProjectLeader)
            .catch(() => setIsProjectLeader(false));
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // All menu items
  const allMenuItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
    { name: 'Notifications', icon: BellIcon, href: '/notifications' },
    { name: 'Events', icon: CalendarIcon, href: '/events' },
    { name: 'News', icon: NewspaperIcon, href: '/news' },
    { name: 'Newsletter', icon: EnvelopeIcon, href: '/newsletter' },
    { name: 'Projects', icon: FolderIcon, href: '/projects' },
    { name: 'Project Requests', icon: ClipboardDocumentListIcon, href: '/project-requests' },
    { name: 'Research Areas', icon: AcademicCapIcon, href: '/research-areas' },
    { name: 'Audit Trail', icon: ClockIcon, href: '/audit-trail' },
    { name: 'Team', icon: UserGroupIcon, href: '/team' },
    { name: 'Attendance', icon: CheckBadgeIcon, href: '/attendance' },
    { name: 'Reports', icon: ChartBarIcon, href: '/reports' },
    { name: 'Media', icon: PhotoIcon, href: '/media' },
    { name: 'Users', icon: UsersIcon, href: '/users' },
    { name: 'Contact', icon: EnvelopeIcon, href: '/contact' },
    { name: 'Subroles', icon: TagIcon, href: '/subroles' },
    { name: 'Role Approvals', icon: TagIcon, href: '/role-approvals' },
    { name: 'Inventory', icon: CubeIcon, href: '/inventory' },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
    { name: 'Docs', icon: DocumentTextIcon, href: '/docs' },
  ];

  // For team_member users, only Projects is enabled
  // Project leaders can also access Media
  const isAdmin = user?.role === 'admin';
  const enabledMenuItems = isAdmin 
    ? allMenuItems.map(item => item.href) 
    : isProjectLeader 
      ? ['/projects', '/media'] 
      : ['/projects'];

  // Define admin-only routes (team_member users cannot access these)
  const adminOnlyRoutes = [
    '/dashboard',
    '/notifications',
    '/events',
    '/news',
    '/newsletter',
    '/project-requests',
    '/research-areas',
    '/audit-trail',
    '/team',
    '/attendance',
    '/reports',
    '/media',
    '/users',
    '/contact',
    '/subroles',
    '/role-approvals',
    '/inventory',
    '/settings',
    '/docs'
  ];

  // Routes that team_member users CAN access (including all project-related routes)
  // Project leaders can also access Media
  const teamMemberAllowedRoutes = [
    '/projects',  // This will match /projects, /projects/create, /projects/edit/[id], /projects/[id]
    '/profile',
    ...(isProjectLeader ? ['/media'] : [])  // Project leaders can access media
  ];

  // Check if current route is admin-only and user is not admin
  // Team members can access /projects and all its sub-routes, and /profile
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isTeamMemberAllowedRoute = teamMemberAllowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isRestricted = !isAdmin && isAdminOnlyRoute && !isTeamMemberAllowedRoute;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
            Newtonbotics
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6 space-y-2">
            {allMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const isEnabled = enabledMenuItems.includes(item.href);
              
              if (isEnabled) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-indigo-100 text-indigo-900 border-r-2 border-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              } else {
                return (
                  <div
                    key={item.name}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-60"
                    title="Access restricted to admins only"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                );
              }
            })}
          </nav>
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0">
          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>

          {/* Developer Credit */}
          <DeveloperCredit />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <AdminNavbar
          pageTitle={pageTitle}
          user={user}
          profileDropdownOpen={profileDropdownOpen}
          onToggleProfileDropdown={() => setProfileDropdownOpen(!profileDropdownOpen)}
          onCloseProfileDropdown={() => setProfileDropdownOpen(false)}
          onLogout={handleLogout}
        />
        {/* Page Content */}
        <div className="pt-16 p-6">
          {isRestricted ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white shadow rounded-lg p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                  <p className="text-gray-600 mb-4">
                    This page is only accessible to administrators.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    As a team member, you have access to manage your own projects only.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => window.location.href = '/projects'}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Go to Projects
                    </button>
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
