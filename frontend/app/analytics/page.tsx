'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { api } from '@/lib/api';
import { Globe, MapPin, Users, MousePointer, BarChart3, Calendar, Filter } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface CountryData {
  country: string;
  countryCode: string;
  clicks: number;
  cities: Array<{ city: string; clicks: number }>;
  ipAddresses: string[];
}

interface TeamMemberStat {
  userId: string;
  clicks: number;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

interface TeamTotalClicksMonth {
  totalClicks: number;
  year: number;
  month: number;
  monthName: string;
}

interface TeamCountry {
  country: string;
  countryCode: string;
  clicks: number;
  percentage: number;
}

interface TopTeamCountry {
  country: string;
  countryCode: string;
  clicks: number;
  percentage: number;
  cities: Array<{ city: string; clicks: number }>;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [teamStats, setTeamStats] = useState<TeamMemberStat[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMemberStat | null>(null);
  const [memberAnalytics, setMemberAnalytics] = useState<any[]>([]);
  const [loadingMember, setLoadingMember] = useState(false);
  const [tooltip, setTooltip] = useState<{ show: boolean; content: string; x: number; y: number }>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Load cached date range from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('analytics_date_range');
      if (cached) {
        return JSON.parse(cached);
      }
    }
    // Default to last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { startDate, endDate };
  });
  
  // New admin analytics state
  const [teamTotalClicksMonth, setTeamTotalClicksMonth] = useState<TeamTotalClicksMonth | null>(null);
  const [teamCountries, setTeamCountries] = useState<TeamCountry[]>([]);
  const [topTeamCountries, setTopTeamCountries] = useState<TopTeamCountry[]>([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchAnalytics();
    if (parsedUser.role === 'admin') {
      fetchTeamStats(token);
      fetchAdminAnalytics();
    }
  }, [router, dateRange]); // Add dateRange as dependency

  // Cache date range when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_date_range', JSON.stringify(dateRange));
    }
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = user?.role === 'admin' 
        ? api.analytics.countriesDetailed
        : api.analytics.userCountriesDetailed;
      
      // Add date range parameters to the request
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await apiClient.get(`${endpoint}?${params}`);
      console.log('Analytics data received:', response.data); // Debug log
      setCountryData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async (token: string) => {
    try {
      // Add date range parameters to team stats request
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await apiClient.get(`${api.analytics.teamMembers}?${params}`);
      setTeamStats(response.data);
    } catch (err) {
      console.error('Error fetching team stats:', err);
    }
  };

  const fetchAdminAnalytics = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      setLoadingAdminData(true);
      
      // Add date range parameters to admin analytics requests
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      // Fetch team total clicks for current month
      const totalClicksResponse = await apiClient.get(`${api.analytics.admin.teamTotalClicksMonth}?${params}`);
      setTeamTotalClicksMonth(totalClicksResponse.data);
      
      // Fetch team countries
      const countriesResponse = await apiClient.get(`${api.analytics.admin.teamCountries}?${params}`);
      setTeamCountries(countriesResponse.data);
      
      // Fetch top team countries
      const topCountriesResponse = await apiClient.get(`${api.analytics.admin.topTeamCountries}?${params}`);
      setTopTeamCountries(topCountriesResponse.data);
      
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoadingAdminData(false);
    }
  };

  const fetchMemberAnalytics = async (userId: string) => {
    setLoadingMember(true);
    try {
      // Add date range parameters to member analytics request
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await apiClient.get(`${api.analytics.user(userId)}?${params}`);
      setMemberAnalytics(response.data);
    } catch (err) {
      setMemberAnalytics([]);
    } finally {
      setLoadingMember(false);
    }
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetDateRange = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ startDate, endDate });
  };

  const totalClicks = countryData.reduce((sum, country) => sum + country.clicks, 0);
  const uniqueCountries = countryData.length;
  const uniqueIPs = new Set(countryData.flatMap(country => country.ipAddresses)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Track your team\'s URL performance across the globe' 
              : 'Track your URL performance across the globe'
            }
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Date Range Filter
            </h2>
            <button
              onClick={resetDateRange}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Reset to Last 30 Days
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p>Selected Range:</p>
                <p className="font-medium">
                  {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin: Team Member Click Stats */}
        {user?.role === 'admin' && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-blue-600" /> Team Member Clicks
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Clicks</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {teamStats.map((member) => (
                    <tr key={member.userId} className="hover:bg-blue-50">
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{member.user?.email || '-'}</td>
                      <td className="px-4 py-2 text-gray-700">{member.user?.role || '-'}</td>
                      <td className="px-4 py-2 text-blue-700 font-bold">{member.clicks}</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => {
                            setSelectedMember(member);
                            fetchMemberAnalytics(member.userId);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin: Team Total Clicks for Month & Team Countries Overview side by side */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Team Total Clicks for Month */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MousePointer className="h-6 w-6 mr-2 text-green-600" /> Team Total Clicks for {teamTotalClicksMonth?.monthName || 'Current Month'}
              </h2>
              {loadingAdminData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading team analytics...</p>
                </div>
              ) : teamTotalClicksMonth ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {teamTotalClicksMonth.totalClicks.toLocaleString()}
                  </div>
                  <p className="text-gray-600">
                    Total clicks for {teamTotalClicksMonth.monthName} {teamTotalClicksMonth.year}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center">No team click data available for this month.</p>
              )}
            </div>
            {/* Team Countries Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-2 text-purple-600" /> Team Countries Overview
              </h2>
              {loadingAdminData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading team countries...</p>
                </div>
              ) : teamCountries.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {teamCountries.slice(0, 6).map((country, index) => (
                    <div key={country.countryCode} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{country.country}</p>
                          <p className="text-sm text-gray-500">{country.countryCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">{country.clicks}</p>
                          <p className="text-sm text-gray-500">{country.percentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No team country data available.</p>
              )}
            </div>
          </div>
        )}

        {/* Member Analytics Modal/Section */}
        {selectedMember && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedMember.user ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}` : 'User'}'s Clicks
              </h2>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setMemberAnalytics([]);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            {loadingMember ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading member analytics...</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Clicks</h3>
                {memberAnalytics.length === 0 ? (
                  <p className="text-gray-500">No click data available for this user.</p>
                ) : (
                  <div className="overflow-x-auto max-h-64">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Short URL</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {memberAnalytics.slice(0, 20).map((click, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-blue-700">
                              {click.urlId?.shortCode || '-'}
                            </td>
                            <td className="px-4 py-2 font-mono text-xs">{click.ipAddress}</td>
                            <td className="px-4 py-2">{click.country || '-'}</td>
                            <td className="px-4 py-2">{click.city || '-'}</td>
                            <td className="px-4 py-2 text-xs">{click.createdAt ? new Date(click.createdAt).toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MousePointer className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'admin' ? 'Total Team Clicks' : 'My Total Clicks'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'admin' ? 'Team Countries' : 'My Countries'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{uniqueCountries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'admin' ? 'Team Unique IPs' : 'My Unique IPs'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{uniqueIPs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* World Map */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-red-600" />
            {user?.role === 'admin' ? 'Team Click Distribution' : 'My Click Distribution'}
          </h2>
          
          {countryData.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {user?.role === 'admin' ? 'No team click data available yet' : 'No click data available yet'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {user?.role === 'admin' 
                  ? 'Team members need to share URLs to see analytics' 
                  : 'Start sharing your URLs to see analytics'
                }
              </p>
            </div>
          ) : (
            <div className="relative">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 147,
                  center: [0, 0]
                }}
              >
                <ZoomableGroup>
                  <Geographies geography="/features.json">
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const countryCode = geo.properties.ISO_A2;
                        const countryName = geo.properties.NAME;
                        const countryInfo = countryData.find(c => c.countryCode === countryCode);
                        const clickCount = countryInfo?.clicks || 0;
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => {
                              if (countryInfo) {
                                setSelectedCountry(selectedCountry?.countryCode === countryCode ? null : countryInfo);
                              }
                            }}
                            onMouseEnter={(evt) => {
                              if (clickCount > 0) {
                                console.log('Mouse enter:', countryName, clickCount); // Debug log
                                setTooltip({
                                  show: true,
                                  content: `${countryName}: ${clickCount} click${clickCount !== 1 ? 's' : ''}`,
                                  x: evt.clientX,
                                  y: evt.clientY
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              setTooltip({ show: false, content: '', x: 0, y: 0 });
                            }}
                            style={{
                              default: {
                                fill: clickCount > 0 ? '#3B82F6' : '#E5E7EB',
                                stroke: '#FFFFFF',
                                strokeWidth: 0.5,
                                outline: 'none',
                              },
                              hover: {
                                fill: clickCount > 0 ? '#2563EB' : '#D1D5DB',
                                stroke: '#FFFFFF',
                                strokeWidth: 0.5,
                                outline: 'none',
                              },
                              pressed: {
                                fill: clickCount > 0 ? '#1D4ED8' : '#9CA3AF',
                                stroke: '#FFFFFF',
                                strokeWidth: 0.5,
                                outline: 'none',
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              
              {/* Tooltip */}
              {tooltip.show && (
                <div
                  className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none"
                  style={{
                    left: tooltip.x + 10,
                    top: tooltip.y - 10,
                  }}
                >
                  {tooltip.content}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Country Details */}
        {selectedCountry && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCountry.country} ({selectedCountry.countryCode})
              </h2>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Top Cities</h3>
                {selectedCountry.cities.length === 0 ? (
                  <p className="text-gray-500">No city data available for this country.</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedCountry.cities.slice(0, 10).map((city, index) => (
                      <div
                        key={city.city}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{city.city}</p>
                            <p className="text-sm text-gray-500">{selectedCountry.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{city.clicks}</p>
                          <p className="text-sm text-gray-500">clicks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedCountry.clicks.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600">Unique IP Addresses</p>
                    <p className="text-2xl font-bold text-green-900">{selectedCountry.ipAddresses.length}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-600">Cities with Clicks</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedCountry.cities.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Countries List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-6 w-6 mr-2 text-green-600" />
            {user?.role === 'admin' ? 'Top Team Countries' : 'Top Countries'}
          </h2>
          
          {countryData.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {user?.role === 'admin' ? 'No team click data available yet' : 'No click data available yet'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {user?.role === 'admin' 
                  ? 'Team members need to share URLs to see analytics' 
                  : 'Start sharing your URLs to see analytics'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {countryData.slice(0, 10).map((country, index) => (
                <div
                  key={country.countryCode}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCountry(selectedCountry?.countryCode === country.countryCode ? null : country)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{country.country}</p>
                      <p className="text-sm text-gray-500">{country.countryCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{country.clicks.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {country.cities.length} cit{country.cities.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 