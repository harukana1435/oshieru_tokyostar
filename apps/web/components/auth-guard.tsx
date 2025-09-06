'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from './ui/loading'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const sessionId = localStorage.getItem('sessionId')
      const authenticated = !!sessionId
      setIsAuthenticated(authenticated)
      setIsLoading(false)

      if (requireAuth && !authenticated) {
        router.push('/login')
      } else if (!requireAuth && authenticated) {
        router.push('/dashboard')
      }
    }

    checkAuth()

    // ストレージの変更を監視
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [requireAuth, router])

  if (isLoading) {
    return <Loading />
  }

  // 認証が必要なページで未認証の場合、またはその逆の場合は何も表示しない
  if (requireAuth && !isAuthenticated) {
    return <Loading />
  }

  if (!requireAuth && isAuthenticated) {
    return <Loading />
  }

  return <>{children}</>
} 