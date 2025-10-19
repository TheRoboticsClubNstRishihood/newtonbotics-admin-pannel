import React, { useState } from 'react';
import { 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  BellIcon, 
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { NotificationSettingsProps, NotificationSettings } from '../../types/notifications';

export function NotificationSettingsForm({ settings, onUpdate, loading, error }: NotificationSettingsProps) {
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onUpdate(formData);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = (section: keyof NotificationSettings, field: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const sectionData = { ...(newData[section] as Record<string, boolean>) };
      sectionData[field] = !sectionData[field];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newData as Record<string, unknown>)[section] = sectionData;
      return newData;
    });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Cog6ToothIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your notification preferences and delivery methods.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XMarkIcon className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Notifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <EnvelopeIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Email Notifications</label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.email.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.email.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.email.enabled && (
              <div className="ml-6 space-y-3">
                {Object.entries(formData.email)
                  .filter(([key]) => key !== 'enabled')
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggle('email', key)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          value ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Push Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Push Notifications</label>
                <p className="text-xs text-gray-500">Receive browser push notifications</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('push', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.push.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.push.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.push.enabled && (
              <div className="ml-6 space-y-3">
                {Object.entries(formData.push)
                  .filter(([key]) => key !== 'enabled')
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggle('push', key)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          value ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DevicePhoneMobileIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">SMS Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable SMS Notifications</label>
                <p className="text-xs text-gray-500">Receive notifications via SMS</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('sms', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.sms.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.sms.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.sms.enabled && (
              <div className="ml-6 space-y-3">
                {Object.entries(formData.sms)
                  .filter(([key]) => key !== 'enabled')
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggle('sms', key)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          value ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Cog6ToothIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Quiet Hours</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Quiet Hours</label>
                <p className="text-xs text-gray-500">Pause notifications during specified hours</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('quietHours', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.quietHours.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.quietHours.enabled && (
              <div className="ml-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.quietHours.startTime}
                      onChange={(e) => handleTimeChange('startTime', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.quietHours.endTime}
                      onChange={(e) => handleTimeChange('endTime', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
