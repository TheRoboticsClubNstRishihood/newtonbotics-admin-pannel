'use client';

import Link from 'next/link';
import { NotificationDropdown } from './notifications/NotificationDropdown';
import { AdminUser } from '@/types/admin';
import {
  EnvelopeIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface AdminNavbarProps {
  pageTitle: string;
  user: AdminUser;
  profileDropdownOpen: boolean;
  onToggleProfileDropdown: () => void;
  onCloseProfileDropdown: () => void;
  onLogout: () => void;
}

export function AdminNavbar({
  pageTitle,
  user,
  profileDropdownOpen,
  onToggleProfileDropdown,
  onCloseProfileDropdown,
  onLogout
}: AdminNavbarProps) {
  return (
    <div className="fixed top-0 right-0 left-64 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-600">Welcome back, {user?.firstName}</span>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationDropdown />
          <div className="relative profile-dropdown">
            <button
              onClick={onToggleProfileDropdown}
              className="flex items-center space-x-3 p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600">{user?.role}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-xs text-gray-600">{user?.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{user?.email}</span>
                    </div>
                    {user?.department && (
                      <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{user?.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={onCloseProfileDropdown}
                    >
                      <UserCircleIcon className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>

                    <button
                      onClick={() => {
                        onCloseProfileDropdown();
                        onLogout();
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




