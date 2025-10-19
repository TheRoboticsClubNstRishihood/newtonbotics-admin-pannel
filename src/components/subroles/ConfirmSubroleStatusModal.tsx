'use client';

import type { Subrole } from '@/types/subroles';

interface ConfirmSubroleStatusModalProps {
  subrole: Subrole;
  action: 'deactivate' | 'reactivate';
  onClose: () => void;
  onDone?: () => void;
}

export default function ConfirmSubroleStatusModal({ subrole, action, onClose, onDone }: ConfirmSubroleStatusModalProps) {
  const run = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const endpoint = action === 'deactivate' ? `/api/subroles/${subrole._id}` : `/api/subroles/${subrole._id}/reactivate`;
    const method = action === 'deactivate' ? 'DELETE' : 'POST';
    const res = await fetch(endpoint, { method, headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) {
      try {
        const data = await res.json();
        alert(data?.message || data?.error?.message || 'Operation failed');
      } catch {
        alert('Operation failed');
      }
      return;
    }
    onDone?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm</h3>
        <p className="text-gray-700 mb-4">Are you sure you want to {action} “{subrole.displayName}”?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
          <button onClick={run} className={`px-4 py-2 rounded-md text-white ${action === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}


