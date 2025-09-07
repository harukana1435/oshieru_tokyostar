'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { AccountDetailsModal } from '@/components/account-details-modal'
import { TransactionEditModal } from '@/components/transaction-edit-modal'
import { Loading } from '@/components/ui/loading'
import { 
  PiggyBank, 
  Heart, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Gift,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react'

interface Transaction {
  id: string
  accountId: string
  accountName: string
  accountKind: 'life' | 'oshi'
  amount: number
  sign: 'in' | 'out'
  purpose: string
  memo: string
  eventAt: Date
  createdAt: Date
  isPending: boolean
  isAutoCategorized: boolean
  canEdit: boolean
  originalCode?: number
  originalDescription?: string
}

export function DashboardContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNegativeBalanceModal, setShowNegativeBalanceModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [showScoreHelp, setShowScoreHelp] = useState(false)
  const [showScoreDetails, setShowScoreDetails] = useState(false)

  const router = useRouter()

  // データ取得処理
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const currentUser = localStorage.getItem('currentUser')
        if (!currentUser) {
          router.push('/login')
          return
        }

        const user = JSON.parse(currentUser)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
        
        const sessionId = localStorage.getItem('sessionId')
        
        // デバッグログ追加
        console.log('Dashboard API request details:', {
          userId: user.id,
          userEmail: user.email,
          sessionId: sessionId,
          apiUrl: apiUrl
        })
        
        // 正しいメールアドレスを確実に使用
        const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'
        
        const response = await fetch(`${apiUrl}/dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
            'X-User-Email': correctEmail,
          },
          body: JSON.stringify({ userId: user.id }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const dashboardData = await response.json()
        
        if (dashboardData.success) {
          // 安全なデータ処理
          const accounts = dashboardData.data.accounts || []
          const recentTransactions = dashboardData.data.recentTransactions || []
          
          const processedData = {
            user: dashboardData.data.user,
            accounts: accounts,
            totalBalance: accounts.reduce((sum: number, account: any) => sum + (account.balanceCached || 0), 0),
            lifeAccount: accounts.find((acc: any) => acc.kind === 'life'),
            oshiAccount: accounts.find((acc: any) => acc.kind === 'oshi'),
            latestScore: dashboardData.data.latestScore,
            recentTransactions: recentTransactions.map((tx: any) => ({
              ...tx,
              eventAt: new Date(tx.eventAt),
              createdAt: new Date(tx.createdAt),
              accountKind: tx.accountKind || (tx.accountId?.includes('life') ? 'life' : 'oshi'),
              accountName: tx.accountName || (tx.accountId?.includes('life') ? '生活口座' : '推し活口座')
            })),
            rewards: dashboardData.data.rewards || [],
            transactionCount: recentTransactions.length
          }

          // 安全な残高計算
          const lifeTransactions = processedData.recentTransactions.filter((tx: Transaction) => tx.accountKind === 'life')
          const oshiTransactions = processedData.recentTransactions.filter((tx: Transaction) => tx.accountKind === 'oshi')
          
          let lifeBalance = 0
          if (lifeTransactions.length > 0) {
            lifeBalance = lifeTransactions.reduce((sum: number, tx: Transaction) => {
              return sum + (tx.sign === 'in' ? tx.amount : -tx.amount)
            }, 0)
          }

          let oshiBalance = 0
          if (oshiTransactions.length > 0) {
            oshiBalance = oshiTransactions.reduce((sum: number, tx: Transaction) => {
              return sum + (tx.sign === 'in' ? tx.amount : -tx.amount)
            }, 0)
          }

          // 残高を追加
          (processedData as any).lifeBalance = lifeBalance
          ;(processedData as any).oshiBalance = oshiBalance
          ;(processedData as any).totalBalance = lifeBalance + oshiBalance

          setData(processedData)
        } else {
          setError(dashboardData.message || 'データの取得に失敗しました')
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
        setError('ネットワークエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  // 推し活口座の残高チェック
  useEffect(() => {
    if (data && data.oshiAccount && data.oshiAccount.balanceCached < 0) {
      setShowNegativeBalanceModal(true)
    }
  }, [data])

  // モーダルが開かれた時の推奨金額設定
  useEffect(() => {
    if (showNegativeBalanceModal && data?.oshiAccount?.balanceCached < 0) {
      const suggestedAmount = Math.abs(data.oshiAccount.balanceCached) + 10000 // マイナス分 + 10,000円
      setTransferAmount(suggestedAmount.toString())
    }
  }, [showNegativeBalanceModal, data])

  // 残高移動処理
  const handleBalanceTransfer = async () => {
    try {
      setIsLoading(true)
      const amount = parseFloat(transferAmount)
      
      if (!amount || amount <= 0) {
        alert('正しい金額を入力してください')
        return
      }

      if (!data.lifeAccount || data.lifeAccount.balanceCached < amount) {
        alert('生活口座の残高が不足しています')
        return
      }

      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) return

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'
      
      // 生活口座から出金取引を作成
      const outTransaction = {
        accountId: data.lifeAccount.id,
        amount: amount,
        sign: 'out',
        purpose: 'fund_transfer',
        memo: `資金移動 → 推し活口座 (￥${amount.toLocaleString()})`,
        eventAt: new Date().toISOString(),
      }

      // 推し活口座へ入金取引を作成
      const inTransaction = {
        accountId: data.oshiAccount.id,
        amount: amount,
        sign: 'in',
        purpose: 'fund_transfer',
        memo: `資金移動 ← 生活口座 (￥${amount.toLocaleString()})`,
        eventAt: new Date().toISOString(),
      }

      // 両方の取引を作成
      const outResponse = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail,
        },
        body: JSON.stringify(outTransaction),
      })

      const inResponse = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail,
        },
        body: JSON.stringify(inTransaction),
      })

      if (outResponse.ok && inResponse.ok) {
        // ダッシュボードデータを再取得
        window.location.reload()
      } else {
        alert('振替処理に失敗しました')
      }
    } catch (error) {
      console.error('Balance transfer error:', error)
      alert('振替処理中にエラーが発生しました')
    } finally {
      setIsLoading(false)
      setShowNegativeBalanceModal(false)
      setTransferAmount('')
    }
  }

  // 取引更新後の処理
  const handleTransactionUpdate = async (updatedTransaction: any) => {
    try {
      setIsLoading(true)
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) return

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'
      
      const response = await fetch(`${apiUrl}/dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
            'X-User-Email': correctEmail,
          },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const dashboardData = await response.json()
        if (dashboardData.success) {
          // 安全なデータ処理
          const accounts = dashboardData.data.accounts || []
          const recentTransactions = dashboardData.data.recentTransactions || []
          
          const processedData = {
            user: dashboardData.data.user,
            accounts: accounts,
            totalBalance: accounts.reduce((sum: number, account: any) => sum + (account.balanceCached || 0), 0),
            lifeAccount: accounts.find((acc: any) => acc.kind === 'life'),
            oshiAccount: accounts.find((acc: any) => acc.kind === 'oshi'),
            latestScore: dashboardData.data.latestScore,
            recentTransactions: recentTransactions.map((tx: any) => ({
              ...tx,
              eventAt: new Date(tx.eventAt),
              createdAt: new Date(tx.createdAt),
              accountKind: tx.accountKind || (tx.accountId?.includes('life') ? 'life' : 'oshi'),
              accountName: tx.accountName || (tx.accountId?.includes('life') ? '生活口座' : '推し活口座')
            })),
            rewards: dashboardData.data.rewards || [],
            transactionCount: recentTransactions.length
          }
          setData(processedData)
        }
      }
    } catch (error) {
      console.error('Transaction update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>再試行</Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  // スコアゲージチャートSVG
  const ScoreGauge = ({ score, size = 120 }: { score: number, size?: number }) => {
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference * 0.75 // 270度（3/4円）
    const strokeDashoffset = strokeDasharray - (strokeDasharray * score) / 100

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#10b981' // green-500
      if (score >= 60) return '#f59e0b' // amber-500
      if (score >= 40) return '#ef4444' // red-500
      return '#6b7280' // gray-500
    }

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-45">
          {/* 背景円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* スコア円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* 中央のスコア表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">{score}</div>
          <div className="text-xs text-gray-500">点</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 推し活安心度スコア */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">推し活安心度スコア</h2>
                <p className="text-sm text-gray-600">健康的な推し活の指標</p>
              </div>
            </div>
            <button
              onClick={() => setShowScoreHelp(!showScoreHelp)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* スコアゲージ */}
            <div className="flex-shrink-0">
              <ScoreGauge score={data.latestScore?.score || 0} />
            </div>

            {/* スコア詳細 */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">評価レベル</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {data.latestScore?.label || '評価中'}
                </span>
              </div>
              
              {data.latestScore?.factors && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowScoreDetails(!showScoreDetails)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    詳細を表示
                    {showScoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showScoreDetails && (
                    <div className="space-y-4 p-4 bg-gray-50/80 rounded-lg">
                      {/* 基本情報 */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">月収</p>
                          <p className="text-lg font-bold text-gray-900">
                            {data.latestScore?.analysisData?.income ? formatCurrency(data.latestScore.analysisData.income) : '---'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">推し活費用</p>
                          <p className="text-lg font-bold text-purple-600">
                            {data.latestScore?.analysisData?.oshiExpense ? formatCurrency(data.latestScore.analysisData.oshiExpense) : '---'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">生活必需品費用</p>
                          <p className="text-lg font-bold text-green-600">
                            {data.latestScore?.analysisData?.essentialExpense ? formatCurrency(data.latestScore.analysisData.essentialExpense) : '---'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">余剰金</p>
                          <p className="text-lg font-bold text-blue-600">
                            {data.latestScore?.analysisData?.income && data.latestScore?.analysisData?.essentialExpense 
                              ? formatCurrency(data.latestScore.analysisData.income - data.latestScore.analysisData.essentialExpense)
                              : '---'}
                          </p>
                        </div>
                      </div>

                      {/* スコア詳細 */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm">スコア内訳</h4>
                        
                        {/* 収入比率スコア */}
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">収入比率スコア</span>
                            <span className="text-sm font-bold text-gray-900">
                              {data.latestScore?.breakdown?.incomeRatioScore || 0}点 / 40点
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            推し活費の割合: {data.latestScore?.factors?.incomeRatio ? `${Math.round(data.latestScore.factors.incomeRatio * 100)}%` : '---'}
                            <br />
                            <span className="text-gray-500">
                              (20%以下: 40点, 21-30%: 30点, 31-40%: 20点, 41%以上: 10点)
                            </span>
                          </div>
                        </div>

                        {/* 余剰金スコア */}
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">余剰金スコア</span>
                            <span className="text-sm font-bold text-gray-900">
                              {data.latestScore?.breakdown?.surplusScore || 0}点 / 30点
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            余剰金比率: {data.latestScore?.factors?.surplusRatio ? `${Math.round(data.latestScore.factors.surplusRatio * 100)}%` : '---'}
                            <br />
                            <span className="text-gray-500">
                              (100%以下: 30点, 101-120%: 20点, 121-150%: 10点, 150%超: 0点)
                            </span>
                          </div>
                        </div>

                        {/* 推奨額適合スコア */}
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">推奨額適合スコア</span>
                            <span className="text-sm font-bold text-gray-900">
                              {data.latestScore?.breakdown?.recommendedAmountScore || 0}点 / 30点
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            推奨額: {data.latestScore?.analysisData?.recommendedAmount ? formatCurrency(data.latestScore.analysisData.recommendedAmount) : '---'}
                            <br />
                            乖離率: {data.latestScore?.factors?.recommendedDeviation ? `${Math.round(data.latestScore.factors.recommendedDeviation)}%` : '---'}
                            <br />
                            <span className="text-gray-500">
                              (+10%以下: 30点, +10-20%: 20点, +20-50%: 10点, +50%超: 0点)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {showScoreHelp && (
            <div className="mt-6 p-4 bg-blue-50/80 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">スコアについて</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>80点以上</strong>: 非常に健全な推し活状況</p>
                <p>• <strong>60-79点</strong>: 良好な推し活状況</p>
                <p>• <strong>40-59点</strong>: 注意が必要な状況</p>
                <p>• <strong>40点未満</strong>: 改善が必要な状況</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 総残高 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">総残高</h2>
                <p className="text-sm text-gray-600">全口座の合計金額</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/transactions')}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-xl border border-gray-200/50"
            >
              取引履歴を見る
            </button>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {formatCurrency(data.totalBalance || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 口座情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 生活口座 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">生活口座</h3>
                  <p className="text-sm text-gray-600">日常生活に必要な資金</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount({
                  ...data.lifeAccount,
                  transactions: data.recentTransactions.filter((tx: Transaction) => tx.accountKind === 'life')
                })}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-xl border border-gray-200/50"
              >
                詳細を見る
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.lifeAccount?.balanceCached || 0)}
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              取引件数: {data.recentTransactions.filter((tx: Transaction) => tx.accountKind === 'life' && !tx.isPending).length}件
            </div>
          </div>
        </div>

        {/* 推し活口座 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">推し活口座</h3>
                  <p className="text-sm text-gray-600">推し活動に使用する資金</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount({
                  ...data.oshiAccount,
                  transactions: data.recentTransactions.filter((tx: Transaction) => tx.accountKind === 'oshi')
                })}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-xl border border-gray-200/50"
              >
                詳細を見る
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.oshiAccount?.balanceCached || 0)}
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              取引件数: {data.recentTransactions.filter((tx: Transaction) => tx.accountKind === 'oshi' && !tx.isPending).length}件
            </div>

            {/* 残高不足時の資金移動ボタン */}
            {data.oshiAccount?.balanceCached < 0 && (
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Shield className="w-4 h-4" />
                    <span>残高不足が発生しています</span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowNegativeBalanceModal(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-2"
                >
                  資金移動
                </Button>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* 特典・サービス */}
      {data.rewards && data.rewards.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-black/5">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              特典・サービス
            </h3>
            <div className="grid gap-4">
              {data.rewards.map((reward: any) => (
                <div key={reward.id} className="p-4 border border-gray-200 rounded-xl bg-white/60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{reward.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                      <div className="text-xs text-gray-500">
                        推し活安心度スコア{reward.minScore}点以上で利用可能
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!data.latestScore || data.latestScore.score < reward.minScore}
                      className="ml-4 flex items-center gap-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* モーダル */}
      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          transactions={selectedAccount.transactions || []}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleTransactionUpdate}
        />
      )}

      {showNegativeBalanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">⚠️ 残高不足の警告</h3>
                <p className="text-gray-600">
                  推し活口座の残高がマイナスになっています。<br />
                  生活口座から資金を移動しますか？
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在の推し活口座残高
                  </label>
                  <div className="text-lg font-bold text-red-500">
                    {data?.oshiAccount ? formatCurrency(data.oshiAccount.balanceCached) : '￥0'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生活口座残高
                  </label>
                  <div className="text-lg font-bold text-green-600">
                    {data?.lifeAccount ? formatCurrency(data.lifeAccount.balanceCached) : '￥0'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    移動する金額
                    {data?.oshiAccount?.balanceCached < 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (推奨: 不足分 + ¥10,000)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="移動する金額を入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    step="1000"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowNegativeBalanceModal(false)
                    setTransferAmount('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  後で
                </Button>
                <Button
                  onClick={handleBalanceTransfer}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!transferAmount || parseFloat(transferAmount) <= 0}
                >
                  振替実行
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  )
} 