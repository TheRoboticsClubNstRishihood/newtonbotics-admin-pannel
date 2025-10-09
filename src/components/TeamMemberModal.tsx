'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface TeamMember {
  userId: string;
  role: string;
  skills?: string[];
  responsibilities?: string[];
  timeCommitment?: {
    hoursPerWeek: number;
  };
}

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMembers: TeamMember[];
  onMemberAdded: (member: TeamMember) => void;
  onMemberRemoved: (userId: string) => void;
}

export default function TeamMemberModal({
  isOpen,
  onClose,
  projectId,
  existingMembers,
  onMemberAdded,
  onMemberRemoved
}: TeamMemberModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    role: '',
    skills: '',
    responsibilities: '',
    hoursPerWeek: '',
    contribution: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      const memberData = {
        userId: formData.userId,
        role: formData.role,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : undefined,
        responsibilities: formData.responsibilities ? formData.responsibilities.split(',').map(r => r.trim()) : undefined,
        timeCommitment: formData.hoursPerWeek ? {
          hoursPerWeek: parseInt(formData.hoursPerWeek)
        } : undefined,
        contribution: formData.contribution || undefined
      };

      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });

      const data = await response.json();

      if (data.success) {
        onMemberAdded(data.data);
        setFormData({
          userId: '',
          role: '',
          skills: '',
          responsibilities: '',
          hoursPerWeek: '',
          contribution: ''
        });
        setShowAddForm(false);
      } else {
        alert(data.message || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        onMemberRemoved(userId);
      } else {
        alert(data.message || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member');
    }
  };

  const availableUsers = users.filter(user => 
    !existingMembers.some(member => member.userId === user.id)
  );

  const getMemberUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Add Member Button */}
            <div className="mb-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Team Member</span>
              </button>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User *
                      </label>
                      <select
                        value={formData.userId}
                        onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select User</option>
                        {availableUsers.map(user => (
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
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Developer, Designer, Researcher"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills
                      </label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={formData.hoursPerWeek}
                        onChange={(e) => setFormData(prev => ({ ...prev, hoursPerWeek: e.target.value }))}
                        min="1"
                        max="40"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., 20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibilities
                    </label>
                    <textarea
                      value={formData.responsibilities}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Frontend development, UI/UX design, Testing"
                    />
                    <p className="text-sm text-gray-500 mt-1">Separate responsibilities with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contribution Description
                    </label>
                    <textarea
                      value={formData.contribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, contribution: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe their key contributions to the project"
                    />
                    <p className="text-sm text-gray-500 mt-1">This will be recorded in the project history</p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Team Members List */}
            <div className="space-y-4">
              {existingMembers.length > 0 ? (
                existingMembers.map((member) => {
                  const user = getMemberUser(member.userId);
                  return (
                    <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                          {user?.email && (
                            <p className="text-xs text-gray-400">{user.email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {member.skills && member.skills.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Skills:</span> {member.skills.join(', ')}
                          </div>
                        )}
                        
                        {member.timeCommitment?.hoursPerWeek && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{member.timeCommitment.hoursPerWeek}h/week</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No team members assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
