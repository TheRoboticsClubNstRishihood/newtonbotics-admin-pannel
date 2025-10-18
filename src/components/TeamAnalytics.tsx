'use client';

import { useState } from 'react';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CalendarIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  userId: string;
  name: string;
  role: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  contribution?: string;
}

interface TeamAnalyticsProps {
  allTeamMembers: TeamMember[];
}

export default function TeamAnalytics({ allTeamMembers }: TeamAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Calculate statistics
  const totalMembers = allTeamMembers.length;
  const activeMembers = allTeamMembers.filter(m => m.isActive).length;
  const formerMembers = allTeamMembers.filter(m => !m.isActive).length;
  
  // Role distribution
  const roleDistribution = allTeamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly join/leave trends
  const monthlyTrends = allTeamMembers.reduce((acc, member) => {
    const joinDate = new Date(member.joinedAt);
    const joinMonth = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[joinMonth]) {
      acc[joinMonth] = { joined: 0, left: 0 };
    }
    acc[joinMonth].joined += 1;

    if (member.leftAt) {
      const leaveDate = new Date(member.leftAt);
      const leaveMonth = `${leaveDate.getFullYear()}-${String(leaveDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[leaveMonth]) {
        acc[leaveMonth] = { joined: 0, left: 0 };
      }
      acc[leaveMonth].left += 1;
    }

    return acc;
  }, {} as Record<string, { joined: number; left: number }>);

  // Average tenure
  const activeTenures = allTeamMembers
    .filter(m => m.isActive)
    .map(m => {
      const joinDate = new Date(m.joinedAt);
      const now = new Date();
      return Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)); // days
    });

  const averageTenure = activeTenures.length > 0 
    ? Math.round(activeTenures.reduce((sum, days) => sum + days, 0) / activeTenures.length)
    : 0;

  // Turnover rate (members who left / total members)
  const turnoverRate = totalMembers > 0 ? Math.round((formerMembers / totalMembers) * 100) : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTenureColor = (days: number) => {
    if (days < 30) return 'text-red-600';
    if (days < 90) return 'text-yellow-600';
    if (days < 365) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Team Analytics</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'all' | 'month' | 'quarter' | 'year')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
            <div className="text-sm text-gray-600">Total Contributors</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <ClockIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">{averageTenure}</div>
            <div className="text-sm text-gray-600">Avg Tenure (days)</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <ArrowTrendingDownIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{turnoverRate}%</div>
            <div className="text-sm text-gray-600">Turnover Rate</div>
          </div>
        </div>

        {/* Role Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Role Distribution</h4>
          <div className="space-y-2">
            {Object.entries(roleDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([role, count]) => {
                const percentage = Math.round((count / totalMembers) * 100);
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                      <span className="text-sm text-gray-700">{role}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count} ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Team Activity</h4>
          <div className="space-y-3">
            {allTeamMembers
              .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
              .slice(0, 5)
              .map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="text-xs font-medium">
                        {member.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Joined {formatDate(member.joinedAt)}</span>
                    </div>
                    {member.leftAt && (
                      <div className="flex items-center space-x-1 text-xs text-red-500">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Left {formatDate(member.leftAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Longest Tenure Members */}
        {activeMembers > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Longest Tenure (Active Members)</h4>
            <div className="space-y-2">
              {allTeamMembers
                .filter(m => m.isActive)
                .map(member => {
                  const joinDate = new Date(member.joinedAt);
                  const now = new Date();
                  const tenureDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
                  return { ...member, tenureDays };
                })
                .sort((a, b) => b.tenureDays - a.tenureDays)
                .slice(0, 5)
                .map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {member.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{member.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${getTenureColor(member.tenureDays)}`}>
                      {member.tenureDays} days
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



