'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  sign: 'in' | 'out'
  purpose: string
  memo: string
  originalDescription?: string
  isAutoCategorized?: boolean
  isPending?: boolean
  canEdit?: boolean
  eventAt: Date
  accountKind?: 'life' | 'oshi'
}

interface TransactionEditModalProps {
  transaction: Transaction
  onSave: (updatedTransaction: Transaction) => void
  onClose: () => void
}

const purposeOptions = [
  { value: 'salary', label: '給与・収入' },
  { value: 'ticket', label: 'チケット' },
  { value: 'goods', label: 'グッズ' },
  { value: 'event', label: 'イベント' },
  { value: 'food', label: '食費' },
  { value: 'rent', label: '家賃・住居費' },
  { value: 'utilities', label: '光熱費・通信費' },
  { value: 'transport', label: '交通費' },
  { value: 'other', label: 'その他' },
]

const accountTypeOptions = [
  { value: 'life', label: '生活口座' },
  { value: 'oshi', label: '推し活口座' },
]

export function TransactionEditModal({ transaction, onSave, onClose }: TransactionEditModalProps) {
  const [editedTransaction, setEditedTransaction] = useState<Transaction>({ ...transaction })
  const [accountType, setAccountType] = useState<'life' | 'oshi'>(
    ['ticket', 'goods', 'event'].includes(transaction.purpose) ? 'oshi' : 'life'
  )

  // transactionプロパティが変更されたときに状態を更新
  useEffect(() => {
    setEditedTransaction({ ...transaction })
    // 口座種別も取引の現在の口座に基づいて設定
    if (transaction.accountKind) {
      setAccountType(transaction.accountKind as 'life' | 'oshi')
    } else {
      setAccountType(['ticket', 'goods', 'event'].includes(transaction.purpose) ? 'oshi' : 'life')
    }
  }, [transaction])

  const handleSave = async () => {
    // 口座種別に応じて用途を調整
    let finalPurpose = editedTransaction.purpose
    if (accountType === 'oshi' && !['ticket', 'goods', 'event'].includes(finalPurpose)) {
      finalPurpose = 'other'
    }

    try {
      // APIを呼び出して取引を更新
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const response = await fetch(`${apiUrl}/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          purpose: finalPurpose,
          memo: editedTransaction.memo,
          accountType: accountType // 口座移行情報を送信
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Transaction updated via API:', result)
        
        // 成功した場合、親コンポーネントに通知
        const updatedTransaction = {
          ...result.transaction,
          eventAt: new Date(result.transaction.eventAt),
          createdAt: new Date(result.transaction.createdAt),
          isAutoCategorized: false,
          isPending: false,
        }
        
        onSave(updatedTransaction)
        onClose()
      } else {
        console.error('Failed to update transaction:', await response.text())
        alert('取引の更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('取引の更新中にエラーが発生しました')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>取引を編集</CardTitle>
              <CardDescription>
                {formatCurrency(transaction.amount)} • {transaction.eventAt.toLocaleDateString('ja-JP')}
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 元の摘要 */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">元の摘要</label>
            <p className="p-2 bg-gray-50 rounded text-sm">
              {transaction.originalDescription || transaction.memo}
            </p>
          </div>

          {/* メモ編集 */}
          <div>
            <label className="text-sm font-medium">メモ</label>
            <input
              type="text"
              value={editedTransaction.memo}
              onChange={(e) => setEditedTransaction({ ...editedTransaction, memo: e.target.value })}
              className="w-full p-2 border rounded mt-1"
              placeholder="メモを入力"
            />
          </div>

          {/* 口座種別選択 */}
          <div>
            <label className="text-sm font-medium">口座種別</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as 'life' | 'oshi')}
              className="w-full p-2 border rounded mt-1"
            >
              {accountTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 用途選択 */}
          <div>
            <label className="text-sm font-medium">用途</label>
            <select
              value={editedTransaction.purpose}
              onChange={(e) => setEditedTransaction({ ...editedTransaction, purpose: e.target.value })}
              className="w-full p-2 border rounded mt-1"
            >
              {purposeOptions
                .filter(option => {
                  // 口座種別に応じて選択肢をフィルタリング
                  if (accountType === 'oshi') {
                    return ['ticket', 'goods', 'event', 'other'].includes(option.value)
                  }
                  return !['ticket', 'goods', 'event'].includes(option.value)
                })
                .map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>

          {/* 現在の状態表示 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>編集後:</strong> {accountType === 'life' ? '生活口座' : '推し活口座'} • {
                purposeOptions.find(opt => opt.value === editedTransaction.purpose)?.label
              }
            </p>
          </div>

          {/* ボタン */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 