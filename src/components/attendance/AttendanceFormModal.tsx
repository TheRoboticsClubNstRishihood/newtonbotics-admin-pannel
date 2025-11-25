'use client';

import { useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'remote'
  | 'on_leave';

export interface AttendanceFormValues {
  userId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  location?: string;
}

export interface AttendanceMemberOption {
  id: string;
  name: string;
  email: string;
  department?: string | null;
}

interface AttendanceFormModalProps {
  open: boolean;
  title?: string;
  initialValues?: AttendanceFormValues;
  members: AttendanceMemberOption[];
  onClose: () => void;
  onSubmit: (values: AttendanceFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: AttendanceFormValues = {
  userId: '',
  date: '',
  status: 'present',
  notes: '',
  checkInTime: '',
  checkOutTime: '',
  location: ''
};

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
  { value: 'remote', label: 'Remote' },
  { value: 'on_leave', label: 'On Leave' }
];

export default function AttendanceFormModal({
  open,
  title = 'Record Attendance',
  initialValues,
  members,
  onClose,
  onSubmit,
  isSubmitting
}: AttendanceFormModalProps) {
  const [values, setValues] = useState<AttendanceFormValues>(defaultValues);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues({
        ...defaultValues,
        ...initialValues
      });
      setFormError(null);
    }
  }, [open, initialValues]);

  const memberOptions = useMemo(() => {
    return [...members].sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const handleChange = (field: keyof AttendanceFormValues, value: string) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.userId) {
      setFormError('Please select a team member.');
      return;
    }

    if (!values.date) {
      setFormError('Attendance date is required.');
      return;
    }

    if (values.checkInTime && values.checkOutTime) {
      const checkIn = new Date(values.checkInTime);
      const checkOut = new Date(values.checkOutTime);
      if (checkOut <= checkIn) {
        setFormError('Check-out time must be after check-in time.');
        return;
      }
    }

    setFormError(null);
    await onSubmit(values);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">All changes are tracked with admin snapshot history.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close attendance form"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team member</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={values.userId}
                onChange={(event) => handleChange('userId', event.target.value)}
              >
                <option value="">Select a member</option>
                {memberOptions.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={values.date}
                onChange={(event) => handleChange('date', event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={values.status}
                onChange={(event) => handleChange('status', event.target.value as AttendanceStatus)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location (optional)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={values.location ?? ''}
                onChange={(event) => handleChange('location', event.target.value)}
                maxLength={255}
                placeholder="NewtonBotics HQ, Remote, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-in time</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={values.checkInTime ?? ''}
                onChange={(event) => handleChange('checkInTime', event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Check-out time</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={values.checkOutTime ?? ''}
                onChange={(event) => handleChange('checkOutTime', event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="mt-1 h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={values.notes ?? ''}
              onChange={(event) => handleChange('notes', event.target.value)}
              maxLength={1000}
              placeholder="Context about the attendance update (optional)"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {(values.notes?.length ?? 0)} / 1000
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

