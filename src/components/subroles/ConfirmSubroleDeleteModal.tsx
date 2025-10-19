'use client';

interface ConfirmSubroleDeleteModalProps {
  subrole: any;
  onClose: () => void;
  onDone?: () => void;
}

export default function ConfirmSubroleDeleteModal({ subrole, onClose, onDone }: ConfirmSubroleDeleteModalProps) {
  const run = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const res = await fetch(`/api/subroles/${subrole._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      try {
        const data = await res.json();
        alert(data?.message || data?.error?.message || 'Delete failed');
      } catch {
        alert('Delete failed');
      }
      return;
    }
    onDone?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Subrole</h3>
        <p className="text-gray-700 mb-3">Are you sure you want to delete “{subrole.displayName}”?</p>
        <p className="text-sm text-gray-500 mb-4">This action is reversible by reactivating later if your backend performs a soft delete.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
          <button onClick={run} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}


