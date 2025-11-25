'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/components/ToastContext';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'remote' | 'on_leave';

interface AttendanceRecord {
  id?: string;
  _id?: string;
  userId: string | {
    id?: string;
    _id?: string;
  };
  userSnapshot?: {
    id?: string;
  };
  date: string;
  status: AttendanceStatus;
}

interface AttendanceMemberOption {
  id: string;
  name: string;
  email: string;
  department?: string | null;
}

interface ClubMemberResponse {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  displayName?: string;
  email?: string;
  role?: string;
  department?: string;
}

const getDateKey = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month, day));
  return date.toISOString().split('T')[0];
};

const isoToDateKey = (iso?: string) => iso?.split('T')[0] ?? '';

const getRecordUserId = (record: AttendanceRecord) => {
  if (typeof record.userId === 'string') return record.userId;
  return record.userId?.id || record.userId?._id || record.userSnapshot?.id || '';
};

export default function AttendancePage() {
  const { showError, showSuccess } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [members, setMembers] = useState<AttendanceMemberOption[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCell, setPendingCell] = useState<string | null>(null);
  const [allowPastEditing, setAllowPastEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const daysInMonth = useMemo(() => {
    return new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
  }, [selectedMonth]);

  const dayNumbers = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth]
  );

  const monthRange = useMemo(() => {
    return {
      from: getDateKey(selectedMonth.year, selectedMonth.month, 1),
      to: getDateKey(selectedMonth.year, selectedMonth.month, daysInMonth)
    };
  }, [selectedMonth, daysInMonth]);

  const monthLabel = useMemo(() => {
    const date = new Date(selectedMonth.year, selectedMonth.month, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const monthInputValue = useMemo(() => {
    const month = selectedMonth.month + 1;
    return `${selectedMonth.year}-${month.toString().padStart(2, '0')}`;
  }, [selectedMonth]);

  const attendanceIndex = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((record) => {
      const userId = getRecordUserId(record);
      const dateKey = isoToDateKey(record.date);
      if (userId && dateKey) {
        map.set(`${userId}-${dateKey}`, record);
      }
    });
    return map;
  }, [records]);

  const fetchMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/users/club-members?limit=500&skip=0', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showError(data?.message || 'Failed to load team members');
        return;
      }

      const list: ClubMemberResponse[] = data?.data?.clubMembers || data?.clubMembers || [];
      const normalized: AttendanceMemberOption[] = list
        .filter((member) => member?.role === 'team_member')
        .map((member) => {
          const id = member.id || member._id;
          const name =
            member.displayName ||
            member.fullName ||
            `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
            member.email ||
            'Unnamed';
          return {
            id,
            name,
            email: member.email || 'unknown@newtonbotics.org',
            department: member.department
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((member): member is AttendanceMemberOption => Boolean(member.id));

      setMembers(normalized);
    } catch (err) {
      console.error('Failed to fetch club members', err);
      showError('Unable to load team members right now.');
    }
  }, [showError]);

  const fetchAttendance = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/';
      return;
    }

    setIsLoading(true);
    setError(null);

    const pageLimit = 100;
    const maxPages = 50; // safety net for unexpected loops
    const aggregated: AttendanceRecord[] = [];

    try {
      for (let page = 0; page < maxPages; page += 1) {
        const params = new URLSearchParams({
          from: monthRange.from,
          to: monthRange.to,
          limit: pageLimit.toString(),
          skip: (page * pageLimit).toString(),
          sort: 'asc'
        });

        const response = await fetch(`/api/attendance?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setRecords([]);
          setError(data?.message || data?.error?.message || 'Failed to load attendance records');
          return;
        }

        const list: AttendanceRecord[] =
          data?.data?.items ||
          data?.data?.attendance ||
          data?.attendance ||
          data?.items ||
          [];

        aggregated.push(...list);

        if (list.length < pageLimit) {
          break;
        }
      }

      setRecords(aggregated);
    } catch (err) {
      console.error('Failed to load attendance', err);
      setRecords([]);
      setError('Unable to load attendance right now.');
    } finally {
      setIsLoading(false);
    }
  }, [monthRange.from, monthRange.to]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleMonthShift = (delta: number) => {
    setSelectedMonth((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const handleMonthInputChange = (value: string) => {
    if (!value) return;
    const [yearStr, monthStr] = value.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    if (Number.isNaN(year) || Number.isNaN(month)) return;
    setSelectedMonth({ year, month });
  };

  const handleToggleAttendance = useCallback(async (userId: string, dateKey: string, checked: boolean, isPastDate: boolean, isFutureDate: boolean) => {
    if (isFutureDate) {
      showError('Future attendance cannot be marked yet.');
      return;
    }
    if (isPastDate && !allowPastEditing) {
      showError('Enable past-date editing to modify this record.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/';
      return;
    }

    const cellKey = `${userId}-${dateKey}`;
    setPendingCell(cellKey);

    try {
      if (checked) {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            date: dateKey,
            status: 'present'
          })
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          showError(data?.message || 'Failed to mark attendance');
          return;
        }

        showSuccess('Attendance marked');
      } else {
        const existingRecord = attendanceIndex.get(cellKey);
        if (!existingRecord) {
          setPendingCell(null);
          return;
        }

        const recordId = existingRecord.id || existingRecord._id;
        if (!recordId) {
          showError('Unable to find attendance record ID to remove');
          return;
        }

        const response = await fetch(`/api/attendance/${recordId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          showError(data?.message || 'Failed to clear attendance');
          return;
        }

        showSuccess('Attendance cleared');
      }

      await fetchAttendance();
    } catch (err) {
      console.error('Failed to toggle attendance', err);
      showError('Something went wrong while updating attendance');
    } finally {
      setPendingCell(null);
    }
  }, [allowPastEditing, attendanceIndex, fetchAttendance, showError, showSuccess]);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => {
      const name = member.name.toLowerCase();
      const email = member.email.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [members, searchQuery]);

  const getStatusSymbol = useCallback((record?: AttendanceRecord | null) => {
    if (!record) return '';
    const map: Record<AttendanceStatus, string> = {
      present: 'P',
      absent: 'A',
      late: 'L',
      excused: 'E',
      remote: 'R',
      on_leave: 'O'
    };
    return map[record.status] || 'P';
  }, []);

  const handleDownloadPdf = useCallback(() => {
    if (filteredMembers.length === 0) {
      showError('No team members to export.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    doc.setFontSize(16);
    doc.text(`Attendance – ${monthLabel}`, 40, 40);

    const head = [
      ['Team member', ...dayNumbers.map((day) => day.toString())]
    ];

    const body = filteredMembers.map((member) => {
      const row: (string | number)[] = [`${member.name}\n${member.email}`];
      dayNumbers.forEach((day) => {
        const dateKey = getDateKey(selectedMonth.year, selectedMonth.month, day);
        const recordKey = `${member.id}-${dateKey}`;
        const record = attendanceIndex.get(recordKey);
        row.push(getStatusSymbol(record));
      });
      return row;
    });

    autoTable(doc, {
      head,
      body,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 160, halign: 'left' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const value = data.cell.text?.[0];
          if (value === 'P') {
            data.cell.styles.fillColor = [198, 239, 206];
            data.cell.styles.textColor = [0, 97, 0];
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(9);
        const pageText = `Page ${doc.internal.getNumberOfPages()}`;
        doc.text(pageText, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    const fileLabel = `${selectedMonth.year}-${(selectedMonth.month + 1).toString().padStart(2, '0')}`;
    doc.save(`attendance-${fileLabel}.pdf`);
  }, [attendanceIndex, dayNumbers, filteredMembers, getStatusSymbol, monthLabel, selectedMonth.month, selectedMonth.year, showError]);

  const renderCell = (member: AttendanceMemberOption, day: number) => {
    const dateKey = getDateKey(selectedMonth.year, selectedMonth.month, day);
    const recordKey = `${member.id}-${dateKey}`;
    const isChecked = attendanceIndex.has(recordKey);
    const isPending = pendingCell === recordKey;
    const cellDate = new Date(dateKey);
    cellDate.setHours(0, 0, 0, 0);
    const isPastDate = cellDate < today;
    const isFutureDate = cellDate > today;
    const isDisabled = isPending || (isPastDate && !allowPastEditing) || isFutureDate;

    return (
      <td
        key={recordKey}
        className={`border border-gray-100 px-2 py-2 text-center text-sm ${
          isPastDate ? 'bg-gray-50' : isFutureDate ? 'bg-gray-100/60' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) =>
            handleToggleAttendance(member.id, dateKey, event.target.checked, isPastDate, isFutureDate)
          }
          disabled={isDisabled}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          aria-label={`Mark attendance for ${member.name} on ${dateKey}`}
          title={
            isFutureDate
              ? 'Future attendance cannot be marked'
              : isPastDate && !allowPastEditing
                ? 'Enable past-date editing to change this value'
                : undefined
          }
        />
      </td>
    );
  };

  return (
    <AdminLayout pageTitle="Attendance">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Attendance Tracker</h1>
            <p className="text-sm text-gray-600">
              View the current month, then mark attendance with one click per member per day.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Checkboxes toggle “present” status. Unchecking removes the record. No check-in/out details required.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-gray-200">
              <button
                type="button"
                onClick={() => handleMonthShift(-1)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label="Previous month"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="px-3 text-sm font-medium text-gray-800 whitespace-nowrap">{monthLabel}</div>
              <button
                type="button"
                onClick={() => handleMonthShift(1)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label="Next month"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            <input
              type="month"
              value={monthInputValue}
              onChange={(event) => handleMonthInputChange(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Jump to month"
            />
            <button
              type="button"
              onClick={() => fetchAttendance()}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Monthly grid</h2>
              <p className="text-sm text-gray-500">
                {filteredMembers.length} team members • {daysInMonth} days
              </p>
            </div>
            {isLoading && (
              <div className="text-sm text-gray-500">Syncing attendance…</div>
            )}
            <div className="mt-4 w-full sm:w-auto sm:mt-0">
              <label className="sr-only" htmlFor="member-search">Search team members</label>
              <input
                id="member-search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="border-b border-yellow-100 bg-yellow-50 px-6 py-4 text-sm text-yellow-800">
            <div className="font-medium">Date safeguards</div>
            <p className="mt-1 text-xs text-yellow-900">
              Future days are always read-only. To edit yesterday or earlier, enable the toggle below to confirm you understand the risk.
            </p>
            <label className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-yellow-900">
              <input
                type="checkbox"
                checked={allowPastEditing}
                onChange={(event) => setAllowPastEditing(event.target.checked)}
                className="h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
              />
              I understand the risk and want to edit past attendance
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border border-gray-100 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Team member
                  </th>
                  {dayNumbers.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-100 px-2 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={dayNumbers.length + 1} className="px-6 py-10 text-center text-sm text-gray-500">
                      Loading attendance grid…
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={dayNumbers.length + 1} className="px-6 py-10 text-center text-sm text-gray-500">
                      No team members match “{searchQuery}”.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="even:bg-gray-50/40">
                      <td className="sticky left-0 z-10 border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                        {member.department && (
                          <div className="text-xs text-gray-400">{member.department}</div>
                        )}
                      </td>
                      {dayNumbers.map((day) => renderCell(member, day))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

