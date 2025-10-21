import React from 'react';
import { 
  UsersIcon,
  AcademicCapIcon,
  CalendarIcon,
  NewspaperIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { DashboardOverview } from '../../types/dashboard';
import StatsCard from './StatsCard';

interface DashboardOverviewProps {
  overview: DashboardOverview | null;
  className?: string;
}

const DashboardOverviewComponent: React.FC<DashboardOverviewProps> = ({ 
  overview, 
  className = '' 
}) => {
  if (!overview) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ${className}`}>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: overview.totalUsers || 0,
      icon: UsersIcon,
      color: 'blue' as const,
      subtitle: `${overview.activeUsers || 0} active`
    },
    {
      title: 'Total Projects',
      value: overview.totalProjects || 0,
      icon: DocumentTextIcon,
      color: 'green' as const,
      subtitle: `${overview.activeProjects || 0} active`
    },
    {
      title: 'Workshops',
      value: overview.totalWorkshops || 0,
      icon: AcademicCapIcon,
      color: 'purple' as const
    },
    {
      title: 'Upcoming Events',
      value: overview.upcomingEvents || 0,
      icon: CalendarIcon,
      color: 'orange' as const
    },
    {
      title: 'News Articles',
      value: overview.totalNews || 0,
      icon: NewspaperIcon,
      color: 'pink' as const
    },
    {
      title: 'Equipment Items',
      value: overview.totalEquipment || 0,
      icon: WrenchScrewdriverIcon,
      color: 'indigo' as const
    },
    {
      title: 'Pending Requests',
      value: overview.pendingRequests || 0,
      icon: ClockIcon,
      color: 'red' as const
    },
    {
      title: 'Contact Submissions',
      value: overview.contactSubmissions || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'blue' as const
    },
    {
      title: 'Newsletter Subscribers',
      value: overview.newsletterSubscribers || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'green' as const
    },
    {
      title: 'Unread Notifications',
      value: overview.unreadNotifications || 0,
      icon: BellIcon,
      color: 'red' as const
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ${className}`}>
      {statsCards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          subtitle={card.subtitle}
        />
      ))}
    </div>
  );
};

export default DashboardOverviewComponent;



