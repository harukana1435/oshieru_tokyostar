'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      // デモ用の簡易ログイン
      const sessionId = 'demo-session-' + Date.now()
      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userEmail', email)
      
      // ページをリロードしてAuthWrapperを再評価
      window.location.reload()
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@oshieru.com')
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
            <Button
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full"
            >
              デモアカウントでログイン
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              demo@oshieru.com でサンプルデータを体験できます
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 