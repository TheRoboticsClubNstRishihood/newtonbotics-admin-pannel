'use client';

import { useCallback, useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/ToastContext';
import { 
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CloudIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Manage your personal information and preferences',
    icon: UserIcon
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure email and system notifications',
    icon: BellIcon
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Password, two-factor authentication, and security settings',
    icon: ShieldCheckIcon
  },
  {
    id: 'general',
    title: 'General',
    description: 'System preferences and display settings',
    icon: Cog6ToothIcon
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'External services and API configurations',
    icon: CloudIcon
  },
  {
    id: 'system',
    title: 'System',
    description: 'Advanced system settings and maintenance',
    icon: GlobeAltIcon
  }
];

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  role: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  systemNotifications: boolean;
  newsUpdates: boolean;
  eventReminders: boolean;
  userActivity: boolean;
  securityAlerts: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  apiKeyManagement: boolean;
}

interface GeneralSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  autoSave: boolean;
}

interface IntegrationSettings {
  cloudinaryEnabled: boolean;
  cloudinaryCloudName: string;
  emailService: string;
  analyticsEnabled: boolean;
  backupEnabled: boolean;
}

interface SystemSettings {
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: string;
  cacheEnabled: boolean;
  apiRateLimit: number;
}

export default function SettingsPage() {
  const { showSuccess, showError } = useToast();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  // Removed unused showPassword state
  const [hasChanges, setHasChanges] = useState(false);

  // State for different settings sections
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    avatar: ''
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    systemNotifications: true,
    newsUpdates: true,
    eventReminders: true,
    userActivity: false,
    securityAlerts: true
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    apiKeyManagement: false
  });

  const [general, setGeneral] = useState<GeneralSettings>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    itemsPerPage: 25,
    autoSave: true
  });

  const [integrations, setIntegrations] = useState<IntegrationSettings>({
    cloudinaryEnabled: true,
    cloudinaryCloudName: '',
    emailService: 'smtp',
    analyticsEnabled: false,
    backupEnabled: true
  });

  const [system, setSystem] = useState<SystemSettings>({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    cacheEnabled: true,
    apiRateLimit: 1000
  });

  const loadServerSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Load system settings from API
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update server-side settings
        if (data.data) {
          setSecurity(data.data.security || security);
          setIntegrations(data.data.integrations || integrations);
          setSystem(data.data.system || system);
        }
      }
    } catch (error) {
      console.error('Error loading server settings:', error);
    }
  }, [security, integrations, system]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load user profile from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || '',
          role: user.role || '',
          avatar: user.avatar || ''
        });
      }

      // Load other settings from localStorage
      const savedNotifications = localStorage.getItem('notificationSettings');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      const savedGeneral = localStorage.getItem('generalSettings');
      if (savedGeneral) {
        setGeneral(JSON.parse(savedGeneral));
      }

      // Load from API for server-side settings
      await loadServerSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [showError, loadServerSettings]);

  useEffect(() => {
    // Load settings from localStorage or API
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showError('Authentication required');
        return;
      }

      // Save profile settings
      if (activeSection === 'profile') {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profile)
        });

        if (response.ok) {
          showSuccess('Profile updated successfully');
          setHasChanges(false);
        } else {
          showError('Failed to update profile');
        }
      }

      // Save notification settings
      if (activeSection === 'notifications') {
        localStorage.setItem('notificationSettings', JSON.stringify(notifications));
        showSuccess('Notification settings saved');
        setHasChanges(false);
      }

      // Save general settings
      if (activeSection === 'general') {
        localStorage.setItem('generalSettings', JSON.stringify(general));
        showSuccess('General settings saved');
        setHasChanges(false);
      }

      // Save server-side settings
      if (['security', 'integrations', 'system'].includes(activeSection)) {
        const settingsData = {
          security: activeSection === 'security' ? security : undefined,
          integrations: activeSection === 'integrations' ? integrations : undefined,
          system: activeSection === 'system' ? system : undefined
        };

        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settingsData)
        });

        if (response.ok) {
          showSuccess('Settings saved successfully');
          setHasChanges(false);
        } else {
          showError('Failed to save settings');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: string | boolean | number) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleGeneralChange = (field: keyof GeneralSettings, value: string | boolean | number) => {
    setGeneral(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleIntegrationChange = (field: keyof IntegrationSettings, value: string | boolean) => {
    setIntegrations(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSystemChange = (field: keyof SystemSettings, value: string | boolean | number) => {
    setSystem(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => handleProfileChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => handleProfileChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => handleProfileChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={profile.department}
            onChange={(e) => handleProfileChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Department</option>
            <option value="engineering">Engineering</option>
            <option value="research">Research</option>
            <option value="administration">Administration</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <input
          type="text"
          value={profile.role}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">Role cannot be changed from settings</p>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
        {[
          { key: 'emailNotifications', label: 'Enable email notifications', description: 'Receive notifications via email' },
          { key: 'newsUpdates', label: 'News updates', description: 'Get notified about new news articles' },
          { key: 'eventReminders', label: 'Event reminders', description: 'Receive reminders for upcoming events' },
          { key: 'userActivity', label: 'User activity', description: 'Notifications about user actions' },
          { key: 'securityAlerts', label: 'Security alerts', description: 'Important security notifications' }
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <div className="text-sm font-medium text-gray-900">{label}</div>
              <div className="text-sm text-gray-500">{description}</div>
            </div>
            <button
              onClick={() => handleNotificationChange(key as keyof NotificationSettings, !notifications[key as keyof NotificationSettings])}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications[key as keyof NotificationSettings] ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">System Notifications</h3>
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">System notifications</div>
            <div className="text-sm text-gray-500">Show notifications in the admin panel</div>
          </div>
          <button
            onClick={() => handleNotificationChange('systemNotifications', !notifications.systemNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.systemNotifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.systemNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              These settings affect the security of your account. Please review carefully.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
            <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
          </div>
          <button
            onClick={() => handleSecurityChange('twoFactorEnabled', !security.twoFactorEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              security.twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Login Notifications</div>
            <div className="text-sm text-gray-500">Get notified when someone logs into your account</div>
          </div>
          <button
            onClick={() => handleSecurityChange('loginNotifications', !security.loginNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              security.loginNotifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                security.loginNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <select
            value={security.sessionTimeout}
            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={480}>8 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Expiry (days)
          </label>
          <select
            value={security.passwordExpiry}
            onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={general.theme}
            onChange={(e) => handleGeneralChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={general.language}
            onChange={(e) => handleGeneralChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={general.timezone}
            onChange={(e) => handleGeneralChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={general.dateFormat}
            onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items Per Page
          </label>
          <select
            value={general.itemsPerPage}
            onChange={(e) => handleGeneralChange('itemsPerPage', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Auto Save</div>
            <div className="text-sm text-gray-500">Automatically save changes as you type</div>
          </div>
          <button
            onClick={() => handleGeneralChange('autoSave', !general.autoSave)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              general.autoSave ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                general.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Cloud Services</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Cloudinary Integration</div>
            <div className="text-sm text-gray-500">Enable image and video management</div>
          </div>
          <button
            onClick={() => handleIntegrationChange('cloudinaryEnabled', !integrations.cloudinaryEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              integrations.cloudinaryEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                integrations.cloudinaryEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {integrations.cloudinaryEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cloudinary Cloud Name
            </label>
            <input
              type="text"
              value={integrations.cloudinaryCloudName}
              onChange={(e) => handleIntegrationChange('cloudinaryCloudName', e.target.value)}
              placeholder="your-cloud-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Email Service</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Service Provider
          </label>
          <select
            value={integrations.emailService}
            onChange={(e) => handleIntegrationChange('emailService', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Analytics & Backup</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Analytics</div>
            <div className="text-sm text-gray-500">Enable usage analytics and tracking</div>
          </div>
          <button
            onClick={() => handleIntegrationChange('analyticsEnabled', !integrations.analyticsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              integrations.analyticsEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                integrations.analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Backup</div>
            <div className="text-sm text-gray-500">Automatically backup data</div>
          </div>
          <button
            onClick={() => handleIntegrationChange('backupEnabled', !integrations.backupEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              integrations.backupEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                integrations.backupEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-900">System Settings</h3>
            <p className="text-sm text-red-700 mt-1">
              These settings affect the entire system. Only administrators should modify these.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Maintenance Mode</div>
            <div className="text-sm text-gray-500">Put the system in maintenance mode</div>
          </div>
          <button
            onClick={() => handleSystemChange('maintenanceMode', !system.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              system.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Debug Mode</div>
            <div className="text-sm text-gray-500">Enable detailed error logging</div>
          </div>
          <button
            onClick={() => handleSystemChange('debugMode', !system.debugMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              system.debugMode ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                system.debugMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-900">Cache</div>
            <div className="text-sm text-gray-500">Enable system caching</div>
          </div>
          <button
            onClick={() => handleSystemChange('cacheEnabled', !system.cacheEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              system.cacheEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                system.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Performance</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Log Level
          </label>
          <select
            value={system.logLevel}
            onChange={(e) => handleSystemChange('logLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Rate Limit (requests per minute)
          </label>
          <input
            type="number"
            value={system.apiRateLimit}
            onChange={(e) => handleSystemChange('apiRateLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'general':
        return renderGeneralSettings();
      case 'integrations':
        return renderIntegrationSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <AdminLayout pageTitle="Settings">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">{section.title}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {settingsSections.find(s => s.id === activeSection)?.title}
                </h1>
                <p className="text-gray-600">
                  {settingsSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              {hasChanges && (
                <div className="flex items-center space-x-2 text-sm text-orange-600">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading settings...</span>
                </div>
              ) : (
                renderActiveSection()
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={saveSettings}
                disabled={!hasChanges || isLoading}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  hasChanges && !isLoading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
