'use client'

import React, { Suspense, useState, useEffect } from 'react'
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドでのみ実行
    const checkAuth = () => {
      const sessionId = localStorage.getItem('sessionId');
      setIsAuthenticated(!!sessionId);
      setIsLoading(false);
    };

    checkAuth();

    // ストレージの変更を監視
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return <Loading />
  }
  
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
  }
  
  return <Dashboard onLogout={() => setIsAuthenticated(false)} />
} 