'use client';

import { useEffect, useMemo, useState } from 'react';
import CreateSubroleModal from '@/components/subroles/CreateSubroleModal';
import EditSubroleModal from '@/components/subroles/EditSubroleModal';
import ConfirmSubroleStatusModal from '@/components/subroles/ConfirmSubroleStatusModal';
import ConfirmSubroleDeleteModal from '@/components/subroles/ConfirmSubroleDeleteModal';
import AdminLayout from '@/components/AdminLayout';

interface Subrole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  permissions: string[];
  priority: number;
  isActive: boolean;
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function SubrolesPage() {
  const [subroles, setSubroles] = useState<Subrole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Subrole | null>(null);
  const [confirming, setConfirming] = useState<{ subrole: Subrole; action: 'deactivate' | 'reactivate' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Subrole | null>(null);

  const filtered = useMemo(() => {
    return subroles.filter(sr => {
      const q = search.trim().toLowerCase();
      const matchesQ = q
        ? (sr.displayName?.toLowerCase().includes(q) || sr.name.toLowerCase().includes(q) || sr.description?.toLowerCase().includes(q))
        : true;
      const matchesActive = showInactive ? true : sr.isActive;
      return matchesQ && matchesActive;
    });
  }, [subroles, search, showInactive]);

  const fetchSubroles = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required');
        return;
      }
      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('skip', '0');
      const res = await fetch(`/api/subroles?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        const list = data?.data?.subroles || data?.subroles || data?.data || [];
        setSubroles(Array.isArray(list) ? list : []);
      } else {
        setError(data?.message || data?.error?.message || 'Failed to fetch subroles');
      }
    } catch (e) {
      setError('Failed to fetch subroles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubroles();
  }, []);

  const onCreated = (sr: Subrole) => {
    setSubroles(prev => [sr, ...prev]);
    setIsCreateOpen(false);
  };

  const onSaved = (sr: Subrole) => {
    setSubroles(prev => prev.map(x => (x._id === sr._id ? sr : x)));
    setEditing(null);
  };

  const onConfirmDone = () => {
    setConfirming(null);
    fetchSubroles();
  };

  return (
    <AdminLayout pageTitle="Subroles">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Subroles</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="showInactive" className="text-sm text-gray-700">Show inactive</label>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              New Subrole
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            placeholder="Search subroles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <div className="bg-white rounded-md shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(sr => (
                  <tr key={sr._id}>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{sr.displayName}</div>
                      {sr.description && (
                        <div className="text-xs text-gray-500">{sr.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{sr.name}</td>
                    <td className="px-4 py-3 text-gray-700">{sr.category}</td>
                    <td className="px-4 py-3 text-gray-700">{sr.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sr.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {sr.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(sr)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        {sr.isActive ? (
                          <button
                            onClick={() => setConfirming({ subrole: sr, action: 'deactivate' })}
                            className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirming({ subrole: sr, action: 'reactivate' })}
                            className="px-3 py-1.5 text-sm border border-green-300 text-green-700 rounded hover:bg-green-50"
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(sr)}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>No subroles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateSubroleModal onClose={() => setIsCreateOpen(false)} onCreated={onCreated} />
      )}

      {editing && (
        <EditSubroleModal subrole={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      )}

      {confirming && (
        <ConfirmSubroleStatusModal
          subrole={confirming.subrole}
          action={confirming.action}
          onClose={() => setConfirming(null)}
          onDone={onConfirmDone}
        />
      )}

      {confirmDelete && (
        <ConfirmSubroleDeleteModal
          subrole={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onDone={() => { setConfirmDelete(null); fetchSubroles(); }}
        />
      )}
    </AdminLayout>
  );
}


