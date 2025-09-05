'use client'

import React, { useState, useEffect } from 'react'
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
            lifeBalance: 1399999,
            oshiBalance: 0,
            totalBalance: 1399999
          },
          {
            id: 'user_10000003',
            email: 'customer3@oshieru.com', 
            displayName: '顧客3',
            lifeBalance: 230,
            oshiBalance: 0,
            totalBalance: 230
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
    if (!email) return

    setIsLoading(true)
    try {
      // デモ用の簡易ログイン
      const sessionId = 'demo-session-' + Date.now()
      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userEmail', email)
      
      // コールバックを呼び出してページリロードを避ける
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        // フォールバック：ページをリロード
        window.location.reload()
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (customerEmail: string) => {
    // 前のセッション情報をクリア
    localStorage.removeItem('sessionId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('currentUser')
    
    // 選択されたユーザー情報を保存
    const selectedUser = demoUsers.find(user => user.email === customerEmail)
    if (selectedUser) {
      localStorage.setItem('currentUser', JSON.stringify(selectedUser))
    }
    
    setEmail(customerEmail)
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      form?.requestSubmit()
    }, 100)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            推しエール口座にアクセスするためにメールアドレスを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="your-email@example.com"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              variant="oshi"
              disabled={isLoading || !email}
            >
              {isLoading ? '処理中...' : 'ログイン'}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">デモアカウント</p>
            <div className="space-y-2">
              {loadingUsers ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    残高情報を読み込み中...
                  </p>
                </div>
              ) : (
                demoUsers.map((user, index) => (
                  <Button
                    key={user.id}
                    onClick={() => handleDemoLogin(user.email)}
                    variant="outline"
                    className="w-full text-left justify-start"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {user.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground text-center mt-2">
              実際のデータベースから取得した顧客データを体験できます
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 