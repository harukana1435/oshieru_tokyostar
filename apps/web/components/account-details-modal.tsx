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
  const accountTransactions = transactions.filter(tx => 
    (account.kind === 'life' && tx.purpose !== 'ticket' && tx.purpose !== 'goods' && tx.purpose !== 'event') ||
    (account.kind === 'oshi' && (tx.purpose === 'ticket' || tx.purpose === 'goods' || tx.purpose === 'event'))
  )

  const totalIncome = accountTransactions
    .filter(tx => tx.sign === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpense = accountTransactions
    .filter(tx => tx.sign === 'out')
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{account.name}詳細</CardTitle>
              <CardDescription>
                残高: {formatCurrency(account.balanceCached)}
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {/* 収支サマリー */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">総収入</p>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">総支出</p>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          {/* 取引履歴 */}
          <div>
            <h3 className="font-semibold mb-3">取引履歴</h3>
            <div className="space-y-2">
              {accountTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  取引履歴がありません
                </p>
              ) : (
                accountTransactions
                  .sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-3 rounded-lg border ${
                        transaction.isPending ? 'bg-yellow-50 border-yellow-200' : 
                        transaction.isAutoCategorized ? 'bg-green-50 border-green-200' : 'bg-gray-50'
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