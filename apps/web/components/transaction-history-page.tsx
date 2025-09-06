'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ArrowUpDown, Eye, EyeOff, SortAsc, SortDesc, CreditCard, Filter, Search, DollarSign, PiggyBank, Heart } from 'lucide-react'

interface Transaction {
  id: string
  accountId: string
  amount: number
  sign: 'in' | 'out'
  purpose: string
  memo: string
  originalDescription: string
  isAutoCategorized: boolean
  isPending: boolean
  canEdit: boolean
  originalCode?: number
  eventAt: Date
  createdAt: Date
  accountName: string
  accountKind: 'life' | 'oshi'
}

interface TransactionHistoryPageProps {
  onSwipeMode: () => void
  onBatchCategorization?: () => void
}

export function TransactionHistoryPage({ onSwipeMode, onBatchCategorization }: TransactionHistoryPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [filterAccount, setFilterAccount] = useState<'all' | 'life' | 'oshi'>('all')
  const [accountBalances, setAccountBalances] = useState<{
    totalBalance: number
    lifeBalance: number
    oshiBalance: number
  }>({ totalBalance: 0, lifeBalance: 0, oshiBalance: 0 })

  useEffect(() => {
    loadTransactions()
  }, [sortBy, sortOrder])

  const loadTransactions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = currentUser.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'
      
      const response = await fetch(`${apiUrl}/dashboard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail
        },
        body: JSON.stringify({ userId: currentUser.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const processedTransactions = data.data.recentTransactions?.map((tx: any) => ({
            ...tx,
            eventAt: new Date(tx.eventAt),
            createdAt: new Date(tx.createdAt)
          })) || []
          
          setTransactions(processedTransactions)
          
          // 残高情報を設定
          const accounts = data.data.accounts || []
          const lifeAccount = accounts.find((acc: any) => acc.kind === 'life')
          const oshiAccount = accounts.find((acc: any) => acc.kind === 'oshi')
          
          setAccountBalances({
            totalBalance: accounts.reduce((sum: number, account: any) => sum + (account.balanceCached || 0), 0),
            lifeBalance: lifeAccount?.balanceCached || 0,
            oshiBalance: oshiAccount?.balanceCached || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedTransactions = transactions
    .filter(tx => {
      if (showPendingOnly && !tx.isPending) return false
      if (filterAccount !== 'all' && tx.accountKind !== filterAccount) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime()
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const pendingCount = transactions.filter(tx => tx.isPending).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">取引履歴を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">取引管理</h2>
          <p className="text-muted-foreground">
            全取引履歴の確認と振り分け管理
          </p>
        </div>
        
        {/* 残高サマリー */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-black/5 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">総残高</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(accountBalances.totalBalance)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-black/5 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                <PiggyBank className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">生活口座</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(accountBalances.lifeBalance)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-black/5 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">推し活口座</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(accountBalances.oshiBalance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-4">
        {/* 振り分けボタン */}
        {pendingCount > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-black/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">振り分け管理</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {pendingCount}件 未処理
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onBatchCategorization}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2 shadow-lg"
              >
                <ArrowUpDown className="w-4 h-4" />
                一括振り分け
              </Button>
              <Button
                onClick={onSwipeMode}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center gap-2 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                スワイプで振り分け
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* フィルター・ソート */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 口座フィルター */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">口座:</span>
              <div className="flex rounded-lg border overflow-hidden">
                <Button
                  size="sm"
                  onClick={() => setFilterAccount('all')}
                  className={`rounded-none border-0 ${
                    filterAccount === 'all' 
                      ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                  }`}
                >
                  全て
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFilterAccount('life')}
                  className={`rounded-none border-x border-y-0 ${
                    filterAccount === 'life' 
                      ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                  }`}
                >
                  生活
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFilterAccount('oshi')}
                  className={`rounded-none border-0 ${
                    filterAccount === 'oshi' 
                      ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                  }`}
                >
                  推し活
                </Button>
              </div>
            </div>

            {/* ソート */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <Button
                size="sm"
                onClick={() => setSortBy('date')}
                className={sortBy === 'date' 
                  ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-gray-900' 
                  : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                }
              >
                日付順
              </Button>
              <Button
                size="sm"
                onClick={() => setSortBy('amount')}
                className={sortBy === 'amount' 
                  ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-gray-900' 
                  : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                }
              >
                金額順
              </Button>
              <Button
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 取引リスト内の未振り分けフィルター */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <h4 className="font-semibold text-gray-900">取引履歴</h4>
            <Button
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              size="sm"
              className={`flex items-center gap-2 ${
                showPendingOnly 
                  ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-gray-900' 
                  : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showPendingOnly ? '全て表示' : '未振り分けのみ表示'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {filteredAndSortedTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>条件に合う取引がありません</p>
              </div>
            ) : (
              filteredAndSortedTransactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    transaction.isPending 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{transaction.memo}</h3>
                        {transaction.isPending && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            未振り分け
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.accountKind === 'life' 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {transaction.accountName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {transaction.originalDescription}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(transaction.eventAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-lg font-bold ${
                        transaction.sign === 'out' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.sign === 'out' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 統計 */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-600">総取引数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(tx => !tx.isPending).length}
            </div>
            <div className="text-sm text-gray-600">振り分け済み</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
            <div className="text-sm text-gray-600">未振り分け</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 