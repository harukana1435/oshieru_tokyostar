'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  ArrowLeft, 
  Save, 
  DollarSign, 
  Heart, 
  PiggyBank,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PendingTransaction {
  id: string
  amount: number
  sign: 'in' | 'out'
  originalDescription: string
  memo?: string
  eventAt: Date
  originalCode?: number
  selectedPurpose?: string
  selectedAccount?: 'life' | 'oshi'
}

export function BatchCategorizationContent() {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const router = useRouter()

  // 用途の選択肢
  const purposeOptions = [
    { value: 'food', label: '食費' },
    { value: 'transport', label: '交通費' },
    { value: 'entertainment', label: '娯楽費' },
    { value: 'shopping', label: '買い物' },
    { value: 'utilities', label: '光熱費' },
    { value: 'rent', label: '家賃・住居費' },
    { value: 'healthcare', label: '医療費' },
    { value: 'education', label: '教育費' },
    { value: 'oshi_goods', label: '推しグッズ' },
    { value: 'oshi_event', label: '推しイベント' },
    { value: 'oshi_support', label: '推し応援' },
    { value: 'other', label: 'その他' }
  ]

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  const fetchPendingTransactions = async () => {
    try {
      setIsLoading(true)
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        router.push('/login')
        return
      }

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      
      const sessionId = localStorage.getItem('sessionId')
      
      // デバッグログ追加
      console.log('Batch categorization API request details:', {
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
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      if (data.success) {
        const pendingTransactions = data.data.recentTransactions
          .filter((tx: any) => tx.isPending)
          .map((tx: any) => ({
            id: tx.id,
            amount: tx.amount,
            sign: tx.sign,
            originalDescription: tx.originalDescription || tx.memo,
            memo: tx.memo,
            eventAt: new Date(tx.eventAt),
            originalCode: tx.originalCode,
            selectedPurpose: '',
            selectedAccount: 'life' as 'life' | 'oshi'
          }))
        
        setTransactions(pendingTransactions)
      }
    } catch (error) {
      console.error('Failed to fetch pending transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransaction = (id: string, field: 'selectedPurpose' | 'selectedAccount', value: string) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === id ? { ...tx, [field]: value } : tx
      )
    )
  }

  const handleSaveAll = async () => {
    try {
      setIsSaving(true)
      setSaveStatus('saving')

      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        router.push('/login')
        return
      }

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'

      // 一括更新用のデータを準備
      const updates = transactions
        .filter(tx => tx.selectedPurpose && tx.selectedAccount)
        .map(tx => ({
          id: tx.id,
          purpose: tx.selectedPurpose,
          accountKind: tx.selectedAccount,
          accountId: tx.selectedAccount === 'life' 
            ? `acc_life_${user.id.replace('user_', '')}`
            : `acc_oshi_${user.id.replace('user_', '')}`,
          isPending: false
        }))

      if (updates.length === 0) {
        alert('振り分けする取引を選択してください')
        return
      }

      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'
      
      const response = await fetch(`${apiUrl}/transactions/batch-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail,
        },
        body: JSON.stringify({
          userId: user.id,
          updates: updates
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update transactions')
      }

      const result = await response.json()
      if (result.success) {
        setSaveStatus('success')
        
        // 成功後、少し待ってから取引履歴ページに戻る
        setTimeout(() => {
          router.push('/transactions')
        }, 1500)
      } else {
        throw new Error(result.message || 'Update failed')
      }
    } catch (error) {
      console.error('Failed to save transactions:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">未振り分け取引を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">すべて振り分け済みです</h2>
        <p className="text-gray-600 mb-6">未振り分けの取引はありません。</p>
        <Button onClick={() => router.push('/transactions')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          取引履歴に戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* スマホ用戻るボタン（左上固定） */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => router.push('/transactions')}
          variant="outline"
          className="flex items-center gap-2 bg-white shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">取引の一括振り分け</h2>
          <p className="text-muted-foreground">
            用途の手動設定が必要な取引を一括で処理できます
          </p>
        </div>
        {/* デスクトップ用戻るボタン（右上） */}
        <Button
          onClick={() => router.push('/transactions')}
          variant="outline"
          className="hidden md:flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
      </div>

      {/* 進捗状況 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">振り分け進捗</span>
              <div className="font-bold text-lg">
                {transactions.filter(tx => tx.selectedPurpose && tx.selectedAccount).length} / {transactions.length} 件完了
              </div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(transactions.filter(tx => tx.selectedPurpose && tx.selectedAccount).length / transactions.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 取引リスト */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="border-l-4 border-l-orange-400">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 取引情報 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{transaction.originalDescription}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(transaction.eventAt)}
                  </div>
                  <div className={`font-bold ${
                    transaction.sign === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.sign === 'in' ? '+' : ''}{formatCurrency(transaction.sign === 'in' ? transaction.amount : -transaction.amount)}
                  </div>
                </div>

                {/* 用途選択 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">用途</label>
                  <select
                    value={transaction.selectedPurpose}
                    onChange={(e) => updateTransaction(transaction.id, 'selectedPurpose', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">用途を選択してください</option>
                    {purposeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 口座選択 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">振り分け先口座</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateTransaction(transaction.id, 'selectedAccount', 'life')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        transaction.selectedAccount === 'life'
                          ? 'border-gray-800 bg-gray-100 text-gray-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <PiggyBank className="w-4 h-4" />
                        <span className="text-sm font-medium">生活口座</span>
                      </div>
                    </button>
                    <button
                      onClick={() => updateTransaction(transaction.id, 'selectedAccount', 'oshi')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        transaction.selectedAccount === 'oshi'
                          ? 'border-gray-700 bg-gray-200 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">推し活口座</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 保存ボタン */}
      <div className="sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {transactions.filter(tx => tx.selectedPurpose && tx.selectedAccount).length}件 / {transactions.length}件 選択済み
          </div>
          
          <Button
            onClick={handleSaveAll}
            disabled={isSaving || transactions.filter(tx => tx.selectedPurpose && tx.selectedAccount).length === 0}
            className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : saveStatus === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? '保存中...' : saveStatus === 'success' ? '保存完了' : saveStatus === 'error' ? '保存失敗' : '一括保存'}
          </Button>
        </div>
      </div>

      {/* 保存状態メッセージ */}
      {saveStatus === 'success' && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>振り分けが完了しました</span>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>保存に失敗しました</span>
          </div>
        </div>
      )}
    </div>
  )
} 