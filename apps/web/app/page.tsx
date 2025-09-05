import { Suspense } from 'react'
import { Dashboard } from '@/components/dashboard'
import { LoginForm } from '@/components/login-form'
import { Loading } from '@/components/ui/loading'

export default function Home() {
  return (
    <main className="container mx-auto py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold oshi-gradient bg-clip-text text-transparent mb-2">
          推しエール口座
        </h1>
        <p className="text-muted-foreground">
          健康的に推し活を続けるための口座管理
        </p>
      </div>
      
      <Suspense fallback={<Loading />}>
        <AuthWrapper />
      </Suspense>
    </main>
  )
}

function AuthWrapper() {
  // 簡易的な認証状態管理（本来はコンテキストやstate管理ライブラリを使用）
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
  
  if (!sessionId) {
    return <LoginForm />
  }
  
  return <Dashboard />
} 