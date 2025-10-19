import React from 'react';
import { ActivityFeedProps } from '../../types/dashboard';

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  title = 'Recent Activity', 
  maxItems = 10 
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (!displayActivities.length) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  by {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
