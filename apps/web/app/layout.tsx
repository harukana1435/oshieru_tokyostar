import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '推しエール口座',
  description: '健康的に推し活を続けるための口座管理アプリ',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#ff6b9d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
} 