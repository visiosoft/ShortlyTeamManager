'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Calendar, Filter, TrendingUp, Users } from 'lucide-react';
import apiClient from '@/lib/axios';
import { api } from '@/lib/api';

interface PlatformClick {
  _id: string;
  platformId: { _id: string; name: string };
  userId: { _id: string; firstName: string; lastName: string; email: string };
  teamId: { _id: string; name: string };
  clicks: number;
  date: string;
  earnings: number;
  ratePerClick: number;
  notes?: string;
  addedBy: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  team: {
    id: string;
    name: string;
  };
}

export default function PlatformClicksPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [platformClicks, setPlatformClicks] = useState<PlatformClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchMyPlatformClicks();
  }, [router, dateFilters]);

  const fetchMyPlatformClicks = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for date filtering
      const params = new URLSearchParams();
      if (dateFilters.startDate) params.append('startDate', dateFilters.startDate);
      if (dateFilters.endDate) params.append('endDate', dateFilters.endDate);
      
      const response = await apiClient.get(`/api/platforms/clicks/my-clicks?${params.toString()}`);
      setPlatformClicks(response.data);
    } catch (error) {
      console.error('Error fetching platform clicks:', error);
      setPlatformClicks([]);
    } finally {
      setLoading(false);
    }
  };

  const clearDateFilters = () => {
    setDateFilters({
      startDate: '',
      endDate: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = platformClicks.reduce((acc, click) => {
      acc.totalClicks += click.clicks;
      acc.totalEarnings += click.earnings;
      return acc;
    }, { totalClicks: 0, totalEarnings: 0 });

    return totals;
  };

  // Calculate totals by platform
  const calculateTotalsByPlatform = () => {
    const platformTotals = platformClicks.reduce((acc: { [key: string]: { name: string; totalClicks: number; totalEarnings: number } }, click) => {
      const platformId = click.platformId._id;
      if (!acc[platformId]) {
        acc[platformId] = {
          name: click.platformId.name,
          totalClicks: 0,
          totalEarnings: 0
        };
      }
      acc[platformId].totalClicks += click.clicks;
      acc[platformId].totalEarnings += click.earnings;
      return acc;
    }, {});

    return Object.values(platformTotals);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Platform Clicks</h1>
        <p className="text-gray-600">Track your platform clicks and earnings</p>
      </div>

      {/* Date Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateFilters.startDate}
              onChange={(e) => setDateFilters({ ...dateFilters, startDate: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateFilters.endDate}
              onChange={(e) => setDateFilters({ ...dateFilters, endDate: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={clearDateFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {(dateFilters.startDate || dateFilters.endDate) && (
          <div className="mt-2 text-sm text-gray-600">
            Filtering: {dateFilters.startDate && `From ${dateFilters.startDate}`} {dateFilters.startDate && dateFilters.endDate && 'to'} {dateFilters.endDate && `To ${dateFilters.endDate}`}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {platformClicks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{calculateTotals().totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotals().totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Platforms</p>
                <p className="text-2xl font-bold text-gray-900">{calculateTotalsByPlatform().length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Clicks Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Platform Clicks Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {platformClicks.length > 0 ? (
                platformClicks.map((click) => (
                  <tr key={click._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {click.platformId.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{click.clicks}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(click.ratePerClick)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(click.earnings)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(click.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {click.addedBy.firstName} {click.addedBy.lastName}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No platform clicks found for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform-wise Totals */}
      {platformClicks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings by Platform</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculateTotalsByPlatform().map((platformTotal, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{platformTotal.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{platformTotal.totalClicks.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(platformTotal.totalEarnings)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 