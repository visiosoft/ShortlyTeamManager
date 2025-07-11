'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import axios from 'axios'
import { ArrowRight } from 'lucide-react'

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  teamName?: string
  teamDescription?: string
  referralCode?: string
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const refParam = searchParams.get('ref')
    
    if (errorParam) {
      switch (errorParam) {
        case 'google_auth_failed':
          setError('Google authentication failed. Please try again.')
          break
        case 'storage_failed':
          setError('Failed to store authentication data. Please try again.')
          break
        case 'missing_data':
          setError('Authentication data is missing. Please try again.')
          break
        default:
          setError('An error occurred during authentication.')
      }
    }
    
    if (refParam) {
      setReferralCode(refParam)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>()

  const onSubmit = async (data: RegisterData) => {
    setLoading(true)
    setError('')
    
    try {
      let response;
      
      if (referralCode) {
        // Registration with referral - user joins existing team
        const registrationData = {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          referralCode: referralCode
        }
        
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/auth/register-with-referral`,
          registrationData
        )
      } else {
        // Regular registration - user creates new team
        const registrationData = {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          teamName: data.teamName,
          teamDescription: data.teamDescription
        }
        
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/auth/register`,
          registrationData
        )
      }
      
      // Store token and user data
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'
    window.location.href = `${apiUrl}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Earn Reward
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white/90 hover:text-white transition-colors duration-200">Home</Link>
            <Link href="/blog" className="text-white/90 hover:text-white transition-colors duration-200">Blog</Link>
            <Link href="/login" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Card */}
      <div className="flex items-center justify-center min-h-[80vh] py-12 px-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Start your team and create short URLs</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  id="firstName"
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {!referralCode && (
              <>
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    {...register('teamName', { required: !referralCode ? 'Team name is required' : false })}
                    type="text"
                    id="teamName"
                    placeholder="My Awesome Team"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.teamName && (
                    <p className="mt-1 text-sm text-red-600">{errors.teamName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Team Description (Optional)
                  </label>
                  <textarea
                    {...register('teamDescription')}
                    id="teamDescription"
                    placeholder="Describe your team's purpose..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {referralCode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Referral Code Applied:</strong> {referralCode}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  You'll join the referring team and receive 1000 PKR bonus upon successful registration!
                </p>
              </div>
            )}

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Have a referral code? Enter it to join the team and get 1000 PKR bonus!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 