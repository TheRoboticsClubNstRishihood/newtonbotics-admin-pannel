'use client';

import { useState } from 'react';
import type { Subrole } from '@/types/subroles';

interface CreateSubroleModalProps {
  onClose: () => void;
  onCreated?: (subrole: Subrole) => void;
}

const categories = [
  'management_leadership',
  'financial_administrative',
  'technical_specializations',
  'lab_operations',
  'communication_outreach',
  'event_workshop_management',
  'research_publication',
  'industry_partnerships',
  'student_support',
  'special_designations'
];

export default function CreateSubroleModal({ onClose, onCreated }: CreateSubroleModalProps) {
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    description: '',
    category: categories[0],
    permissions: [] as string[],
    priority: 0
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Authentication required');
      const res = await fetch('/api/subroles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error?.message || 'Create failed');
      onCreated?.(data?.data?.subrole || data?.subrole || data?.data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Create failed';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create Subrole</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., lab_manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm(p => ({ ...p, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Lab Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Short description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm(p => ({ ...p, priority: parseInt(e.target.value || '0', 10) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                min={0}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permissions (comma-separated)</label>
            <input
              value={form.permissions.join(', ')}
              onChange={(e) => setForm(p => ({ ...p, permissions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., users.read, events.manage"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Subrole'}
          </button>
        </div>
      </div>
    </div>
  );
}


