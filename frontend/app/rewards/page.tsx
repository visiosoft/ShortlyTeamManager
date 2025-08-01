'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react'
import apiClient from '@/lib/axios'
import { api } from '@/lib/api'

interface RewardTier {
  clicks: number
  amount: number
  currency: string
}

interface FormData {
  rewards: RewardTier[]
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
    rewards?: RewardTier[]
  }
}

export default function RewardsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isTimeout, setIsTimeout] = useState(false)
  const router = useRouter()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      rewards: [{ clicks: 1000, amount: 350, currency: 'PKR' }]
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const userObj = JSON.parse(userData)
    console.log('User from localStorage:', userObj)
    
    if (userObj.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUser(userObj)
    fetchTeamRewards()

    // Set timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      setIsTimeout(true)
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [router])

  const getTeamIdFromToken = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.teamId
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  const fetchTeamRewards = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No authentication token found. Please login again.')
        router.push('/login')
        return
      }

      const response = await apiClient.get(api.teams.myTeam)
      
      console.log('Team data received:', response.data)
      
      // Get team ID from token as fallback
      const teamIdFromToken = getTeamIdFromToken(token)
      
      // Update user state with team data including ID
      setUser(prev => {
        if (!prev) return null
        const updatedUser = {
          ...prev,
          team: {
            ...prev.team,
            id: response.data._id || response.data.id || teamIdFromToken,
            name: response.data.name,
            description: response.data.description,
            rewards: response.data.rewards || []
          }
        }
        console.log('Updated user:', updatedUser)
        return updatedUser
      })
      
      if (response.data.rewards && response.data.rewards.length > 0) {
        reset({ rewards: response.data.rewards })
      }
    } catch (error) {
      console.error('Error fetching team rewards:', error)
      // Show error to user
      alert('Error loading team data. Please try again.')
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!user?.team?.id) {
      alert('Team ID not found. Please refresh the page and try again.')
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const processedData = {
        rewards: [{
          clicks: Number(data.rewards[0].clicks),
          amount: Number(data.rewards[0].amount),
          currency: data.rewards[0].currency
        }]
      }
      await apiClient.post(api.teams.rewards(user.team.id), processedData)
      alert('Rewards updated successfully!')
    } catch (error: any) {
      console.error('Error updating rewards:', error)
      alert(error.response?.data?.message || 'Error updating rewards')
    } finally {
      setSaving(false)
    }
  }

  if (!user || !user.team?.id) {
    console.log('Loading condition - user:', user)
    console.log('Loading condition - user.team:', user?.team)
    console.log('Loading condition - user.team?.id:', user?.team?.id)
    
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isTimeout ? 'Loading took too long' : 'Loading team data...'}
        </p>
        {user && !user.team?.id && (
          <p className="text-sm text-red-600 mt-2">Team ID not found. Please check console for details.</p>
        )}
        {isTimeout && (
          <button
            onClick={() => {
              setIsTimeout(false)
              fetchTeamRewards()
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Description */}
      <div className="mb-8">
        <p className="text-gray-600">Configure click-based rewards for your team members</p>
        <div className="text-sm text-gray-600 mt-2">
          Team: {user.team?.name || 'Loading...'}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Configure Click-Based Rewards</h2>
            <p className="text-gray-600">
              Set up a single reward tier for your team members. <br />
              <span className="font-semibold">Users will earn the reward when they reach the specified click threshold.</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clicks Required
                    </label>
                    <input
                      {...register(`rewards.0.clicks` as const, {
                        required: 'Clicks required',
                        min: { value: 1, message: 'Must be at least 1' }
                      })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                    {errors.rewards?.[0]?.clicks && (
                      <p className="mt-1 text-sm text-red-600">{errors.rewards[0]?.clicks?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reward Amount
                    </label>
                    <input
                      {...register(`rewards.0.amount` as const, {
                        required: 'Amount required',
                        min: { value: 0, message: 'Must be at least 0' }
                      })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="350"
                    />
                    {errors.rewards?.[0]?.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.rewards[0]?.amount?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      {...register(`rewards.0.currency` as const, {
                        required: 'Currency required'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    {errors.rewards?.[0]?.currency && (
                      <p className="mt-1 text-sm text-red-600">{errors.rewards[0]?.currency?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Rewards'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 