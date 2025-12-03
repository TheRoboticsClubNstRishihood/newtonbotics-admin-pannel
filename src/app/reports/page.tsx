'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/components/ToastContext';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface BackendUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  department?: string;
  studentId?: string;
  phone?: string;
  yearOfStudy?: number;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  created_at?: string;
  lastLogin?: string;
  last_login?: string;
}

interface BackendProjectMember {
  userId?: string | { _id?: string; id?: string };
  id?: string;
  role?: string;
}

interface BackendProject {
  id?: string;
  _id?: string;
  title?: string;
  status?: string;
  teamLeaderId?: string | { _id?: string; id?: string };
  allTeamMembers?: BackendProjectMember[];
  teamMembers?: BackendProjectMember[];
}

interface StudentReport {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  studentId?: string;
  phone?: string;
  yearOfStudy?: number;
  isActive: boolean;
  emailVerified: boolean;
  projects: Array<{
    id: string;
    title: string;
    role: string;
    status: string;
  }>;
  createdAt: string;
  lastLogin?: string;
}

export default function ReportsPage() {
  const { showError, showSuccess } = useToast();
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showError('Authentication required');
        return;
      }

      // Fetch all users (students/team members)
      // Since the API might not support multiple roles, fetch all and filter client-side
      let allUsers: BackendUser[] = [];
      const limit = 100;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`/api/users?limit=${limit}&skip=${skip}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Failed to fetch users:', errorData);
          throw new Error(errorData?.message || 'Failed to fetch users');
        }

        const data = await response.json();
        const users: BackendUser[] = data?.data?.users || data?.data?.items || data?.users || [];
        
        if (users.length === 0) {
          hasMore = false;
        } else {
          // Filter for students and team_members only
          const filteredUsers = users.filter((user: BackendUser) => {
            const role = user.role || '';
            return role === 'student' || role === 'team_member';
          });
          allUsers = [...allUsers, ...filteredUsers];
          
          const pagination = data?.data?.pagination;
          hasMore = pagination?.hasMore || users.length === limit;
          skip += limit;
        }
      }

      // Fetch all projects to map user involvement
      let allProjects: BackendProject[] = [];
      try {
        const projectsResponse = await fetch('/api/projects?limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          allProjects = projectsData?.data?.projects || projectsData?.data?.items || projectsData?.projects || [];
        } else {
          console.warn('Failed to fetch projects, continuing without project data');
        }
      } catch (projectError) {
        console.warn('Error fetching projects:', projectError);
        // Continue without project data - reports will still work
      }

      // Map users with their projects
      const studentsWithProjects = allUsers
        .map((user) => {
          const userId = user.id || user._id;
          if (!userId) {
            // Skip users without a stable identifier
            return null;
          }

          const userProjects: Array<{ id: string; title: string; role: string; status: string }> = [];

          // Find projects where user is team leader or team member
          allProjects.forEach((project: BackendProject) => {
            const projectId = project.id || project._id;
            if (!projectId) {
              // Skip projects without a stable identifier
              return;
            }
            
            // Check if user is team leader
            const leaderId = typeof project.teamLeaderId === 'string' 
              ? project.teamLeaderId 
              : (project.teamLeaderId?._id || project.teamLeaderId?.id || '');
            
            if (leaderId === userId) {
              userProjects.push({
                id: projectId,
                title: project.title || 'Untitled',
                role: 'Team Leader',
                status: project.status || 'unknown'
              });
              return; // Skip team member check if already added as leader
            }

            // Check if user is a team member
            const teamMembers = project.allTeamMembers || project.teamMembers || [];
            teamMembers.forEach((member: BackendProjectMember) => {
              const memberId = typeof member.userId === 'string' 
                ? member.userId 
                : (member.userId?._id || member.userId?.id || member.id || '');
              
              if (memberId === userId && !userProjects.some(p => p.id === projectId)) {
                userProjects.push({
                  id: projectId,
                  title: project.title || 'Untitled',
                  role: member.role || 'Team Member',
                  status: project.status || 'unknown'
                });
              }
            });
          });

          return {
            id: userId,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role || 'student',
            department: user.department || '',
            studentId: user.studentId || '',
            phone: user.phone || '',
            yearOfStudy: user.yearOfStudy,
            isActive: user.isActive !== false,
            emailVerified: user.emailVerified !== false,
            projects: userProjects,
            createdAt: user.createdAt || user.created_at || '',
            lastLogin: user.lastLogin || user.last_login || ''
          };
        })
        .filter((student) => student !== null) as StudentReport[];

      setStudents(studentsWithProjects);

      // Extract unique departments and roles
      const uniqueDepartments = [
        ...new Set(
          studentsWithProjects
            .map((s) => s.department)
            .filter((dept): dept is string => Boolean(dept))
        ),
      ].sort();
      const uniqueRoles = [...new Set(studentsWithProjects.map(s => s.role).filter(Boolean))].sort();
      setDepartments(uniqueDepartments);
      setRoles(uniqueRoles);
    } catch (error: unknown) {
      console.error('Error fetching students:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load student reports';
      showError(errorMessage);
      setStudents([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = !searchQuery || 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = !selectedRole || student.role === selectedRole;
      const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [students, searchQuery, selectedRole, selectedDepartment]);

  const handleDownloadCSV = () => {
    if (filteredStudents.length === 0) {
      showError('No data to export');
      return;
    }

    // Prepare CSV headers
    const headers = [
      'Name',
      'Email',
      'Student ID',
      'Role',
      'Department',
      'Year of Study',
      'Phone',
      'Projects',
      'Project Roles',
      'Active Status',
      'Email Verified',
      'Created At',
      'Last Login'
    ];

    // Prepare CSV rows
    const rows = filteredStudents.map((student) => {
      const projectTitles = student.projects.map(p => p.title).join('; ');
      const projectRoles = student.projects.map(p => `${p.title} (${p.role})`).join('; ');
      
      return [
        `"${student.firstName} ${student.lastName}"`,
        `"${student.email}"`,
        `"${student.studentId || ''}"`,
        `"${student.role}"`,
        `"${student.department || ''}"`,
        `"${student.yearOfStudy || ''}"`,
        `"${student.phone || ''}"`,
        `"${projectTitles}"`,
        `"${projectRoles}"`,
        `"${student.isActive ? 'Yes' : 'No'}"`,
        `"${student.emailVerified ? 'Yes' : 'No'}"`,
        `"${student.createdAt || ''}"`,
        `"${student.lastLogin || ''}"`
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('CSV file downloaded successfully');
  };

  const handleDownloadSimpleCSV = () => {
    if (filteredStudents.length === 0) {
      showError('No data to export');
      return;
    }

    // Simple CSV with just Name and Email
    const headers = ['Name', 'Email'];
    const rows = filteredStudents.map((student) => [
      `"${student.firstName} ${student.lastName}"`,
      `"${student.email}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students-name-email-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Name and Email CSV downloaded successfully');
  };

  const handleDownloadSimplePDF = async () => {
    if (filteredStudents.length === 0) {
      showError('No data to export');
      return;
    }

    try {
      const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new JsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      doc.setFontSize(16);
      doc.text('Student List - Name & Email', 40, 40);

      const head = [['Name', 'Email']];

      const body = filteredStudents.map((student) => [
        `${student.firstName} ${student.lastName}`,
        student.email
      ]);

      autoTable(doc, {
        head,
        body,
        startY: 60,
        styles: {
          fontSize: 10,
          cellPadding: 5,
          halign: 'left',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 200 },
          1: { cellWidth: 300 }
        },
        didDrawPage: (data) => {
          doc.setFontSize(9);
          const pageText = `Page ${doc.getNumberOfPages()}`;
          doc.text(pageText, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      const fileName = `students-name-email-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Name & Email PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to generate PDF');
    }
  };

  const handleDownloadPDF = async () => {
    if (filteredStudents.length === 0) {
      showError('No data to export');
      return;
    }

    try {
      const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new JsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      doc.setFontSize(16);
      doc.text('Student Reports', 40, 40);

      const head = [['Name', 'Email', 'Student ID', 'Role', 'Department', 'Projects', 'Status']];

      const body = filteredStudents.map((student) => {
        const projectTitles = student.projects.length > 0
          ? student.projects.map(p => p.title).join(', ')
          : 'No projects';
        const status = student.isActive ? 'Active' : 'Inactive';

        return [
          `${student.firstName} ${student.lastName}`,
          student.email,
          student.studentId || '-',
          student.role,
          student.department || '-',
          projectTitles.substring(0, 50) + (projectTitles.length > 50 ? '...' : ''),
          status
        ];
      });

      autoTable(doc, {
        head,
        body,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'left',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 150 },
          2: { cellWidth: 80 },
          3: { cellWidth: 80 },
          4: { cellWidth: 100 },
          5: { cellWidth: 200 },
          6: { cellWidth: 60 }
        },
        didDrawPage: (data) => {
          doc.setFontSize(9);
          const pageText = `Page ${doc.getNumberOfPages()}`;
          doc.text(pageText, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      const fileName = `student-reports-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('PDF file downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to generate PDF');
    }
  };

  return (
    <AdminLayout pageTitle="Student Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Student Reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and download comprehensive student information including projects, contact details, and more.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => fetchStudents()}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleDownloadSimplePDF}
              disabled={filteredStudents.length === 0}
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Download Name & Email (PDF)
            </button>
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={filteredStudents.length === 0}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Download Full CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={filteredStudents.length === 0}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Download Full PDF
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="mr-2 h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredStudents.length}</span> of{' '}
          <span className="font-medium">{students.length}</span> students
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              Loading student reports...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              No students found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.studentId || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {student.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.projects.length > 0 ? (
                            <div className="space-y-1">
                              {student.projects.map((project, idx) => (
                                <div key={project.id} className="flex items-center gap-2">
                                  <span className="font-medium">{project.title}</span>
                                  <span className="text-xs text-gray-500">({project.role})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No projects</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

