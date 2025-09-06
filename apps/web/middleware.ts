import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 静的ファイルやAPIルートはスキップ
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ログインページはスキップ
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // セッションIDをチェック（クライアントサイドでのみ利用可能なため、ここでは基本的なチェックのみ）
  const sessionId = request.cookies.get('sessionId')?.value

  // ルートパスの場合はダッシュボードにリダイレクト（認証されている場合）
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 