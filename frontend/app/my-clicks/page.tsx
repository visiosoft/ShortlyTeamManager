'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { api } from '@/lib/api';
import { MousePointer, Globe, Users, Calendar, MapPin, Globe2, DollarSign } from 'lucide-react';

interface ClickData {
  _id: string;
  urlId: {
    originalUrl: string;
    shortCode: string;
  };
  ipAddress: string;
  country: string;
  city: string;
  userAgent: string;
  referer: string;
  createdAt: Date;
}

interface CountryData {
  country: string;
  countryCode: string;
  clicks: number;
  percentage: number;
  cities: Array<{ city: string; clicks: number }>;
}

interface MyTotalClicksData {
  totalClicks: number;
  uniqueIPs: number;
  uniqueCountries: number;
  detailedClicks: ClickData[];
  countryMap: CountryData[];
  topCountries: Array<{
    country: string;
    countryCode: string;
    clicks: number;
    percentage: number;
  }>;
}

interface EarningsData {
  totalEarnings: number;
  currency: string;
  breakdown: Array<{ clicks: number; amount: number; currency: string; }>;
}

interface TeamReward {
  clicks: number;
  amount: number;
  currency: string;
}

interface PredictedEarnings {
  threshold: number;
  rewardAmount: number;
  currency: string;
  progress: number;
  currentRewards: number;
  currentEarnings: number;
  remainingClicks: number;
  clicksToNextReward: number;
  milestones: Array<{
    clicks: number;
    progress: number;
    rewards: number;
    earnings: number;
  }>;
}

// Function to convert referrer URLs to readable names
const getReferrerDisplayName = (referer: string): string => {
  if (!referer) return 'Direct';
  
  try {
    const url = new URL(referer);
    const hostname = url.hostname.toLowerCase();
    
    // Common social media platforms
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'Facebook';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
    if (hostname.includes('instagram.com')) return 'Instagram';
    if (hostname.includes('linkedin.com')) return 'LinkedIn';
    if (hostname.includes('youtube.com')) return 'YouTube';
    if (hostname.includes('tiktok.com')) return 'TikTok';
    if (hostname.includes('reddit.com')) return 'Reddit';
    if (hostname.includes('pinterest.com')) return 'Pinterest';
    if (hostname.includes('snapchat.com')) return 'Snapchat';
    if (hostname.includes('whatsapp.com')) return 'WhatsApp';
    if (hostname.includes('telegram.org')) return 'Telegram';
    if (hostname.includes('discord.com')) return 'Discord';
    if (hostname.includes('slack.com')) return 'Slack';
    if (hostname.includes('google.com') || hostname.includes('google.co')) return 'Google';
    if (hostname.includes('bing.com')) return 'Bing';
    if (hostname.includes('yahoo.com')) return 'Yahoo';
    if (hostname.includes('duckduckgo.com')) return 'DuckDuckGo';
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('stackoverflow.com')) return 'Stack Overflow';
    if (hostname.includes('medium.com')) return 'Medium';
    if (hostname.includes('wordpress.com')) return 'WordPress';
    if (hostname.includes('wix.com')) return 'Wix';
    if (hostname.includes('squarespace.com')) return 'Squarespace';
    if (hostname.includes('shopify.com')) return 'Shopify';
    if (hostname.includes('amazon.com') || hostname.includes('amazon.co')) return 'Amazon';
    if (hostname.includes('ebay.com')) return 'eBay';
    if (hostname.includes('etsy.com')) return 'Etsy';
    if (hostname.includes('craigslist.org')) return 'Craigslist';
    if (hostname.includes('gmail.com') || hostname.includes('mail.google.com')) return 'Gmail';
    if (hostname.includes('outlook.com') || hostname.includes('hotmail.com')) return 'Outlook';
    if (hostname.includes('yahoo.com') && url.pathname.includes('mail')) return 'Yahoo Mail';
    
    // Return the hostname if no specific match
    return hostname.replace('www.', '');
  } catch (error) {
    // If URL parsing fails, try to extract domain from the string
    const domainMatch = referer.match(/https?:\/\/([^\/]+)/);
    if (domainMatch) {
      return domainMatch[1].replace('www.', '');
    }
    return 'Unknown';
  }
};

export default function MyClicksPage() {
  const router = useRouter();
  const [data, setData] = useState<MyTotalClicksData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [predictedEarnings, setPredictedEarnings] = useState<PredictedEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchMyTotalClicks();
    fetchEarnings();
  }, [dateRange]);

  // Fetch team rewards after data is loaded
  useEffect(() => {
    if (data) {
      fetchTeamRewards();
    }
  }, [data]);

  const fetchMyTotalClicks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await apiClient.get(`${api.analytics.myTotalClicks}?${params}`);
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching my total clicks:', err);
      setError(err.response?.data?.message || 'Failed to load your click data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No authentication token found. Please login again.')
        router.push('/login')
        return
      }

      // Build query parameters for date filtering
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const response = await apiClient.get(`${api.teams.earnings}?${params.toString()}`)
      setEarnings(response.data)
    } catch (error) {
      console.error('Error fetching earnings:', error)
      setEarnings({ totalEarnings: 0, currency: 'PKR', breakdown: [] })
    }
  }

  const fetchTeamRewards = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No authentication token found')
        return
      }

      const response = await apiClient.get(api.teams.myTeam)
      const team = response.data
      
      console.log('🔍 fetchTeamRewards debug:')
      console.log('   - Team rewards:', team.rewards)
      console.log('   - Has rewards:', !!team.rewards)
      console.log('   - Rewards length:', team.rewards ? team.rewards.length : 0)
      console.log('   - Data exists:', !!data)
      console.log('   - Data totalClicks:', data ? data.totalClicks : 'N/A')
      
      if (team.rewards && team.rewards.length > 0 && data) {
        console.log('✅ Setting predicted earnings with rewards')
        const reward = team.rewards[0]
        const threshold = reward.clicks
        const rewardAmount = reward.amount
        const currency = reward.currency
        const totalClicks = data.totalClicks
        
        // Calculate earnings for every click, not just when threshold is met
        const earningsPerClick = rewardAmount / threshold
        const currentEarnings = totalClicks * earningsPerClick
        const progress = (totalClicks / threshold) * 100
        const currentRewards = Math.floor(totalClicks / threshold)
        const remainingClicks = totalClicks % threshold
        const clicksToNextReward = threshold - remainingClicks
        
        // Calculate milestones with earnings for every click
        const milestones = [100, 250, 500, 750, 1000, 1500, 2000].map(milestone => ({
          clicks: milestone,
          progress: (milestone / threshold) * 100,
          rewards: Math.floor(milestone / threshold),
          earnings: milestone * earningsPerClick // Earnings for every click
        }))
        
        setPredictedEarnings({
          threshold,
          rewardAmount,
          currency,
          progress,
          currentRewards,
          currentEarnings,
          remainingClicks,
          clicksToNextReward,
          milestones
        })
      } else {
        console.log('❌ Setting predicted earnings to null')
        console.log('   - No rewards or no data')
        // No rewards configured - set predictedEarnings to null to show placeholder
        setPredictedEarnings(null)
      }
    } catch (error) {
      console.error('Error fetching team rewards:', error)
      // On error, set predictedEarnings to null to show placeholder
      setPredictedEarnings(null)
    }
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Pagination logic
  const totalPages = data ? Math.ceil(data.detailedClicks.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClicks = data ? data.detailedClicks.slice(startIndex, endIndex) : [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Reset pagination when date range changes
  useEffect(() => {
    resetPagination();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your click analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMyTotalClicks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Total Clicks</h1>
          <p className="text-gray-600">Detailed analytics of your URL clicks with country insights</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Date Range Filter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {data && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MousePointer className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">{data.totalClicks.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{data.uniqueIPs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {earnings ? `${earnings.totalEarnings} ${earnings.currency}` : 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            {earnings && earnings.breakdown.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                  Earnings Breakdown
                </h3>
                <div className="space-y-3">
                  {earnings.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">💰</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.clicks} clicks</p>
                          <p className="text-sm text-gray-500">Reward tier</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{item.amount} {item.currency}</p>
                        <p className="text-xs text-gray-500">Earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predicted Earnings Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Predicted Earnings
              </h3>
              
              {predictedEarnings ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress to Next Reward</span>
                      <span className="text-sm font-medium text-gray-900">
                        {predictedEarnings.currentRewards} / {Math.ceil(data!.totalClicks / predictedEarnings.threshold)} rewards
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(predictedEarnings.progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{predictedEarnings.threshold} clicks</span>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🎯</span>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Current Clicks</p>
                          <p className="text-xl font-bold text-gray-900">{data!.totalClicks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💰</span>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Current Earnings</p>
                          <p className="text-xl font-bold text-green-600">{predictedEarnings.currentEarnings.toFixed(2)} {predictedEarnings.currency}</p>
                          <p className="text-xs text-gray-500">({(predictedEarnings.rewardAmount / predictedEarnings.threshold).toFixed(2)} per click)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📈</span>
                        <div>
                          <p className="text-sm font-medium text-gray-600">To Next Reward</p>
                          <p className="text-xl font-bold text-orange-600">{predictedEarnings.clicksToNextReward} clicks</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">💰 Earnings Per Click</h4>
                        <p className="text-sm text-gray-600">
                          You earn <span className="font-bold text-green-600">{(predictedEarnings.rewardAmount / predictedEarnings.threshold).toFixed(2)} {predictedEarnings.currency}</span> for every click!
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {(predictedEarnings.rewardAmount / predictedEarnings.threshold).toFixed(2)} {predictedEarnings.currency}
                        </p>
                        <p className="text-xs text-gray-500">per click</p>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Earnings at Milestones</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {predictedEarnings.milestones.map((milestone, index) => (
                        <div 
                          key={milestone.clicks}
                          className={`p-3 rounded-lg border ${
                            data!.totalClicks >= milestone.clicks 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{milestone.clicks} clicks</p>
                              <p className="text-xs text-gray-500">{milestone.progress.toFixed(1)}% progress</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">{milestone.earnings.toFixed(2)} {predictedEarnings.currency}</p>
                              <p className="text-xs text-gray-500">{milestone.rewards} rewards</p>
                            </div>
                          </div>
                          {data!.totalClicks >= milestone.clicks && (
                            <div className="mt-2 text-xs text-green-600 font-medium">✅ Achieved</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Projections */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Time to Next Reward</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📅</span>
                          <div>
                            <p className="text-sm font-medium text-gray-600">At 5 clicks/day</p>
                            <p className="text-lg font-bold text-purple-600">
                              {Math.ceil(predictedEarnings.clicksToNextReward / 5)} days
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📊</span>
                          <div>
                            <p className="text-sm font-medium text-gray-600">At 10 clicks/day</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {Math.ceil(predictedEarnings.clicksToNextReward / 10)} days
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🚀</span>
                          <div>
                            <p className="text-sm font-medium text-gray-600">At 20 clicks/day</p>
                            <p className="text-lg font-bold text-teal-600">
                              {Math.ceil(predictedEarnings.clicksToNextReward / 20)} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💰</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Rewards Configured</h4>
                  <p className="text-gray-600 mb-4">
                    Your team admin hasn't set up reward tiers yet. Once rewards are configured, you'll see your predicted earnings here.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <h5 className="font-medium text-blue-900 mb-2">How it works:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Admin sets reward tiers (e.g., 100 clicks = 50 PKR)</li>
                      <li>• You earn for every click based on the tier</li>
                      <li>• Track your progress towards next reward</li>
                      <li>• See predicted earnings at different milestones</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Referrer Analytics */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe2 className="h-5 w-5 mr-2 text-green-600" />
                Traffic Sources
              </h3>
              
              {(() => {
                // Calculate referrer statistics
                const referrerStats = data!.detailedClicks.reduce((acc, click) => {
                  const referrerName = getReferrerDisplayName(click.referer);
                  acc[referrerName] = (acc[referrerName] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const referrerData = Object.entries(referrerStats)
                  .map(([name, clicks]) => ({ name, clicks, percentage: (clicks / data!.totalClicks) * 100 }))
                  .sort((a, b) => b.clicks - a.clicks);
                
                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {referrerData.slice(0, 6).map((referrer) => (
                        <div key={referrer.name} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{referrer.name}</p>
                              <p className="text-xs text-gray-500">{referrer.clicks} clicks</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{referrer.percentage.toFixed(1)}%</p>
                              <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(referrer.percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {referrerData.length > 6 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          And {referrerData.length - 6} more sources...
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Detailed Clicks Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Clicks</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, data!.detailedClicks.length)} of {data!.detailedClicks.length} clicks
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentClicks.map((click) => (
                      <tr key={click._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{click.urlId.shortCode}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{click.urlId.originalUrl}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{click.ipAddress}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{click.city}, {click.country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {click.referer ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getReferrerDisplayName(click.referer)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Direct
                              </span>
                            )}
                          </div>
                          {click.referer && (
                            <div className="text-xs text-gray-500 truncate max-w-xs" title={click.referer}>
                              {click.referer}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(click.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({data!.detailedClicks.length} total clicks)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm font-medium rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 