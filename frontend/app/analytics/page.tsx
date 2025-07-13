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

// Add this mapping at the top of the file (after imports)
const iso2to3: Record<string, string> = {
  PK: 'PAK', US: 'USA', GB: 'GBR', DE: 'DEU', CA: 'CAN', AU: 'AUS', NL: 'NLD', FR: 'FRA', ES: 'ESP', IT: 'ITA', JP: 'JPN', KR: 'KOR', IN: 'IND', BR: 'BRA', MX: 'MEX', CN: 'CHN', RU: 'RUS', // ... add more as needed
};

// Simple color scale function
const getColorScale = (minClicks: number, maxClicks: number) => {
  return (clicks: number) => {
    if (clicks === 0) return '#f8fafc'; // Very light gray for no clicks
    
    if (maxClicks === minClicks) {
      // If all countries have the same number of clicks, use a medium green
      return '#10b981';
    }
    
    // Create a vibrant green to red gradient for better visibility
    const ratio = (clicks - minClicks) / (maxClicks - minClicks);
    
    // Use a green to red gradient for better visibility
    if (ratio < 0.2) {
      return '#dcfce7'; // Very light green for low clicks
    } else if (ratio < 0.4) {
      return '#86efac'; // Light green for low-medium clicks
    } else if (ratio < 0.6) {
      return '#22c55e'; // Medium green for medium clicks
    } else if (ratio < 0.8) {
      return '#16a34a'; // Dark green for high clicks
    } else {
      return '#15803d'; // Very dark green for very high clicks
    }
  };
};

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
    // Default: start date is yesterday, end date is today
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const endDate = today.toISOString().split('T')[0];
    const startDate = yesterday.toISOString().split('T')[0];
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
      console.error('Error fetching member analytics:', err);
    } finally {
      setLoadingMember(false);
    }
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const resetDateRange = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ startDate, endDate });
  };

  // Handle country click without zoom
  const handleCountryClick = (countryInfo: CountryData | null) => {
    if (countryInfo) {
      setSelectedCountry(countryInfo);
    } else {
      setSelectedCountry(null);
    }
  };

  // Calculate statistics
  const totalClicks = countryData.reduce((sum, country) => sum + country.clicks, 0);
  const uniqueCountries = countryData.length;
  const uniqueIPs = new Set(countryData.flatMap(country => country.ipAddresses)).size;

  // Calculate min/max clicks for color scale
  const minClicks = countryData.length > 0 ? Math.min(...countryData.map(c => c.clicks)) : 0;
  const maxClicks = countryData.length > 0 ? Math.max(...countryData.map(c => c.clicks)) : 1;
  const colorScale = getColorScale(minClicks, maxClicks);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your URL performance and audience insights</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Date Range Filter
          </h2>
          <button
            onClick={resetDateRange}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset to Last 30 Days
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueCountries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique IPs</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueIPs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueCountries > 0 ? Math.round(totalClicks / uniqueCountries) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* World Map */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Globe className="w-6 h-6 mr-2" />
            Team Click Distribution
          </h2>
        </div>
        
        <div className="relative">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 200, center: [0, 20] }}
            style={{ height: '500px' }}
          >
            <Geographies geography="/world-countries.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryCode3 = geo.id;
                  // Find the analytics data using 3-letter code
                  const countryInfo = countryData.find(c => iso2to3[c.countryCode] === countryCode3);
                  const clickCount = countryInfo?.clicks || 0;
                  const isSelected = selectedCountry && iso2to3[selectedCountry.countryCode] === countryCode3;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (countryInfo) {
                          handleCountryClick(isSelected ? null : countryInfo);
                        }
                      }}
                      onMouseEnter={(evt) => {
                        if (clickCount > 0) {
                          setTooltip({
                            show: true,
                            content: `${geo.properties.name}: ${clickCount} click${clickCount !== 1 ? 's' : ''} • ${countryInfo?.cities.length || 0} cities • ${countryInfo?.ipAddresses.length || 0} IPs`,
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
                          fill: colorScale(clickCount),
                          stroke: isSelected ? '#f59e42' : '#fff',
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: 'none',
                          cursor: clickCount > 0 ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: colorScale(clickCount),
                          stroke: '#f59e42',
                          strokeWidth: 2,
                          outline: 'none',
                          cursor: clickCount > 0 ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: colorScale(clickCount),
                          stroke: '#f59e42',
                          strokeWidth: 2,
                          outline: 'none',
                          cursor: clickCount > 0 ? 'pointer' : 'default',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          
          {/* Map Legend */}
          <div className="absolute right-0 top-0 bg-white bg-opacity-95 rounded-lg shadow-lg p-4 mt-4 mr-4 z-10 flex flex-col items-center border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Click Distribution</h4>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded border border-gray-300" style={{ background: '#f8fafc' }} />
              <span className="text-xs text-gray-700">No clicks</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded border border-gray-300" style={{ background: '#dcfce7' }} />
              <span className="text-xs text-gray-700">Very low clicks</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded border border-gray-300" style={{ background: '#86efac' }} />
              <span className="text-xs text-gray-700">Low clicks</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded border border-gray-300" style={{ background: '#22c55e' }} />
              <span className="text-xs text-gray-700">Medium clicks</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded border border-gray-300" style={{ background: '#16a34a' }} />
              <span className="text-xs text-gray-700">High clicks</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded border border-gray-300" style={{ background: '#15803d' }} />
              <span className="text-xs text-gray-700">Very high clicks</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 font-medium">Interactive World Map</div>
          </div>
          
          {/* Tooltip */}
          {tooltip.show && (
            <div
              className="fixed z-50 px-3 py-2 bg-white border border-gray-300 rounded shadow text-xs pointer-events-none"
              style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>

      {/* Selected Country Details */}
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
            
            {/* IP Addresses Section */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-3">IP Addresses</h3>
              {selectedCountry.ipAddresses.length === 0 ? (
                <p className="text-gray-500">No IP address data available for this country.</p>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {selectedCountry.ipAddresses.map((ip, index) => (
                      <div
                        key={index}
                        className="bg-white rounded border p-2 text-sm font-mono text-gray-700 hover:bg-gray-100 cursor-pointer"
                        title={`IP Address ${index + 1}`}
                      >
                        {ip}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Showing {selectedCountry.ipAddresses.length} unique IP addresses
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Countries List */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPin className="w-6 h-6 mr-2" />
            Top Countries
          </h2>
        </div>
        
        {countryData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No country data available.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {countryData.slice(0, 10).map((country, index) => (
              <div
                key={country.countryCode}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCountry(selectedCountry?.countryCode === country.countryCode ? null : country)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        {country.country}
                      </p>
                      <p className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block">
                        {country.countryCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{country.clicks.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {country.cities.length} cit{country.cities.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Analytics Section */}
      {user?.role === 'admin' && (
        <>
          {/* Team Total Clicks for Current Month */}
          {teamTotalClicksMonth && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Total Clicks - {teamTotalClicksMonth.monthName} {teamTotalClicksMonth.year}</h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm font-medium text-blue-600">Total Clicks</p>
                <p className="text-4xl font-bold text-blue-900">{teamTotalClicksMonth.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Team Countries */}
          {teamCountries.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Countries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamCountries.map((country, index) => (
                  <div key={country.countryCode} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">
                              {country.country}
                            </p>
                            <p className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                              {country.countryCode}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">
                            {country.percentage.toFixed(1)}% of total clicks
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-xl font-bold text-blue-600">{country.clicks.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">clicks</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Team Countries */}
          {topTeamCountries.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Team Countries</h2>
              <div className="space-y-4">
                {topTeamCountries.map((country, index) => (
                  <div key={country.countryCode} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {country.country}
                          </p>
                          <p className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                            {country.countryCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{country.clicks.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{country.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    {country.cities.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Top Cities:</p>
                        <div className="flex flex-wrap gap-2">
                          {country.cities.slice(0, 5).map((city, cityIndex) => (
                            <span
                              key={cityIndex}
                              className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                            >
                              {city.city} ({city.clicks})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Member Stats */}
          {teamStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Member Performance</h2>
              <div className="space-y-4">
                {teamStats.map((member, index) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (selectedMember?.userId === member.userId) {
                        setSelectedMember(null);
                        setMemberAnalytics([]);
                      } else {
                        setSelectedMember(member);
                        fetchMemberAnalytics(member.userId);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-600">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{member.clicks}</p>
                      <p className="text-sm text-gray-500">clicks</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Member Analytics */}
              {selectedMember && memberAnalytics.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {selectedMember.user?.firstName} {selectedMember.user?.lastName} - Recent Clicks
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {memberAnalytics.slice(0, 10).map((click, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium text-gray-900">{click.urlId?.shortCode}</p>
                          <p className="text-sm text-gray-500">{click.ipAddress}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{click.country || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(click.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 