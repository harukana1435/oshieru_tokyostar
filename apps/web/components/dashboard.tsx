'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, getScoreColor } from '@/lib/utils'
import { AccountDetailsModal } from './account-details-modal'
import { TransactionEditModal } from './transaction-edit-modal'
import { PendingTransactionsPage } from './pending-transactions-page'
import { SwipeTransactionPage } from './swipe-transaction-page'
import { TransactionHistoryPage } from './transaction-history-page'
import { NavigationMenu } from './navigation-menu'
import { ArrowUpDown, Eye, EyeOff, Clipboard, CreditCard, SortAsc, SortDesc, Wallet, TrendingUp, TrendingDown, DollarSign, PiggyBank, Heart, Shield, ShieldCheck, ShieldAlert, ShieldX, Target, Zap, Award, AlertTriangle, ArrowRightLeft, CheckCircle, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

// 実際のダミーデータを使用（デモ用）
const mockDashboardData = {
  user: {
    id: 'user_10000001',
    email: 'customer1@oshieru.com',
    displayName: '顧客1',
    createdAt: new Date('2024-01-01'),
  },
  accounts: [
    {
      id: 'acc_life_10000001',
      userId: 'user_10000001',
      kind: 'life',
      name: '生活口座',
      balanceCached: 380000,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'acc_oshi_10000001',
      userId: 'user_10000001',
      kind: 'oshi',
      name: '推し活口座',
      balanceCached: 0,
      createdAt: new Date('2024-01-01'),
    },
  ],
  latestScore: {
    id: 'score_1',
    userId: 'user_10000001',
    score: 65,
    label: '安心',
    snapshotAt: new Date('2024-07-31'),
    factors: {
      incomeRatioScore: 30,
      surplusScore: 25,
      recommendedAmountScore: 10,
      incomeRatio: 15.0,
      surplusRatio: 0.8,
      recommendedDeviation: 20.0,
    },
  },
  recentTransactions: [
    {
      id: 'tx_recent_1',
      accountId: 'acc_life_10000001',
      amount: 380000,
      sign: 'in' as const,
      purpose: 'salary',
      memo: '給与振込',
      originalDescription: '給与振込',
      isAutoCategorized: true,
      isPending: false,
      canEdit: true,
      eventAt: new Date('2024-06-25'),
      accountName: '生活口座',
      accountKind: 'life',
    },
    {
      id: 'tx_recent_2',
      accountId: 'acc_life_10000001',
      amount: 9000,
      sign: 'out' as const,
      purpose: 'other',
      memo: 'クレジットカード',
      originalDescription: 'クレジットカード',
      isAutoCategorized: false,
      isPending: true,
      canEdit: true,
      eventAt: new Date('2024-06-10'),
      accountName: '生活口座',
      accountKind: 'life',
    },
  ],
  availableRewards: [
    {
      id: 'reward_2',
      slug: 'exclusive-shop',
      title: '限定オンラインショップ',
      description: '推し活安心度スコア60点以上で利用可能。限定グッズを優先購入できます。',
      minScore: 60,
      active: true,
    },
    {
      id: 'reward_3',
      slug: 'storage-service',
      title: '荷物預かりサービス',
      description: '推し活安心度スコア40点以上で利用可能。イベント時の荷物を無料で預かります。',
      minScore: 40,
      active: true,
    },
  ],
}

interface DashboardProps {
  onLogout?: () => void;
}

type ViewMode = 'dashboard' | 'pending-transactions' | 'swipe-mode'

export function Dashboard({ onLogout }: DashboardProps) {
  const [data, setData] = useState(mockDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showRecentOnly, setShowRecentOnly] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [showScoreHelp, setShowScoreHelp] = useState(false)
  const [showScoreDetails, setShowScoreDetails] = useState(false)

  // ユーザー固有の取引データを生成
  const generateUserTransactions = (user: any) => {
    const baseTransactions = [
      {
        id: `tx_${user.id}_salary`,
        accountId: `acc_life_${user.id.split('_')[1]}`,
        amount: user.id.includes('10000001') ? 380000 : user.id.includes('10000002') ? 777777 : 150000,
        sign: 'in' as const,
        purpose: 'salary',
        memo: '給与振込',
        originalDescription: '給与振込',
        isAutoCategorized: true,
        isPending: false,
        canEdit: true,
        eventAt: new Date('2024-06-25'),
        accountName: '生活口座',
        accountKind: 'life',
      },
      {
        id: `tx_${user.id}_credit`,
        accountId: `acc_life_${user.id.split('_')[1]}`,
        amount: user.id.includes('10000001') ? 9000 : user.id.includes('10000002') ? 6000 : 3000,
        sign: 'out' as const,
        purpose: 'other',
        memo: 'クレジットカード',
        originalDescription: 'クレジットカード',
        isAutoCategorized: false,
        isPending: true,
        canEdit: true,
        eventAt: new Date('2024-06-10'),
        accountName: '生活口座',
        accountKind: 'life',
      }
    ]

    // 顧客3の場合は追加の小額取引を追加
    if (user.id.includes('10000003')) {
      baseTransactions.push({
        id: `tx_${user.id}_small1`,
        accountId: `acc_life_${user.id.split('_')[1]}`,
        amount: 2400,
        sign: 'in' as const,
        purpose: 'other',
        memo: '振込',
        originalDescription: '振込',
        isAutoCategorized: false,
        isPending: true,
        canEdit: true,
        eventAt: new Date('2024-06-03'),
        accountName: '生活口座',
        accountKind: 'life',
      })
    }

    return baseTransactions
  }

  // 実際のユーザーデータを取得
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // ローカルストレージからユーザー情報を取得
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setCurrentUser(user)
          
          // 実際のAPIからダッシュボードデータを取得
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
            const params = new URLSearchParams({
              sortBy,
              sortOrder
            })
            const dashboardResponse = await fetch(`${apiUrl}/dashboard?${params}`, {
              headers: { 
                'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
                'X-User-Email': user.email
              }
            })
            
            if (dashboardResponse.ok) {
              const dashboardData = await dashboardResponse.json()
              console.log('Dashboard data from API:', dashboardData)
              
              // APIからのデータを使用
              if (dashboardData.success) {
                console.log('Processing API data:', {
                  user: dashboardData.data.user,
                  accounts: dashboardData.data.accounts,
                  transactionCount: dashboardData.data.recentTransactions?.length
                })
                
                // APIデータの日付フィールドを変換
                const processedData = {
                  ...dashboardData.data,
                  user: {
                    ...dashboardData.data.user,
                    createdAt: new Date(dashboardData.data.user.createdAt)
                  },
                  accounts: dashboardData.data.accounts.map((acc: any) => ({
                    ...acc,
                    balanceCached: acc.balanceCached || 0, // NaN対策
                    createdAt: new Date(acc.createdAt)
                  })),
                  recentTransactions: dashboardData.data.recentTransactions.map((tx: any) => ({
                    ...tx,
                    amount: tx.amount || 0, // NaN対策
                    eventAt: new Date(tx.eventAt),
                    createdAt: new Date(tx.createdAt)
                  })),
                  latestScore: dashboardData.data.latestScore ? {
                    ...dashboardData.data.latestScore,
                    score: dashboardData.data.latestScore.score || 0, // NaN対策
                    snapshotAt: new Date(dashboardData.data.latestScore.snapshotAt)
                  } : null
                }
                
                console.log('Processed data:', {
                  user: processedData.user,
                  accounts: processedData.accounts,
                  transactionCount: processedData.recentTransactions?.length,
                  score: processedData.latestScore?.score
                })
                
                setData(processedData)
                console.log('Dashboard updated with API data for user:', processedData.user.displayName)
                setIsLoading(false)
                return
              }
            } else {
              console.log('API response not ok:', dashboardResponse.status, await dashboardResponse.text())
            }
          } catch (apiError) {
            console.log('API call failed, using mock data:', apiError)
          }
          
          // フォールバック: モックデータを使用
          const userTransactions = generateUserTransactions(user)
          
          setData(prevData => ({
            ...prevData,
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              createdAt: new Date('2024-01-01'),
            },
            accounts: [
              {
                id: `acc_life_${user.id.split('_')[1]}`,
                userId: user.id,
                kind: 'life',
                name: '生活口座',
                balanceCached: user.lifeBalance || 0,
                createdAt: new Date('2024-01-01'),
              },
              {
                id: `acc_oshi_${user.id.split('_')[1]}`,
                userId: user.id,
                kind: 'oshi',
                name: '推し活口座',
                balanceCached: user.oshiBalance || 0,
                createdAt: new Date('2024-01-01'),
              },
            ],
            // スコアをユーザーに応じて調整
            latestScore: {
              ...prevData.latestScore,
              userId: user.id,
              score: user.id.includes('10000001') ? 60 : user.id.includes('10000002') ? 70 : 80,
              label: user.id.includes('10000001') ? '安心' : user.id.includes('10000002') ? '安心' : 'とても安心',
            },
            // ユーザー固有の取引データ
            recentTransactions: userTransactions,
           }))
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [sortBy, sortOrder])

  const handleLogout = () => {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('currentUser')
    
    if (onLogout) {
      onLogout()
    } else {
      // フォールバック：ページをリロード
      window.location.reload()
    }
  }

  const handleTransactionUpdate = async (updatedTransaction: any) => {
    console.log('Transaction updated:', updatedTransaction)
    
    // 口座移行が発生した可能性があるため、ダッシュボード全体を再読み込み
    try {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
        const params = new URLSearchParams({
          sortBy,
          sortOrder
        })
        const dashboardResponse = await fetch(`${apiUrl}/dashboard?${params}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
            'X-User-Email': user.email
          }
        })
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          if (dashboardData.success) {
            // APIデータの日付フィールドを変換
            const processedData = {
              ...dashboardData.data,
              user: {
                ...dashboardData.data.user,
                createdAt: new Date(dashboardData.data.user.createdAt)
              },
              accounts: dashboardData.data.accounts.map((acc: any) => ({
                ...acc,
                balanceCached: acc.balanceCached || 0,
                createdAt: new Date(acc.createdAt)
              })),
              recentTransactions: dashboardData.data.recentTransactions.map((tx: any) => ({
                ...tx,
                amount: tx.amount || 0,
                eventAt: new Date(tx.eventAt),
                createdAt: new Date(tx.createdAt)
              })),
              latestScore: dashboardData.data.latestScore ? {
                ...dashboardData.data.latestScore,
                score: dashboardData.data.latestScore.score || 0,
                snapshotAt: new Date(dashboardData.data.latestScore.snapshotAt)
              } : null
            }
            
            setData(processedData)
            console.log('Dashboard refreshed after transaction update')
            return
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh dashboard after transaction update:', error)
    }
    
    // フォールバック: ローカル状態のみ更新
    setData(prevData => ({
      ...prevData,
      recentTransactions: prevData.recentTransactions.map(tx => 
        tx.id === updatedTransaction.id ? updatedTransaction : tx
      )
    }))
  }

  const lifeAccount = data.accounts.find(acc => acc.kind === 'life')
  const oshiAccount = data.accounts.find(acc => acc.kind === 'oshi')

  // 資金移動処理
  const handleFundTransfer = async () => {
    const amount = parseFloat(transferAmount)
    if (!amount || amount <= 0 || !lifeAccount || !oshiAccount) {
      alert('有効な金額を入力してください')
      return
    }

    if (amount > lifeAccount.balanceCached) {
      alert('生活口座の残高が不足しています')
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      
      // 生活口座から出金取引を作成
      const withdrawResponse = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          accountId: lifeAccount.id,
          amount: amount,
          sign: 'out',
          purpose: 'transfer',
          memo: '推し活口座への資金移動'
        })
      })

      // 推し活口座へ入金取引を作成
      const depositResponse = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          accountId: oshiAccount.id,
          amount: amount,
          sign: 'in',
          purpose: 'transfer',
          memo: '生活口座からの資金移動'
        })
      })

      if (withdrawResponse.ok && depositResponse.ok) {
        alert(`✅ ${formatCurrency(amount)}を推し活口座に移動しました！`)
        setTransferAmount('')
        setShowTransferModal(false)
        
        // ダッシュボードを再読み込み
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const params = new URLSearchParams({ sortBy, sortOrder })
          const dashboardResponse = await fetch(`${apiUrl}/dashboard?${params}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
              'X-User-Email': user.email
            }
          })
          
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json()
            if (dashboardData.success) {
              const processedData = {
                ...dashboardData.data,
                user: {
                  ...dashboardData.data.user,
                  createdAt: new Date(dashboardData.data.user.createdAt)
                },
                accounts: dashboardData.data.accounts.map((acc: any) => ({
                  ...acc,
                  balanceCached: acc.balanceCached || 0,
                  createdAt: new Date(acc.createdAt)
                })),
                recentTransactions: dashboardData.data.recentTransactions.map((tx: any) => ({
                  ...tx,
                  amount: tx.amount || 0,
                  eventAt: new Date(tx.eventAt),
                  createdAt: new Date(tx.createdAt)
                })),
                latestScore: dashboardData.data.latestScore ? {
                  ...dashboardData.data.latestScore,
                  score: dashboardData.data.latestScore.score || 0,
                  snapshotAt: new Date(dashboardData.data.latestScore.snapshotAt)
                } : null
              }
              setData(processedData)
            }
          }
        }
      } else {
        alert('❌ 資金移動に失敗しました')
      }
    } catch (error) {
      console.error('Transfer error:', error)
      alert('❌ 資金移動中にエラーが発生しました')
    }
  }

  // 自動残高移動機能
  const handleAutoBalanceTransfer = async (fromAccountType: 'life' | 'oshi', toAccountType: 'life' | 'oshi', amount: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      
      const fromAccount = fromAccountType === 'life' ? lifeAccount : oshiAccount
      const toAccount = toAccountType === 'life' ? lifeAccount : oshiAccount

      if (!fromAccount || !toAccount) return false

      // 出金取引
      const withdrawResponse = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          accountId: fromAccount.id,
          amount: amount,
          sign: 'out',
          purpose: 'auto_transfer',
          memo: `${toAccount.name}への自動資金移動`
        })
      })

      // 入金取引
      const depositResponse = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          accountId: toAccount.id,
          amount: amount,
          sign: 'in',
          purpose: 'auto_transfer',
          memo: `${fromAccount.name}からの自動資金移動`
        })
      })

      if (withdrawResponse.ok && depositResponse.ok) {
        // ダッシュボードを再読み込み
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const params = new URLSearchParams({ sortBy, sortOrder })
          const dashboardResponse = await fetch(`${apiUrl}/dashboard?${params}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
              'X-User-Email': user.email
            }
          })
          
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json()
            if (dashboardData.success) {
              const processedData = {
                ...dashboardData.data,
                user: {
                  ...dashboardData.data.user,
                  createdAt: new Date(dashboardData.data.user.createdAt)
                },
                accounts: dashboardData.data.accounts.map((acc: any) => ({
                  ...acc,
                  balanceCached: acc.balanceCached || 0,
                  createdAt: new Date(acc.createdAt)
                })),
                recentTransactions: dashboardData.data.recentTransactions.map((tx: any) => ({
                  ...tx,
                  amount: tx.amount || 0,
                  eventAt: new Date(tx.eventAt),
                  createdAt: new Date(tx.createdAt)
                })),
                latestScore: dashboardData.data.latestScore ? {
                  ...dashboardData.data.latestScore,
                  score: dashboardData.data.latestScore.score || 0,
                  snapshotAt: new Date(dashboardData.data.latestScore.snapshotAt)
                } : null
              }
              setData(processedData)
              return true
            }
          }
        }
      }
      return false
    } catch (error) {
      console.error('Auto transfer error:', error)
      return false
    }
  }

  // マイナス残高チェックとアラート表示
  const checkNegativeBalance = () => {
    const lifeBalance = lifeAccount?.balanceCached || 0
    const oshiBalance = oshiAccount?.balanceCached || 0
    
    if (oshiBalance < 0 && lifeBalance > Math.abs(oshiBalance)) {
      return {
        type: 'oshi_negative',
        amount: Math.abs(oshiBalance),
        message: '推し活口座がマイナスになっています。生活口座から自動で資金移動しますか？'
      }
    }
    
    if (lifeBalance < 0 && oshiBalance > Math.abs(lifeBalance)) {
      return {
        type: 'life_negative', 
        amount: Math.abs(lifeBalance),
        message: '生活口座がマイナスになっています。推し活口座から自動で資金移動しますか？'
      }
    }
    
    return null
  }

  const negativeBalanceInfo = checkNegativeBalance()

  // 振り分け未完了取引ページ表示
  if (viewMode === 'pending-transactions') {
    return <PendingTransactionsPage 
      onBack={() => {
        setViewMode('dashboard')
        // 振り分け処理後にダッシュボードデータを再読み込み
        window.location.reload()
      }}
      onUpdate={() => {
        // 更新後にダッシュボードを再読み込み
        console.log('Transaction updated, reloading dashboard...')
        setTimeout(() => {
          window.location.reload()
        }, 1000) // 1秒後にリロード
      }}
    />
  }

  // 取引履歴ページ表示
  if (currentPage === 'transactions' && viewMode !== 'swipe-mode') {
    return (
      <>
        <NavigationMenu 
          currentUser={data.user} 
          onLogout={handleLogout}
          currentPage={currentPage}
        />
        <div className="min-h-screen bg-gray-50">
          <div className="lg:ml-72">
            <div className="p-4 sm:p-6">
              <div className="pt-16 lg:pt-0">
                <TransactionHistoryPage
                  onSwipeMode={() => {
                    setViewMode('swipe-mode')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // スワイプ式振り分けページ表示（優先）
  if (viewMode === 'swipe-mode') {
    return (
      <>
        <NavigationMenu 
          currentUser={data.user} 
          onLogout={handleLogout}
          currentPage={currentPage}
        />
        <div className="min-h-screen bg-gray-50">
          <div className="lg:ml-72">
            <div className="p-4 sm:p-6">
              <div className="pt-16 lg:pt-0">
                <SwipeTransactionPage 
                  onBack={() => {
                    setViewMode('dashboard')
                    setCurrentPage('transactions')
                  }}
                  onUpdate={() => {
                    console.log('Transaction swiped and updated')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavigationMenu 
        currentUser={data.user} 
        onLogout={handleLogout}
        currentPage={currentPage}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* メインコンテンツ */}
        <div className="lg:ml-72">
          <div className="p-4 sm:p-6 space-y-6">
            {/* ヘッダー - モバイルでは上部にマージンを追加してメニューボタンと重ならないように */}
            <div className="pt-16 lg:pt-0 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  こんにちは、{data.user.displayName}さん
                </h2>
                <p className="text-muted-foreground">
                  今日も健康的な推し活を楽しみましょう！
                </p>
              </div>
            </div>

      {/* 推し活安心度スコア */}
      {data.latestScore && (
        <div className={`bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5 ${
          data.latestScore.score >= 80 ? 'shadow-green-500/10' :
          data.latestScore.score >= 60 ? 'shadow-blue-500/10' :
          data.latestScore.score >= 40 ? 'shadow-yellow-500/10' :
          'shadow-red-500/10'
        }`}>
          <div className="p-6 pb-4">
            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-3">
              {data.latestScore.score >= 80 ? (
                <ShieldCheck className="w-6 h-6 text-green-600" />
              ) : data.latestScore.score >= 60 ? (
                <Shield className="w-6 h-6 text-blue-600" />
              ) : data.latestScore.score >= 40 ? (
                <ShieldAlert className="w-6 h-6 text-yellow-600" />
              ) : (
                <ShieldX className="w-6 h-6 text-red-600" />
              )}
              <span>推し活安心度スコア</span>
            </h3>
            <p className="text-gray-600 leading-relaxed">
              現在のステータス: <strong>{data.latestScore.label}</strong>
            </p>
          </div>
          
          <div className="px-6 pb-6 space-y-6">
            {/* ゲージチャート表示 */}
            <div className="text-center py-6 bg-white/60 rounded-xl border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Award className="w-8 h-8 text-orange-500" />
                <span className="text-lg font-medium text-gray-700">総合スコア</span>
                <button
                  onClick={() => setShowScoreHelp(!showScoreHelp)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="スコアについて"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              
              {/* ゲージチャート */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                    {/* 背景円（グレー） */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    {/* プログレス円 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={219.8}
                      strokeDashoffset={219.8 - (data.latestScore.score / 100) * 219.8}
                      className={`transition-all duration-1000 ease-in-out ${
                        data.latestScore.score >= 80 ? 'text-green-500' :
                        data.latestScore.score >= 60 ? 'text-blue-500' :
                        data.latestScore.score >= 40 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-4xl font-bold ${
                      data.latestScore.score >= 80 ? 'text-green-600' :
                      data.latestScore.score >= 60 ? 'text-blue-600' :
                      data.latestScore.score >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.latestScore.score}<span className="text-xl text-gray-500">点</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* スコアラベル */}
              <div className="space-y-2">
                <div className={`text-xl font-bold ${
                  data.latestScore.score >= 80 ? 'text-green-600' :
                  data.latestScore.score >= 60 ? 'text-blue-600' :
                  data.latestScore.score >= 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {data.latestScore.label}
                </div>
                <div className="text-sm text-gray-600">推し活安心度レベル</div>
              </div>
            </div>

            {/* スコア説明（条件付き表示） */}
            {showScoreHelp && (
              <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-200 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">スコアについて</span>
                </div>
                <p className="text-blue-700 leading-relaxed text-sm">
                  推し活安心度スコアは、収入に対する推し活支出の健全性を100点満点で評価します。
                  <strong>収入比率</strong>（40点）、<strong>余剰金比率</strong>（30点）、<strong>推奨額適合度</strong>（30点）の
                  3つの要素から算出され、80点以上で「とても安心」、60点以上で「安心」となります。
                </p>
              </div>
            )}

            {/* スコア詳細ボタン */}
            <div className="text-center">
              <button
                onClick={() => setShowScoreDetails(!showScoreDetails)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
              >
                <span>詳細を表示</span>
                {showScoreDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* スコア詳細（条件付き表示） */}
            {showScoreDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-300">
              <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">収入比率</span>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {data.latestScore.factors.incomeRatio.toFixed(1)}<span className="text-sm text-gray-500">%</span>
                </div>
                <div className="text-xs text-green-600 mb-2">
                  {data.latestScore.factors.incomeRatioScore}点 / 40点
                </div>
                <div className="text-xs text-gray-600">
                  月収に対する推し活支出の割合
                </div>
              </div>
              
              <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">余剰金比率</span>
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {data.latestScore.factors.surplusRatio.toFixed(2)}<span className="text-sm text-gray-500">%</span>
                </div>
                <div className="text-xs text-blue-600 mb-2">
                  {data.latestScore.factors.surplusScore}点 / 30点
                </div>
                <div className="text-xs text-gray-600">
                  生活費を除いた余剰金との比率
                </div>
              </div>
              
              <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">推奨額適合</span>
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {data.latestScore.factors.recommendedDeviation.toFixed(1)}<span className="text-sm text-gray-500">%</span>
                </div>
                <div className="text-xs text-purple-600 mb-2">
                  {data.latestScore.factors.recommendedAmountScore}点 / 30点
                </div>
                <div className="text-xs text-gray-600">
                  AI推奨額からの乖離度
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* 口座残高概要 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5">
        <div className="p-6 pb-4">
          <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-3">
            <Wallet className="w-6 h-6 text-blue-600" />
            <span>総残高</span>
          </h3>
          <p className="text-gray-600 leading-relaxed">
            全口座の合計残高と振り分け後の内訳
          </p>
        </div>
        <div className="px-6 pb-6 space-y-6">
          {/* 総残高表示 */}
          <div className="text-center py-4 bg-white/60 rounded-xl border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">合計残高</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {formatCurrency((lifeAccount?.balanceCached || 0) + (oshiAccount?.balanceCached || 0))}
            </div>
          </div>

          {/* 口座別残高 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 生活口座 */}
            <div className="bg-white/70 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">生活口座</span>
                </div>
                {(lifeAccount?.balanceCached || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${(lifeAccount?.balanceCached || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(lifeAccount?.balanceCached || 0)}
                </div>
                <div className="text-xs text-gray-500">日常の収支管理</div>
              </div>
            </div>

            {/* 推し活口座 */}
            <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">推し活口座</span>
                </div>
                {(oshiAccount?.balanceCached || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${(oshiAccount?.balanceCached || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(oshiAccount?.balanceCached || 0)}
                </div>
                <div className="text-xs text-gray-500">推し活専用予算</div>
              </div>
            </div>
          </div>
          
          {/* 推し活費の割合 */}
          <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">推し活費の割合</span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {((Math.abs(oshiAccount?.balanceCached || 0) / Math.max(Math.abs((lifeAccount?.balanceCached || 0) + (oshiAccount?.balanceCached || 0)), 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ 
                  width: `${Math.min(100, (Math.abs(oshiAccount?.balanceCached || 0) / Math.max(Math.abs((lifeAccount?.balanceCached || 0) + (oshiAccount?.balanceCached || 0)), 1)) * 100)}%` 
                }}
              >
                <div className="w-1 h-1 bg-white rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
            
          {/* 資金移動ボタン */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => setShowTransferModal(true)}
              className="bg-white text-gray-700 border-2 border-gradient-to-r from-green-500 to-purple-500 hover:bg-gray-50 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderImage: 'linear-gradient(to right, rgb(34, 197, 94), rgb(147, 51, 234)) 1'
              }}
              disabled={(lifeAccount?.balanceCached || 0) <= 0}
            >
              <TrendingUp className="w-4 h-4" />
              <span>推し活口座に資金移動</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 各口座の詳細 - 改善されたデザイン */}
      <div className="grid md:grid-cols-2 gap-6">
        {lifeAccount && (
          <div className="cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg shadow-green-500/10" 
                onClick={() => setSelectedAccount(lifeAccount)}>
            <div className="p-6 text-center">
              {/* 見出し */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  {lifeAccount.name}
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </h4>
              </div>
              
              {/* 説明 */}
              <p className="text-green-600 font-medium mb-6">
                日常の収入・支出管理
              </p>
              
              {/* 中心部分の金額 */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {formatCurrency(lifeAccount.balanceCached)}
                </div>
                <div className="text-sm text-green-600 font-medium">現在の残高</div>
              </div>
              
              {/* 取引件数など */}
              <div className="bg-white/70 rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">振り分け完了</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {data.recentTransactions.filter(tx => tx.accountKind === 'life' && !tx.isPending).length}
                  </div>
                  <div className="text-xs text-green-600">件の取引</div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                  <Info className="w-3 h-3" />
                  <span>給与・生活費・その他の日常支出</span>
                </div>
                
                <div className="pt-2 border-t border-green-200">
                  <div className="flex items-center justify-center gap-1 text-green-700 font-medium text-sm hover:text-green-800 transition-colors">
                    <span>詳細を表示</span>
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {oshiAccount && (
          <div className="cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg shadow-purple-500/10" 
                onClick={() => setSelectedAccount(oshiAccount)}>
            <div className="p-6 text-center">
              {/* 見出し */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  {oshiAccount.name}
                  {(oshiAccount.balanceCached || 0) >= 0 ? (
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </h4>
              </div>
              
              {/* 説明 */}
              <p className="text-purple-600 font-medium mb-6">
                推し活専用予算管理
              </p>
              
              {/* 中心部分の金額 */}
              <div className="mb-6">
                <div className={`text-4xl font-bold mb-2 ${(oshiAccount.balanceCached || 0) >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                  {formatCurrency(oshiAccount.balanceCached)}
                </div>
                <div className="text-sm text-purple-600 font-medium">現在の残高</div>
              </div>
              
              {/* 警告メッセージ（マイナス残高の場合） */}
              {(oshiAccount.balanceCached || 0) < 0 && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">推し活支出が予算を超過しています</span>
                  </div>
                </div>
              )}
              
              {/* 取引件数など */}
              <div className="bg-white/70 rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-700 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">振り分け完了</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {data.recentTransactions.filter(tx => tx.accountKind === 'oshi' && !tx.isPending).length}
                  </div>
                  <div className="text-xs text-purple-600">件の取引</div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-purple-600">
                  <Info className="w-3 h-3" />
                  <span>チケット・グッズ・イベント・推し活支出</span>
                </div>
                
                <div className="pt-2 border-t border-purple-200">
                  <div className="flex items-center justify-center gap-1 text-purple-700 font-medium text-sm hover:text-purple-800 transition-colors">
                    <span>詳細を表示</span>
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 自動残高移動アラート */}
      {negativeBalanceInfo && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-orange-800">
                  残高不足の警告
                </CardTitle>
                <CardDescription className="text-orange-700">
                  {negativeBalanceInfo.message}
                </CardDescription>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={async () => {
                  const success = await handleAutoBalanceTransfer(
                    negativeBalanceInfo.type === 'oshi_negative' ? 'life' : 'oshi',
                    negativeBalanceInfo.type === 'oshi_negative' ? 'oshi' : 'life',
                    negativeBalanceInfo.amount
                  )
                  if (success) {
                    console.log('自動資金移動が完了しました')
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                自動で資金移動 ({formatCurrency(negativeBalanceInfo.amount)})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // アラートを一時的に無視（リロード時に再表示される）
                  console.log('アラートを無視しました')
                }}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                後で対応
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* 最近の取引 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">📊 最近の取引</CardTitle>
          <CardDescription>
            自動振り分けと保留中の取引
          </CardDescription>
          
          {/* コントロールパネル */}
          <div className="mt-4 space-y-3">
            {/* 振り分け未完了ボタン（優先表示） */}
            {data.recentTransactions.some(tx => tx.isPending) && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setViewMode('pending-transactions')}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                  size="default"
                >
                  <Clipboard className="w-4 h-4" />
                  <span className="hidden sm:inline">振り分け未完了</span>
                  <span className="bg-orange-600 px-2 py-0.5 rounded-full text-xs">
                    {data.recentTransactions.filter(tx => tx.isPending).length}
                  </span>
                </Button>
                <Button
                  onClick={() => setViewMode('swipe-mode')}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                  title="スワイプで振り分け"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">スワイプモード</span>
                </Button>
              </div>
            )}
            
            {/* ソート・表示オプション */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                  className="bg-transparent border-none text-sm focus:outline-none"
                >
                  <option value="date">日付順</option>
                  <option value="amount">金額順</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 h-auto"
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecentOnly(!showRecentOnly)}
                className="flex items-center gap-2"
              >
                {showRecentOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {showRecentOnly ? '全て表示' : '直近10件'}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(showRecentOnly ? data.recentTransactions.slice(0, 10) : data.recentTransactions).map((transaction) => (
              <div
                key={transaction.id}
                className={`p-3 rounded-lg border ${
                  transaction.isPending ? 'bg-yellow-50 border-yellow-200' : 
                  transaction.isAutoCategorized ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.memo}</p>
                      {transaction.isAutoCategorized && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          自動振り分け済み
                        </span>
                      )}
                      {transaction.isPending && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          保留中
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.eventAt.toLocaleDateString('ja-JP')} • {transaction.accountName}
                    </p>
                    {transaction.isPending && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ 用途の手動振り分けが必要です
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.sign === 'out' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.sign === 'out' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.purpose}
                    </p>
                    {transaction.canEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-1 h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTransaction(transaction)
                        }}
                      >
                        編集
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 保留中の取引がある場合の案内 */}
          {data.recentTransactions.some(tx => tx.isPending) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>保留中の取引があります</strong><br />
                クレジットカードや振込などの取引は、用途を手動で設定してください。
                正確な振り分けにより、より精密な推し活安心度スコアが算出されます。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 利用可能な特典 */}
      <Card>
        <CardHeader>
          <CardTitle>🎁 利用可能な特典</CardTitle>
          <CardDescription>
            あなたのスコアで利用できる特典
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.availableRewards
              .filter(reward => data.latestScore && data.latestScore.score >= reward.minScore)
              .map((reward) => (
                <div
                  key={reward.id}
                  className="flex justify-between items-center p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{reward.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="px-3">
                    <ArrowRightLeft className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* モーダル */}
      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          transactions={data.recentTransactions}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          onSave={handleTransactionUpdate}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {/* 資金移動モーダル */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>💸 推し活口座への資金移動</CardTitle>
              <CardDescription>
                生活口座から推し活口座に資金を移動します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">現在の残高</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>生活口座</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(lifeAccount?.balanceCached || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>推し活口座</span>
                    <span className={`font-bold ${(oshiAccount?.balanceCached || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                      {formatCurrency(oshiAccount?.balanceCached || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">移動金額</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="移動する金額を入力"
                  className="w-full p-2 border rounded mt-1"
                  max={lifeAccount?.balanceCached || 0}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTransferModal(false)
                    setTransferAmount('')
                  }}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleFundTransfer}
                  disabled={!transferAmount || parseFloat(transferAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600"
                >
                  移動する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
          </div>
        </div>
      </div>
    </>
  )
} 





















