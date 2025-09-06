'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet'
import { Menu, Home, LogOut, CreditCard, BarChart3, Gift, ArrowLeftRight } from 'lucide-react'

interface NavigationMenuProps {
  currentUser: any
  onLogout: () => void
  currentPage?: string
}

export function NavigationMenu({ currentUser, onLogout, currentPage }: NavigationMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  const menuItems = [
    { icon: Home, label: 'ダッシュボード', path: '/dashboard' },
    { icon: ArrowLeftRight, label: '取引管理', path: '/transactions' },
    { icon: BarChart3, label: 'スコア分析', path: '/analysis' },
    { icon: Gift, label: '特典', path: '/rewards' },
  ]

  const MenuContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? 'flex flex-col h-full min-h-0' : ''}`}>
      {/* ユーザー情報 */}
      <div className={`${isMobile ? 'mb-4' : 'mb-8'} p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex-shrink-0`}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {currentUser?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{currentUser?.displayName}</p>
            <p className="text-sm text-gray-600 break-words leading-tight">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* メニューアイテム */}
      <nav className={`${isMobile ? 'flex-1 min-h-0 overflow-y-auto' : ''} space-y-2`}>
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              router.push(item.path)
              if (isMobile) setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path || pathname.startsWith(item.path + '/')
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ログアウトボタン */}
      <div className={`${isMobile ? 'mt-4 pt-4' : 'mt-auto pt-4'} border-t border-gray-200 flex-shrink-0`}>
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          ログアウト
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* モバイルメニューボタン */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-lg">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 flex flex-col">
            <SheetHeader className="p-6 pb-4 flex-shrink-0">
              <SheetTitle className="text-left">推しエール口座</SheetTitle>
            </SheetHeader>
            <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
              <MenuContent isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* デスクトップサイドバー */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              推しエール口座
            </h1>
            <p className="text-sm text-gray-600 mt-1">健康的に推し活を続けるための口座管理</p>
          </div>
          <MenuContent />
        </div>
      </div>
    </>
  )
} 


