'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, getScoreColor } from '@/lib/utils'

// モックデータ（実際のAPIからの取得をシミュレート）
const mockDashboardData = {
  user: {
    id: 'user_demo',
    email: 'demo@oshieru.com',
    displayName: '推し活太郎',
    createdAt: new Date('2024-01-01'),
  },
  accounts: [
    {
      id: 'acc_life_demo',
      userId: 'user_demo',
      kind: 'life',
      name: '生活口座',
      balanceCached: 250000,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'acc_oshi_demo',
      userId: 'user_demo',
      kind: 'oshi',
      name: '推し活口座',
      balanceCached: 45000,
      createdAt: new Date('2024-01-01'),
    },
  ],
  latestScore: {
    id: 'score_1',
    userId: 'user_demo',
    score: 75,
    label: '安心',
    snapshotAt: new Date('2024-02-01'),
    factors: {
      incomeRatioScore: 30,
      surplusScore: 25,
      recommendedAmountScore: 20,
      incomeRatio: 16.67,
      surplusRatio: 0.83,
      recommendedDeviation: 25.0,
    },
  },
  recentTransactions: [
    {
      id: 'tx_ticket_1',
      accountId: 'acc_oshi_demo',
      amount: 8000,
      sign: 'out',
      purpose: 'ticket',
      memo: 'ライブチケット',
      eventAt: new Date('2024-01-28'),
      accountName: '推し活口座',
      accountKind: 'oshi',
    },
    {
      id: 'tx_goods_1',
      accountId: 'acc_oshi_demo',
      amount: 3500,
      sign: 'out',
      purpose: 'goods',
      memo: 'グッズ購入',
      eventAt: new Date('2024-01-30'),
      accountName: '推し活口座',
      accountKind: 'oshi',
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

export function Dashboard() {
  const [data, setData] = useState(mockDashboardData)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('userEmail')
    window.location.reload()
  }

  const lifeAccount = data.accounts.find(acc => acc.kind === 'life')
  const oshiAccount = data.accounts.find(acc => acc.kind === 'oshi')

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
          <Card>
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
            </CardHeader>
          </Card>
        )}

        {oshiAccount && (
          <Card>
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
            </CardHeader>
          </Card>
        )}
      </div>

      {/* 最近の取引 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 最近の取引</CardTitle>
          <CardDescription>
            直近の推し活関連取引
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{transaction.memo}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.eventAt.toLocaleDateString('ja-JP')} • {transaction.accountName}
                  </p>
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
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
} 