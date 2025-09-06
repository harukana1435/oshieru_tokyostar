'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  ArrowLeft, 
  Save, 
  DollarSign, 
  Heart, 
  PiggyBank,
  CreditCard,
  Loader2,
  CheckCircle
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

interface PendingTransactionsPageProps {
  onBack: () => void
  onUpdate?: () => void
}

export function PendingTransactionsPage({ onBack, onUpdate }: PendingTransactionsPageProps) {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const response = await fetch(`${apiUrl}/dashboard/pending-transactions`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const processedTransactions = data.data.map((tx: any) => ({
            ...tx,
            eventAt: new Date(tx.eventAt),
            selectedPurpose: '',
            selectedAccount: 'life' as 'life' | 'oshi'
          }))
          setTransactions(processedTransactions)
        }
      }
    } catch (error) {
      console.error('Failed to load pending transactions:', error)
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
      
      // ここで一括更新のAPIを呼び出し
      const updates = transactions
        .filter(tx => tx.selectedPurpose && tx.selectedAccount)
        .map(tx => ({
          id: tx.id,
          purpose: tx.selectedPurpose,
          accountKind: tx.selectedAccount,
          isPending: false
        }))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const response = await fetch(`${apiUrl}/transactions/batch-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          updates: updates
        }),
      })

      if (response.ok) {
        if (onUpdate) {
          onUpdate()
        }
        onBack()
      }
    } catch (error) {
      console.error('Failed to save transactions:', error)
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
        <Button onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          ダッシュボードに戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">振り分け未完了取引</h2>
          <p className="text-muted-foreground">
            用途の手動設定が必要な取引を一括で処理できます
          </p>
        </div>
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
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
                          ? 'border-green-500 bg-green-50 text-green-700'
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
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {transactions.filter(tx => tx.selectedPurpose && tx.selectedAccount).length}件 / {transactions.length}件 選択済み
            </div>
            <Button
              onClick={handleSaveAll}
              disabled={isSaving || transactions.filter(tx => tx.selectedPurpose && tx.selectedAccount).length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? '保存中...' : '一括保存'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 