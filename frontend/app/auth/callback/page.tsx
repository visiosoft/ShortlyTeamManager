'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const user = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      router.push('/login?error=google_auth_failed')
      return
    }

    if (token && user) {
      try {
        // Store token and user data
        localStorage.setItem('token', token)
        localStorage.setItem('user', user)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error storing auth data:', error)
        router.push('/login?error=storage_failed')
      }
    } else {
      router.push('/login?error=missing_data')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Authenticating...</h1>
        <p className="text-xl text-gray-600 mb-8">Please wait while we complete your sign-in</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Redirecting to dashboard...</p>
      </div>
    </div>
  )
} 