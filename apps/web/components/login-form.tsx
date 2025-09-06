'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatCurrency } from '@/lib/utils'

interface DemoUser {
  id: string
  email: string
  displayName: string
  lifeBalance: number
  oshiBalance: number
  totalBalance: number
}

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const router = useRouter()

  // デモユーザーデータを取得
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
        const response = await fetch(`${apiUrl}/users/demo`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setDemoUsers(data.users)
          }
        }
      } catch (error) {
        console.error('Failed to fetch demo users:', error)
        // フォールバック：静的データを使用
        setDemoUsers([
          {
            id: 'user_10000001',
            email: 'customer1@oshieru.com',
            displayName: '顧客1',
            lifeBalance: 380000,
            oshiBalance: 0,
            totalBalance: 380000
          },
          {
            id: 'user_10000002',
            email: 'customer2@oshieru.com',
            displayName: '顧客2',
            lifeBalance: 250000,
            oshiBalance: 50000,
            totalBalance: 300000
          },
          {
            id: 'user_10000003',
            email: 'customer3@oshieru.com',
            displayName: '顧客3',
            lifeBalance: 150000,
            oshiBalance: 80000,
            totalBalance: 230000
          }
        ])
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchDemoUsers()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        localStorage.setItem('userEmail', email)
        localStorage.setItem('sessionId', data.sessionId)
        
        console.log('Login successful:', data.user)
        
        if (onLoginSuccess) {
          onLoginSuccess()
        }
        router.push('/dashboard')
      } else {
        console.error('Login failed:', data.message)
        alert('ログインに失敗しました。メールアドレスを確認してください。')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('ネットワークエラーが発生しました。しばらく経ってからお試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (customerEmail: string) => {
    console.log('Demo login attempt for:', customerEmail)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const response = await fetch(`${apiUrl}/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customerEmail }),
      })

      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        localStorage.setItem('userEmail', customerEmail)
        localStorage.setItem('sessionId', data.sessionId)
        
        console.log('Demo login successful:', data.user)
        
        if (onLoginSuccess) {
          onLoginSuccess()
        }
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Demo login failed:', error)
      
      // エラー時のフォールバック
      const fallbackUser = demoUsers.find(user => user.email === customerEmail)
      if (fallbackUser) {
        localStorage.setItem('currentUser', JSON.stringify(fallbackUser))
        localStorage.setItem('userEmail', customerEmail)
        localStorage.setItem('sessionId', `demo-session-${Date.now()}`)
        
        console.log('Demo login successful with error fallback:', fallbackUser)
        
        if (onLoginSuccess) {
          onLoginSuccess()
        }
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md card-accent">
        <CardHeader className="text-center">
          <CardTitle className="heading-2">ログイン</CardTitle>
          <CardDescription className="body-medium">
            推しエール口座にアクセスするためにメールアドレスを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block body-small font-medium mb-2 text-neutral-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your-email@example.com"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? '処理中...' : 'ログイン'}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-primary-200">
            <p className="body-small font-medium mb-3 text-neutral-700">デモアカウント</p>
            <div className="space-y-2">
              {loadingUsers ? (
                <div className="text-center py-4">
                  <p className="body-small text-neutral-500">
                    残高情報を読み込み中...
                  </p>
                </div>
              ) : (
                demoUsers.map((user, index) => (
                  <Button
                    key={user.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDemoLogin(user.email)
                    }}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-3"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-neutral-800">
                        {user.displayName}
                      </span>
                      <span className="caption text-neutral-500">
                        総残高: {formatCurrency(user.totalBalance)} 
                        {user.lifeBalance > 0 && user.oshiBalance > 0 && (
                          <span className="ml-1">
                            (生活: {formatCurrency(user.lifeBalance)}, 推し活: {formatCurrency(user.oshiBalance)})
                          </span>
                        )}
                      </span>
                    </div>
                  </Button>
                ))
              )}
            </div>
            <p className="caption text-neutral-400 text-center mt-3">
              実際のデータベースから取得した顧客データを体験できます
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 