'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Link, Copy, ExternalLink, BarChart3, Users, LogOut, Plus, MousePointer, TrendingUp, Shield, DollarSign } from 'lucide-react'
import apiClient from '@/lib/axios'
import { api } from '@/lib/api'

interface UrlData {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  isActive: boolean
  title?: string
  description?: string
  userId: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  isAdminCreated: boolean
  createdByAdmin?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  team: {
    id: string
    name: string
    description?: string
  }
  earnings?: {
    totalEarnings: number
    currency: string
    breakdown: Array<{ clicks: number; amount: number; currency: string; }>
  }
}

interface FormData {
  originalUrl: string
  customShortCode?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [urls, setUrls] = useState<UrlData[]>([])
  const [teamUrls, setTeamUrls] = useState<UrlData[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'my-urls' | 'team-urls'>('my-urls')
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [shortCode, setShortCode] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Fetch team data if not available
    if (!parsedUser.team) {
      fetchTeamData()
    }
    
    fetchUrls()
    if (parsedUser.role === 'admin') {
      fetchTeamUrls()
    }
    fetchEarnings()
  }, [router])

  const fetchUrls = async () => {
    try {
      // Fetch both user-created URLs and admin-assigned URLs
      const [myUrlsResponse, assignedUrlsResponse] = await Promise.all([
        apiClient.get(api.urls.myUrls),
        apiClient.get(api.urls.assignedToMe)
      ])
      
      // Combine user-created URLs with admin-assigned URLs
      const myUrls = myUrlsResponse.data.urls || []
      const assignedUrls = assignedUrlsResponse.data.urls || []
      
      // Create a map to avoid duplicates (in case a URL appears in both lists)
      const urlMap = new Map()
      
      // Add user-created URLs first
      myUrls.forEach((url: UrlData) => {
        urlMap.set(url.id, url)
      })
      
      // Add admin-assigned URLs (these will override user-created ones if same ID)
      assignedUrls.forEach((url: UrlData) => {
        urlMap.set(url.id, url)
      })
      
      // Convert map back to array
      const combinedUrls = Array.from(urlMap.values())
      setUrls(combinedUrls)
    } catch (error) {
      console.error('Error fetching URLs:', error)
    }
  }

  const fetchTeamUrls = async () => {
    try {
      const response = await apiClient.get(api.urls.teamUrls)
      setTeamUrls(response.data.urls)
    } catch (error) {
      console.error('Error fetching team URLs:', error)
    }
  }

  const fetchTeamData = async () => {
    try {
      const response = await apiClient.get(api.teams.myTeam)
      setUser(prev => prev ? { ...prev, team: response.data } : null)
    } catch (error) {
      console.error('Error fetching team data:', error)
    }
  }

  const fetchEarnings = async () => {
    try {
      const response = await apiClient.get(api.teams.earnings)
      setUser(prev => prev ? { ...prev, earnings: response.data } : null)
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await apiClient.post(api.urls.create, data)
      setUrls(prev => [response.data, ...prev])
      setCreatedUrl(response.data.shortUrl)
      setShortCode(response.data.shortCode)
      setValue('originalUrl', response.data.shortUrl)
    } catch (error: any) {
      console.error('Error creating URL:', error)
      alert(error.response?.data?.message || 'Error creating short URL')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Description */}
      <div className="mb-8">
        <p className="text-gray-600">Manage your URLs and track performance</p>
      </div>

      {/* User Info and Earnings */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Team: {user.team?.name || 'Loading...'}
          </div>
          <span className="text-sm text-gray-600">
            Welcome, {user.firstName} {user.lastName}
          </span>
        </div>
        {user.earnings && (
          <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-green-800">
              Earnings: {user.earnings.totalEarnings} {user.earnings.currency}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user.role === 'admin' ? 'All URLs' : 'My URLs'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.role === 'admin' ? urls.length + teamUrls.length : urls.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Link className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user.role === 'admin' ? 'Total Clicks' : 'My Clicks'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.role === 'admin' 
                    ? urls.reduce((sum, url) => sum + url.clicks, 0) + teamUrls.reduce((sum, url) => sum + url.clicks, 0)
                    : urls.reduce((sum, url) => sum + url.clicks, 0)
                  }
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MousePointer className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user.role === 'admin' ? 'Links Added This Month' : 'My Links This Month'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.role === 'admin' 
                    ? urls.filter(url => {
                        const urlDate = new Date(url.createdAt);
                        const now = new Date();
                        return urlDate.getMonth() === now.getMonth() && urlDate.getFullYear() === now.getFullYear();
                      }).length + teamUrls.filter(url => {
                        const urlDate = new Date(url.createdAt);
                        const now = new Date();
                        return urlDate.getMonth() === now.getMonth() && urlDate.getFullYear() === now.getFullYear();
                      }).length
                    : urls.filter(url => {
                        const urlDate = new Date(url.createdAt);
                        const now = new Date();
                        return urlDate.getMonth() === now.getMonth() && urlDate.getFullYear() === now.getFullYear();
                      }).length
                  }
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Link Increment in Jul 2025</p>
                  <p className="text-2xl font-bold text-gray-900">16</p>
                  <p className="text-xs text-red-600">less than in Jun 2025</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          )}

          {/* Show URL breakdown for all users */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin-Assigned URLs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {urls.filter(url => url.isAdminCreated).length}
                </p>
                <p className="text-xs text-blue-600">Default URLs</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        {user.earnings && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Earnings</h2>
              <a 
                href="/platform-clicks" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Platform Clicks →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Total Earnings</p>
                    <p className="text-xl font-bold text-green-900">
                      {user.earnings.totalEarnings} {user.earnings.currency}
                    </p>
                  </div>
                </div>
              </div>
              
              {user.earnings.breakdown && user.earnings.breakdown.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MousePointer className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Total Clicks</p>
                      <p className="text-xl font-bold text-blue-900">
                        {user.earnings.breakdown.reduce((sum, item) => sum + item.clicks, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-800">Reward Milestones</p>
                    <p className="text-xl font-bold text-purple-900">
                      {user.earnings.breakdown ? user.earnings.breakdown.length : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {user.earnings.breakdown && user.earnings.breakdown.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Earnings Breakdown</h3>
                <div className="space-y-2">
                  {user.earnings.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {item.clicks} clicks
                      </span>
                      <span className="font-medium text-green-600">
                        {item.amount} {item.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL Creation Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Short URL</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  {createdUrl ? 'Shortened URL' : 'Long URL'}
                </label>
                <div className="relative">
                  <input
                    {...register('originalUrl', {
                      required: 'URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://',
                      },
                    })}
                    type="url"
                    id="originalUrl"
                    placeholder={createdUrl ? "Shortened URL will appear here" : "https://example.com/very-long-url"}
                    className={`w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      createdUrl ? 'bg-green-50 border-green-300' : ''
                    }`}
                    readOnly={!!createdUrl}
                  />
                  {createdUrl && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdUrl, 'input')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied === 'input' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
                {errors.originalUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.originalUrl.message}</p>
                )}
                {createdUrl && (
                  <>
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">✓ URL shortened successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Shortened URL: <span className="font-mono">{createdUrl}</span>

                    </p>
                  </div>
                  <div className="mt-2 p-3 bg-green-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-green-700 mt-1">
                     <span className="font-mono">{"fashionstore.mom/" + shortCode}</span>

                  </p>
                </div></>
                )}
              </div>

              <div>
                <label htmlFor="customShortCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Short Code (Optional)
                </label>
                <input
                  {...register('customShortCode', {
                    setValueAs: (value) => value === '' ? undefined : value,
                    validate: (value) => {
                      if (!value) return true;
                      if (value.length < 3) return 'Short code must be at least 3 characters';
                      if (value.length > 10) return 'Short code must be at most 10 characters';
                      if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Short code can only contain letters, numbers, hyphens, and underscores';
                      return true;
                    },
                  })}
                  type="text"
                  id="customShortCode"
                  placeholder="my-custom-link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.customShortCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.customShortCode.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Short URL'}</span>
            </button>
            
            {createdUrl && (
              <button
                type="button"
                onClick={() => {
                  setCreatedUrl(null)
                  reset()
                }}
                className="flex items-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Another</span>
              </button>
            )}
          </form>
        </div>

        {/* Team Management Card for Admins */}
        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h2>
                <p className="text-gray-600">Manage your team members and their roles</p>
              </div>
              <button
                onClick={() => router.push('/team-members')}
                className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Manage Team</span>
              </button>
            </div>
          </div>
        )}

        {/* Team URL Creation Card for Admins */}
        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Create Team URLs</h2>
                <p className="text-gray-600">Create URLs for your team members</p>
              </div>
              <button
                onClick={() => router.push('/team-urls')}
                className="flex items-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                <Link className="h-4 w-4" />
                <span>Create Team URL</span>
              </button>
            </div>
          </div>
        )}

        {/* Rewards Management Card for Admins */}
        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Rewards System</h2>
                <p className="text-gray-600">Configure click-based rewards for your team members</p>
              </div>
              <button
                onClick={() => router.push('/rewards')}
                className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <span>Configure Rewards</span>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('my-urls')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-urls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My URLs ({urls.length})
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('team-urls')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'team-urls'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Team URLs ({teamUrls.length})
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'my-urls' && (
              <div className="space-y-4">
                {urls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No URLs created yet. Create your first short URL above!</p>
                ) : (
                  urls.map((url) => (
                    <UrlCard key={url.id} shortCode={shortCode} url={url} onCopy={copyToClipboard} copied={copied} />

                  ))
                )}
              </div>
            )}

            {user.role === 'admin' && activeTab === 'team-urls' && (
              <div className="space-y-4">
                {teamUrls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No team URLs found.</p>
                ) : (
                  teamUrls.map((url) => (
                    <UrlCard key={url.id} url={url} onCopy={copyToClipboard} copied={copied} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UrlCard({ url, onCopy, copied, shortCode }:   { url: UrlData; onCopy: (text: string, id: string) => void; copied: string | null, shortCode: string | null }) {
  return (
    <div className={`rounded-lg p-4 ${url.isAdminCreated ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">{url.shortUrl}</span>
           
            {url.isAdminCreated && (
              <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                <Shield className="h-3 w-3" />
                <span>Admin Created</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{url.originalUrl}</p>
          {url.title && <p className="text-sm font-medium text-gray-800 mt-1">{url.title}</p>}
          {url.description && <p className="text-sm text-gray-600">{url.description}</p>}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>{url.clicks} clicks</span>
            </div>
            {url.user && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{url.user.firstName} {url.user.lastName}</span>
              </div>
            )}
            {url.createdByAdmin && (
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>By {url.createdByAdmin.firstName} {url.createdByAdmin.lastName}</span>
              </div>
            )}
            <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCopy(url.shortUrl, url.id)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy URL"
          >
            {copied === url.id ? (
              <span className="text-green-600">✓</span>
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Open URL"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
} 