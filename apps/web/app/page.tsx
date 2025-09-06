'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/loading'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // ルートページにアクセスした場合、適切なページにリダイレクト
    const sessionId = localStorage.getItem('sessionId')
    
    if (sessionId) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <Loading />
    </main>
  )
} 