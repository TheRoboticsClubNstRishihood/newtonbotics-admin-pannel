import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const includeCharts = searchParams.get('includeCharts') === 'true';

    console.log('📊 Dashboard API - GET request received');
    console.log('🔗 Backend URL:', backendUrl);
    console.log('📅 Period:', period);
    console.log('📈 Include Charts:', includeCharts);

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020); // Start from 2020
        break;
    }

    // Fetch dashboard data from the backend API
    console.log('🔄 Fetching dashboard data from backend...');
    const dashboardResponse = await fetch(`${backendUrl}/api/admin/dashboard/summary?period=${period}&includeCharts=${includeCharts}`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Dashboard API Response Status:', dashboardResponse.status);

    if (!dashboardResponse.ok) {
      throw new Error(`Backend API error: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
    }

    const dashboardData = await dashboardResponse.json();
    console.log('📊 Dashboard data received:', dashboardData.success ? 'Success' : 'Failed');

    if (!dashboardData.success) {
      throw new Error(dashboardData.error?.message || 'Failed to fetch dashboard data');
    }

    return NextResponse.json({
      success: true,
      data: dashboardData.data
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

