'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Link, Copy, ExternalLink, BarChart3, Users, LogOut, Plus } from 'lucide-react'
import axios from 'axios'

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

    setUser(JSON.parse(userData))
    fetchUrls()
    fetchTeamUrls()
  }, [router])

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/urls/my-urls`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setUrls(response.data.urls)
    } catch (error) {
      console.error('Error fetching URLs:', error)
    }
  }

  const fetchTeamUrls = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/urls/team-urls`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setTeamUrls(response.data.urls)
    } catch (error) {
      console.error('Error fetching team URLs:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/urls`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setUrls(prev => [response.data, ...prev])
      setCreatedUrl(response.data.shortUrl)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
              <div className="text-sm text-gray-600">
                Team: {user.team.name}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </span>
              {user.role === 'admin' && (
                <button
                  onClick={() => router.push('/team-members')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Users className="h-4 w-4" />
                  <span>Team Management</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <p className="mt-1 text-sm text-green-600">✓ URL shortened successfully!</p>
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
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'my-urls' && (
              <div className="space-y-4">
                {urls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No URLs created yet. Create your first short URL above!</p>
                ) : (
                  urls.map((url) => (
                    <UrlCard key={url.id} url={url} onCopy={copyToClipboard} copied={copied} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'team-urls' && (
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

function UrlCard({ url, onCopy, copied }: { url: UrlData; onCopy: (text: string, id: string) => void; copied: string | null }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">{url.shortUrl}</span>
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