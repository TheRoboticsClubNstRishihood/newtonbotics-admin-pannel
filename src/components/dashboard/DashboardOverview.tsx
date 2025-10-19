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
  overview: DashboardOverview;
  className?: string;
}

const DashboardOverviewComponent: React.FC<DashboardOverviewProps> = ({ 
  overview, 
  className = '' 
}) => {
  const statsCards = [
    {
      title: 'Total Users',
      value: overview.totalUsers,
      icon: UsersIcon,
      color: 'blue' as const,
      subtitle: `${overview.activeUsers} active`
    },
    {
      title: 'Total Projects',
      value: overview.totalProjects,
      icon: DocumentTextIcon,
      color: 'green' as const,
      subtitle: `${overview.activeProjects} active`
    },
    {
      title: 'Workshops',
      value: overview.totalWorkshops,
      icon: AcademicCapIcon,
      color: 'purple' as const
    },
    {
      title: 'Upcoming Events',
      value: overview.upcomingEvents,
      icon: CalendarIcon,
      color: 'orange' as const
    },
    {
      title: 'News Articles',
      value: overview.totalNews,
      icon: NewspaperIcon,
      color: 'pink' as const
    },
    {
      title: 'Equipment Items',
      value: overview.totalEquipment,
      icon: WrenchScrewdriverIcon,
      color: 'indigo' as const
    },
    {
      title: 'Pending Requests',
      value: overview.pendingRequests,
      icon: ClockIcon,
      color: 'red' as const
    },
    {
      title: 'Contact Submissions',
      value: overview.contactSubmissions,
      icon: ChatBubbleLeftRightIcon,
      color: 'blue' as const
    },
    {
      title: 'Newsletter Subscribers',
      value: overview.newsletterSubscribers,
      icon: ChatBubbleLeftRightIcon,
      color: 'green' as const
    },
    {
      title: 'Unread Notifications',
      value: overview.unreadNotifications,
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
