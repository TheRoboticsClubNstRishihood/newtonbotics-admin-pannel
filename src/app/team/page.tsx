'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface ClubMemberAchievement {
  title: string;
  description?: string;
  date?: string;
  type?: string;
}

interface ClubMemberProject {
  projectId: string;
  role?: string;
  involvement?: string;
}

interface ClubMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  displayName?: string;
  role: string;
  subroles?: string[];
  specialization?: string;
  experienceYears?: number;
  department?: string;
  yearOfStudy?: number | null;
  phone?: string;
  profileImageUrl?: string;
  bio?: string;
  skills?: string[];
  achievements?: ClubMemberAchievement[];
  socialLinks?: Record<string, string>;
  currentProjects?: ClubMemberProject[];
  emailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export default function TeamPage() {
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({ total: 0, limit: 20, skip: 0, hasMore: false });
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters = useMemo(() => Boolean(searchQuery || selectedDepartment || selectedSkills.length), [searchQuery, selectedDepartment, selectedSkills]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedSkills([]);
    setCurrentPage(1);
  };

  const computedSkills = useMemo(() => {
    const s = new Set<string>();
    members.forEach(m => (m.skills || []).forEach(x => x && s.add(x)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [members]);

  useEffect(() => {
    // Derive departments from members once they load as fallback for missing backend endpoint
    const unique = new Set<string>();
    members.forEach(m => { if (m.department) unique.add(m.department); });
    setDepartments(Array.from(unique).sort((a, b) => a.localeCompare(b)));
  }, [members]);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const params = new URLSearchParams({
        limit: '20',
        skip: String((currentPage - 1) * 20)
      });
      if (searchQuery) params.set('q', searchQuery);
      if (selectedDepartment) params.set('department', selectedDepartment);
      if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));

      const res = await fetch(`/api/users/club-members?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        const list: ClubMember[] = data?.data?.clubMembers || data?.clubMembers || [];
        const pg: Pagination = data?.data?.pagination || data?.pagination || {
          total: list.length,
          limit: 20,
          skip: (currentPage - 1) * 20,
          hasMore: false
        };
        setMembers(list);
        setPagination(pg);
      } else {
        setError(data?.error?.message || data?.message || 'Failed to fetch club members');
      }
    } catch {
      setError('Failed to fetch club members');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedDepartment, selectedSkills]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Removed direct call to /api/users/departments since backend 404s. We derive from loaded members.

  // fetchMembers defined above via useCallback

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 20)));

  const toggleSkill = (skill: string) => {
    setCurrentPage(1);
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  return (
    <AdminLayout pageTitle="Team">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800"
                aria-label="Clear filters"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value); }}
                placeholder="Search by name, skills, bio"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => { setCurrentPage(1); setSelectedDepartment(e.target.value); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex flex-wrap gap-2">
                {computedSkills.slice(0, 20).map(skill => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 text-sm rounded-full border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Club Members</h3>
            <div className="text-sm text-gray-500">{pagination.total} total</div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : members.length === 0 ? (
              <div className="text-center text-gray-500">No members found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                  const initials = (m.firstName?.[0] || m.fullName?.[0] || m.displayName?.[0] || 'U').toUpperCase() + (m.lastName?.[0] || '');
                  const name = m.displayName || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
                  return (
                    <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        {m.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.profileImageUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{name}</div>
                          <div className="text-xs text-gray-600">{m.role}{m.department ? ` • ${m.department}` : ''}</div>
                        </div>
                      </div>
                      {m.bio && (
                        <p className="mt-3 text-sm text-gray-700 line-clamp-3">{m.bio}</p>
                      )}
                      {(m.skills && m.skills.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.skills.slice(0, 6).map(s => (
                            <span key={s} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div>
                          <div className="text-gray-500">Experience</div>
                          <div className="font-medium">{m.experienceYears ?? '-'} yrs</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Verified</div>
                          <div className="font-medium">{m.emailVerified ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Projects</div>
                          <div className="font-medium">{m.currentProjects?.length ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


