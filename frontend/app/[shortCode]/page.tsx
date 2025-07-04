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
        // Use environment variable with fallback to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'
        
        // First, get URL info
        const infoResponse = await fetch(`${apiUrl}/api/urls/info/${shortCode}`, {
          signal: abortController.current?.signal
        })
        
        if (infoResponse.ok) {
          const data = await infoResponse.json()
          
          // Then increment clicks (fire and forget - don't wait for response)
          fetch(`${apiUrl}/api/urls/increment/${shortCode}`, {
            method: 'POST',
            signal: abortController.current?.signal
          }).catch(() => {
            // Ignore errors for increment - don't block redirect
          })
          
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