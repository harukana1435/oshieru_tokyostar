'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { NavigationMenu } from '@/components/navigation-menu'
import { Loading } from '@/components/ui/loading'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const sessionId = localStorage.getItem('sessionId')
      const currentUser = localStorage.getItem('currentUser')
      
      if (!sessionId || !currentUser) {
        router.push('/login')
        return
      }

      try {
        setCurrentUser(JSON.parse(currentUser))
      } catch (error) {
        console.error('Failed to parse current user:', error)
        router.push('/login')
        return
      }
      
      setIsLoading(false)
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
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('currentUser')
    router.push('/login')
  }

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <NavigationMenu 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="lg:ml-72">
          <div className="p-4 sm:p-6">
            <div className="pt-16 lg:pt-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 