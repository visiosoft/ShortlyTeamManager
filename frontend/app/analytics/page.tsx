'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Globe, MapPin, Users, MousePointer, BarChart3 } from 'lucide-react';
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
    }
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/analytics/countries/detailed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      const response = await axios.get('http://localhost:3001/analytics/team-members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamStats(response.data);
    } catch (err) {
      console.error('Error fetching team stats:', err);
    }
  };

  const fetchMemberAnalytics = async (userId: string) => {
    setLoadingMember(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/analytics/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberAnalytics(response.data);
    } catch (err) {
      setMemberAnalytics([]);
    } finally {
      setLoadingMember(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your URL performance across the globe</p>
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
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
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
                <p className="text-sm font-medium text-gray-600">Countries</p>
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
                <p className="text-sm font-medium text-gray-600">Unique IPs</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueIPs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* World Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Click Distribution</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              {countryData.length === 0 ? (
                <div className="h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No click data available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Start sharing your URLs to see analytics</p>
                  </div>
                </div>
              ) : (
                <ComposableMap
                  projection="geoEqualEarth"
                  projectionConfig={{
                    scale: 147,
                    center: [0, 0]
                  }}
                >
                  <ZoomableGroup>
                    <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const countryCode = geo.properties.ISO_A2;
                          const countryInfo = countryData.find(c => c.countryCode === countryCode);
                          const clickCount = countryInfo?.clicks || 0;
                          const countryName = geo.properties.NAME || geo.properties.ADMIN || 'Unknown';
                          
                          // Debug log for countries with clicks
                          if (clickCount > 0) {
                            console.log('Country with clicks:', countryName, countryCode, clickCount);
                          }
                          
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
                                  fill: clickCount > 0 ? `rgba(59, 130, 246, ${Math.min(0.4 + (clickCount / Math.max(...countryData.map(c => c.clicks))) * 0.6, 1)})` : '#E5E7EB',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                                hover: {
                                  fill: clickCount > 0 ? '#3B82F6' : '#E5E7EB',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                  cursor: clickCount > 0 ? 'pointer' : 'default',
                                },
                                pressed: {
                                  fill: '#1D4ED8',
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
              )}
            </div>
            <div className="mt-4">
              <div className="text-center mb-3">
                <p className="text-sm text-gray-600">
                  {countryData.length} countries with clicks detected
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hover over highlighted countries to see click counts
                </p>
              </div>
              
              {/* Color Legend */}
              {countryData.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2 text-center">Color Legend</p>
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
                      <span className="text-gray-600">No clicks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-300 rounded border border-blue-400"></div>
                      <span className="text-gray-600">Low clicks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded border border-blue-700"></div>
                      <span className="text-gray-600">High clicks</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tooltip */}
            {tooltip.show && (
              <div
                className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none border border-gray-700"
                style={{
                  left: Math.min(tooltip.x + 10, window.innerWidth - 200),
                  top: Math.max(tooltip.y - 40, 10),
                }}
              >
                {tooltip.content}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>

          {/* Country List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Countries</h2>
            {countryData.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No click data available yet</p>
                <p className="text-sm text-gray-500 mt-2">Start sharing your URLs to see analytics</p>
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
                      <p className="font-semibold text-gray-900">{country.clicks.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {((country.clicks / totalClicks) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Country View */}
        {selectedCountry && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCountry.country} ({selectedCountry.countryCode})
              </h2>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Top Cities</h3>
                {selectedCountry.cities.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCountry.cities.slice(0, 5).map((city, index) => (
                      <div key={city.city} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{city.city}</span>
                        <span className="text-sm text-gray-600">{city.clicks} clicks</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No city data available</p>
                )}
              </div>

              {/* IP Addresses */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent IP Addresses</h3>
                <div className="space-y-2">
                  {selectedCountry.ipAddresses.slice(0, 5).map((ip, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded font-mono text-sm">
                      {ip}
                    </div>
                  ))}
                </div>
                {selectedCountry.ipAddresses.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    +{selectedCountry.ipAddresses.length - 5} more IPs
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 