'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: {
    shortCode: string
  }
}

export default function ShortUrlRedirect({ params }: PageProps) {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const abortController = useRef<AbortController | null>(null)

  // Get shortCode from params
  const shortCode = params?.shortCode

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return
    }

    // Create abort controller for this effect
    abortController.current = new AbortController()

    const redirectToOriginalUrl = async () => {
      // Quick validation - no API calls for invalid shortCodes
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
        debugger;
        // Use environment variable with fallback to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'
        const response = await fetch(`${apiUrl}/api/urls/info/${shortCode}`, {
          signal: abortController.current?.signal
        })
        
        if (response.ok) {
          const data = await response.json()
          hasRedirected.current = true
          // Immediate redirect - no loading, no UI
          window.location.href = data.originalUrl
        } else {
          router.push('/not-found')
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was aborted, don't redirect
          return
        }
        router.push('/not-found')
      }
    }

    redirectToOriginalUrl()

    // Cleanup function to abort any pending requests
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [shortCode, router])

  // Return null - no UI at all
  return null
} 