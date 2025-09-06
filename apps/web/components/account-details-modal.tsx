'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  sign: 'in' | 'out'
  purpose: string
  memo: string
  originalDescription?: string
  isAutoCategorized?: boolean
  isPending?: boolean
  eventAt: Date
  accountKind?: 'life' | 'oshi' | string
  accountId?: string
  accountName?: string
}

interface Account {
  id: string
  name: string
  kind: 'life' | 'oshi'
  balanceCached: number
}

interface AccountDetailsModalProps {
  account: Account
  transactions: Transaction[]
  onClose: () => void
}

export function AccountDetailsModal({ account, transactions, onClose }: AccountDetailsModalProps) {
  // accountIdまたはaccountKindで取引をフィルタリング
  const accountTransactions = transactions.filter(tx => {
    // 1. accountIdが一致する場合（最優先）
    if (tx.accountId && account.id) {
      const match = tx.accountId === account.id
      if (match) {
        console.log(`Transaction ${tx.id} matched by accountId: ${tx.accountId} === ${account.id}`)
      }
      return match
    }
    
    // 2. accountKindが一致する場合
    if (tx.accountKind) {
      const match = tx.accountKind === account.kind
      if (match) {
        console.log(`Transaction ${tx.id} matched by accountKind: ${tx.accountKind} === ${account.kind}`)
      }
      return match
    }
    
    // 3. フォールバック: purposeで判定（旧ロジック）
    const match = (account.kind === 'life' && tx.purpose !== 'ticket' && tx.purpose !== 'goods' && tx.purpose !== 'event') ||
           (account.kind === 'oshi' && (tx.purpose === 'ticket' || tx.purpose === 'goods' || tx.purpose === 'event'))
    if (match) {
      console.log(`Transaction ${tx.id} matched by purpose fallback: purpose=${tx.purpose}, account.kind=${account.kind}`)
    }
    return match
  })
  
  console.log(`AccountDetailsModal: Found ${accountTransactions.length} transactions for account ${account.name} (${account.kind})`)
  console.log('Account ID:', account.id)
  console.log('All transactions count:', transactions.length)

  const totalIncome = accountTransactions
    .filter(tx => tx.sign === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpense = accountTransactions
    .filter(tx => tx.sign === 'out')
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl">
        <CardHeader className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {account.kind === 'life' ? '💰' : '✨'} {account.name}詳細
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-blue-600 mt-1">
                残高: {formatCurrency(account.balanceCached)}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="hover:bg-white/80 rounded-full w-10 h-10 p-0"
            >
              <span className="text-xl text-gray-500 hover:text-gray-700">✕</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* 収支サマリー */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📈</span>
                <p className="text-sm font-medium text-green-700">総収入</p>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📉</span>
                <p className="text-sm font-medium text-red-700">総支出</p>
              </div>
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          {/* 取引履歴 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📋</span>
              <h3 className="text-lg font-bold text-gray-800">取引履歴</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {accountTransactions.length}件
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {accountTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">📭</span>
                  <p className="text-gray-500 font-medium">取引履歴がありません</p>
                </div>
              ) : (
                accountTransactions
                  .sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                        transaction.isPending 
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-sm' 
                          : transaction.isAutoCategorized 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm' 
                          : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{transaction.memo}</p>
                            {transaction.isAutoCategorized && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                自動分類
                              </span>
                            )}
                            {transaction.isPending && (
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                保留中
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(transaction.eventAt)} • {transaction.purpose}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 