'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PageProps {
  params: {
    shortCode: string
  }
}

export default function ShortUrlRedirect({ params }: PageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  // Get shortCode from params or extract from pathname as fallback
  const shortCode = params?.shortCode || (pathname && pathname.startsWith('/') ? pathname.slice(1) : pathname)

  useEffect(() => {
    debugger;
    const redirectToOriginalUrl = async () => {
      try {
        console.log('🔗 Processing short code:', shortCode)
        console.log('🔗 Params:', params)
        console.log('🔗 Pathname:', pathname)
        
        if (!shortCode || shortCode === '') {
          console.log('❌ No short code found')
          router.push('/not-found')
          return
        }
        debugger;
        // Call the backend API to get the original URL
        const apiUrl = `http://localhost:3009/api/urls/info/${shortCode}`
        console.log('🌐 Calling API:', apiUrl)
        
        const response = await fetch(apiUrl)
        
        console.log('📡 Response status:', response.status)
        console.log('📡 Response ok:', response.ok)
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const data = await response.json()
          console.log('📄 Response data:', data)
          console.log('✅ Redirecting to:', data.originalUrl)
          window.location.href = data.originalUrl
        } else {
          const errorText = await response.text()
          console.log('❌ Error response:', errorText)
          console.log('❌ URL not found')
          router.push('/not-found')
        }
      } catch (error) {
        console.error('❌ Error:', error)
        router.push('/not-found')
      }
    }

    redirectToOriginalUrl()
  }, [shortCode, router, params, pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
        <p className="text-sm text-gray-400 mt-2">Short code: {shortCode || 'Loading...'}</p>
      </div>
    </div>
  )
} 