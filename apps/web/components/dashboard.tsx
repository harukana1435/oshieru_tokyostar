'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, getScoreColor } from '@/lib/utils'
import { AccountDetailsModal } from './account-details-modal'
import { TransactionEditModal } from './transaction-edit-modal'

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

export function Dashboard({ onLogout }: DashboardProps) {
  const [data, setData] = useState(mockDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

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
          
          // 実際のAPIからダッシュボードデータを取得（将来の実装用）
          // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
          // const response = await fetch(`${apiUrl}/dashboard`, {
          //   headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionId')}` }
          // })
          
                     // 現在はユーザー情報を使ってモックデータを更新
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
                 balanceCached: user.lifeBalance,
                 createdAt: new Date('2024-01-01'),
               },
               {
                 id: `acc_oshi_${user.id.split('_')[1]}`,
                 userId: user.id,
                 kind: 'oshi',
                 name: '推し活口座',
                 balanceCached: user.oshiBalance,
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
  }, [])

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

  const handleTransactionUpdate = (updatedTransaction: any) => {
    // 取引データを更新（実際のAPIコールの代わりにローカル状態を更新）
    setData(prevData => ({
      ...prevData,
      recentTransactions: prevData.recentTransactions.map(tx => 
        tx.id === updatedTransaction.id ? updatedTransaction : tx
      )
    }))
    
    // 実際の実装では、ここでAPIを呼び出してサーバーのデータを更新
    console.log('Transaction updated:', updatedTransaction)
  }

  const lifeAccount = data.accounts.find(acc => acc.kind === 'life')
  const oshiAccount = data.accounts.find(acc => acc.kind === 'oshi')

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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            こんにちは、{data.user.displayName}さん
          </h2>
          <p className="text-muted-foreground">
            今日も健康的な推し活を楽しみましょう！
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>

      {/* 推し活安心度スコア */}
      {data.latestScore && (
        <Card className={`oshi-card ${getScoreColor(data.latestScore.score)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>推し活安心度スコア</span>
              <span className="text-3xl font-bold">
                {data.latestScore.score}点
              </span>
            </CardTitle>
            <CardDescription>
              現在のステータス: <strong>{data.latestScore.label}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">収入比率</p>
                <p>{data.latestScore.factors.incomeRatio.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {data.latestScore.factors.incomeRatioScore}点
                </p>
              </div>
              <div>
                <p className="font-medium">余剰金比率</p>
                <p>{data.latestScore.factors.surplusRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {data.latestScore.factors.surplusScore}点
                </p>
              </div>
              <div>
                <p className="font-medium">推奨額適合</p>
                <p>{data.latestScore.factors.recommendedDeviation.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {data.latestScore.factors.recommendedAmountScore}点
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 口座残高 */}
      <div className="grid md:grid-cols-2 gap-6">
        {lifeAccount && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAccount(lifeAccount)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>💰 {lifeAccount.name}</span>
                <span className="text-lg">
                  {formatCurrency(lifeAccount.balanceCached)}
                </span>
              </CardTitle>
              <CardDescription>
                日常の収入・支出を管理
              </CardDescription>
              <p className="text-xs text-blue-600 mt-2">
                📊 詳細を見る
              </p>
            </CardHeader>
          </Card>
        )}

        {oshiAccount && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAccount(oshiAccount)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>✨ {oshiAccount.name}</span>
                <span className="text-lg">
                  {formatCurrency(oshiAccount.balanceCached)}
                </span>
              </CardTitle>
              <CardDescription>
                推し活専用の予算管理
              </CardDescription>
              <p className="text-xs text-blue-600 mt-2">
                📊 詳細を見る
              </p>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* 最近の取引 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 最近の取引</CardTitle>
          <CardDescription>
            自動振り分けと保留中の取引
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentTransactions.map((transaction) => (
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
                  <Button variant="outline" size="sm">
                    利用する
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
    </div>
  )
} 