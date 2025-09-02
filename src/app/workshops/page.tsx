'use client';

import AdminLayout from '../../components/AdminLayout';

export default function Workshops() {
  return (
    <AdminLayout pageTitle="Workshops">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Workshops Management</h1>
          <p className="text-gray-600 mb-4">
            Manage technical workshops and training sessions for team members.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Scheduled Workshops</h3>
              <p className="text-orange-700">8 workshops planned</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-teal-900 mb-2">Ongoing Workshops</h3>
              <p className="text-teal-700">3 workshops active</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Completed Workshops</h3>
              <p className="text-indigo-700">15 workshops finished</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
