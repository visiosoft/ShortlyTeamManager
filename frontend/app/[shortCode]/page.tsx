'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PageProps {
  params: {
    shortCode: string
  }
}

export default function ShortUrlRedirect({ params }: PageProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Get shortCode from params or extract from pathname as fallback
  const shortCode = params?.shortCode || (pathname && pathname.startsWith('/') ? pathname.slice(1) : pathname)

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      // Quick validation - no API calls for invalid shortCodess
      if (!shortCode || shortCode === '' || shortCode.length < 3 || shortCode.length > 20) {
        router.push('/not-found')
        return
      }

      // Validate shortCode format (alphanumeric, hyphens, underscores only)
      if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
        router.push('/not-found')
        return
      }

      try {
        // Use environment variable with fallback to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'
        const response = await fetch(`${apiUrl}/api/urls/info/${shortCode}`)
        
        if (response.ok) {
          const data = await response.json()
          // Immediate redirect - no loading, no UI
          window.location.href = data.originalUrl
        } else {
          router.push('/not-found')
        }
      } catch (error) {
        router.push('/not-found')
      }
    }

    redirectToOriginalUrl()
  }, [shortCode, router, params, pathname])

  // Return null - no UI at all
  return null
} 