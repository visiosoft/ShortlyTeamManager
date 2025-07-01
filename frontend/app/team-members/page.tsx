'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Plus, Users, LogOut, Trash2, UserPlus } from 'lucide-react'
import axios from 'axios'

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

interface TeamMember {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  lastLoginAt?: string
}

interface CreateTeamMemberData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'user'
}

interface UrlData {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  title?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function TeamMembers() {
  const [user, setUser] = useState<UserData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [memberUrls, setMemberUrls] = useState<Record<string, UrlData[]>>({})
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UrlData>>({})
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamMemberData>()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Only allow admins to access this page
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchTeamMembers()
  }, [router])

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/users/team-members`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setTeamMembers(response.data)
      if (response.data.length > 0) {
        response.data.forEach((member: TeamMember) => fetchMemberUrls(member._id))
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const fetchMemberUrls = async (userId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/urls/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMemberUrls(prev => ({ ...prev, [userId]: response.data.urls || [] }))
    } catch (error) {
      setMemberUrls(prev => ({ ...prev, [userId]: [] }))
    }
  }

  const onSubmit = async (data: CreateTeamMemberData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/auth/team-member`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      // Add new member to the list
      setTeamMembers(prev => [...prev, response.data])
      setShowCreateForm(false)
      reset()
    } catch (error: any) {
      console.error('Error creating team member:', error)
      alert(error.response?.data?.message || 'Error creating team member')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleEditClick = (url: UrlData) => {
    setEditingUrlId(url.id)
    setEditForm({ ...url })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSave = async (userId: string, urlId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/urls/${urlId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditingUrlId(null)
      fetchMemberUrls(userId)
    } catch (error) {
      alert('Failed to update URL')
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Description */}
      <div className="mb-8">
        <p className="text-gray-600">Manage your team members and their roles</p>
        <div className="text-sm text-gray-600 mt-2">
          Team: {user.team?.name || 'Loading...'}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Team Members Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <p className="text-gray-600">Manage your team members and their roles</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Create Team Member Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team Member</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    type="text"
                    id="firstName"
                    placeholder="John"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  id="role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{loading ? 'Creating...' : 'Create Member'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    reset()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current Team Members ({teamMembers.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {teamMembers.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No team members found. Add your first team member above.</p>
              </div>
            ) : (
              teamMembers.map((member: TeamMember) => (
                <div key={member._id} className="px-6 py-4 flex flex-col border-b">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      {member.lastLoginAt && (
                        <p className="text-xs text-gray-400">
                          Last login: {new Date(member.lastLoginAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 ml-12">
                    <h5 className="text-xs text-gray-500 mb-1">Assigned URLs:</h5>
                    {memberUrls[member._id] && memberUrls[member._id].length > 0 ? (
                      <ul className="space-y-2">
                        {memberUrls[member._id].map(url => (
                          <li key={url.id} className="bg-gray-50 rounded p-2 flex items-center justify-between">
                            {editingUrlId === url.id ? (
                              <div className="flex flex-col w-full">
                                <input
                                  name="originalUrl"
                                  value={editForm.originalUrl || ''}
                                  onChange={handleEditChange}
                                  className="mb-1 px-2 py-1 border rounded"
                                />
                                <input
                                  name="title"
                                  value={editForm.title || ''}
                                  onChange={handleEditChange}
                                  className="mb-1 px-2 py-1 border rounded"
                                  placeholder="Title"
                                />
                                <textarea
                                  name="description"
                                  value={editForm.description || ''}
                                  onChange={handleEditChange}
                                  className="mb-1 px-2 py-1 border rounded"
                                  placeholder="Description"
                                />
                                <div className="flex space-x-2">
                                  <button onClick={() => handleEditSave(member._id, url.id)} className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                                  <button onClick={() => setEditingUrlId(null)} className="bg-gray-300 px-2 py-1 rounded">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <span className="font-mono text-xs text-blue-700">{url.shortUrl}</span>
                                <span className="ml-2 text-xs text-gray-700">{url.title}</span>
                                <span className="ml-2 text-xs text-gray-500">{url.description}</span>
                              </div>
                            )}
                            {editingUrlId !== url.id && (
                              <button onClick={() => handleEditClick(url)} className="ml-2 text-blue-600 hover:underline text-xs">Edit</button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-gray-400">No URLs assigned.</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 