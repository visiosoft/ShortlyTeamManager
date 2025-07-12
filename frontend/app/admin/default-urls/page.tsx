'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Plus, Trash2, RefreshCw, Settings } from 'lucide-react'
import apiClient from '@/lib/axios'
import { api } from '@/lib/api'

interface DefaultUrl {
  id: string
  shortCode: string
  originalUrl: string
  createdAt: string
  createdByAdmin: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface CreateDefaultUrlForm {
  originalUrl: string
}

export default function AdminDefaultUrlsPage() {
  const [defaultUrls, setDefaultUrls] = useState<DefaultUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDefaultUrlForm>()

  useEffect(() => {
    loadDefaultUrls()
  }, [])

  const loadDefaultUrls = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Loading default URLs...')
      
      const response = await apiClient.get(api.urls.default)
      console.log('Default URLs response:', response.data)

      setDefaultUrls(response.data)
    } catch (error: any) {
      console.error('Error loading default URLs:', error)
      setError('Failed to load default URLs: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDefaultUrl = async (data: CreateDefaultUrlForm) => {
    setCreating(true)
    setError('')
    setSuccess('')

    try {
      console.log('Creating default URL:', data)
      
      const response = await apiClient.post(api.urls.default, data)
      console.log('Create default URL response:', response.data)

      setSuccess('Default URL created successfully!')
      setShowCreateModal(false)
      reset()
      
      // Reload data
      await loadDefaultUrls()
    } catch (error: any) {
      console.error('Error creating default URL:', error)
      setError(error.response?.data?.message || 'Failed to create default URL')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteDefaultUrl = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this default URL? This will not affect existing users who already have this URL assigned.')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      
      await apiClient.delete(`/api/urls/${urlId}`)
      
      setSuccess('Default URL deleted successfully!')
      await loadDefaultUrls()
    } catch (error: any) {
      console.error('Error deleting default URL:', error)
      setError(error.response?.data?.message || 'Failed to delete default URL')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading default URLs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Default URL Management</h1>
          <p className="text-gray-600">Manage default URLs that are automatically assigned to new users</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Default URLs</p>
                <p className="text-2xl font-bold text-gray-900">{defaultUrls.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active URLs</p>
                <p className="text-2xl font-bold text-gray-900">{defaultUrls.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready to Add</p>
                <p className="text-2xl font-bold text-gray-900">∞</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Default URL
          </button>
        </div>

        {/* Default URLs List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Default URLs</h2>
            <p className="text-sm text-gray-600 mt-1">These URLs will be automatically assigned to new users</p>
          </div>

          {defaultUrls.length === 0 ? (
            <div className="p-8 text-center">
              <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No default URLs yet</h3>
              <p className="text-gray-600 mb-4">Create your first default URL to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add First URL
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {defaultUrls.map((url) => (
                    <tr key={url.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {url.shortCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {url.originalUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {url.createdByAdmin.firstName} {url.createdByAdmin.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{url.createdByAdmin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(url.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteDefaultUrl(url.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Default URL</h3>
              <form onSubmit={handleSubmit(handleCreateDefaultUrl)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original URL
                  </label>
                  <input
                    type="url"
                    {...register('originalUrl', { 
                      required: 'URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                  {errors.originalUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.originalUrl.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      reset()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create URL'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 