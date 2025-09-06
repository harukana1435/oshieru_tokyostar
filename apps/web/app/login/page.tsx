import { AuthGuard } from '@/components/auth-guard'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <main className="page-container py-6">
        <LoginForm />
      </main>
    </AuthGuard>
  )
} 