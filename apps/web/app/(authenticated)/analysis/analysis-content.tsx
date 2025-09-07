'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/utils'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  DollarSign,
  PiggyBank,
  Heart,
  BarChart3,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react'

interface AnalysisData {
  score: {
    total: number
    label: string
    factors: any
    breakdown: {
      incomeRatioScore: number
      surplusScore: number
      recommendedAmountScore: number
    }
  }
  accounts: {
    totalBalance: number
    life: any
    oshi: any
  }
  summary: {
    totalTransactions: number
    oshiExpenses: number
    lifeExpenses: number
    income: number
  }
}

export function AnalysisContent() {
  const [loading, setLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [ragAnalysis, setRagAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
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
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'

      const response = await fetch(`${apiUrl}/dashboard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalysisData({
            score: {
              total: data.data.latestScore?.score || 0,
              label: data.data.latestScore?.label || '評価中',
              factors: data.data.latestScore?.factors || {},
              breakdown: data.data.latestScore?.breakdown || {
                incomeRatioScore: 0,
                surplusScore: 0,
                recommendedAmountScore: 0
              }
            },
            accounts: {
              totalBalance: data.data.totalBalance || 0,
              life: data.data.accounts?.find((acc: any) => acc.kind === 'life'),
              oshi: data.data.accounts?.find((acc: any) => acc.kind === 'oshi')
            },
            summary: {
              totalTransactions: data.data.recentTransactions?.length || 0,
              oshiExpenses: data.data.recentTransactions?.filter((tx: any) => 
                tx.sign === 'out' && tx.accountKind === 'oshi'
              ).reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0,
              lifeExpenses: data.data.recentTransactions?.filter((tx: any) => 
                tx.sign === 'out' && tx.accountKind === 'life'
              ).reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0,
              income: data.data.recentTransactions?.filter((tx: any) => 
                tx.sign === 'in' && tx.purpose === 'salary'
              ).reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch analysis data:', error)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const performRagAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = currentUser.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'
      
      const response = await fetch(`${apiUrl}/analysis/rag-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('RAG analysis response:', data)
        if (data.success) {
          setRagAnalysis(data.analysis)
        } else {
          console.error('RAG analysis failed:', data)
          setError(data.error || 'Analysis failed')
        }
      } else {
        const errorText = await response.text()
        console.error('RAG analysis HTTP error:', response.status, errorText)
        setError(`分析の実行に失敗しました (${response.status})`)
      }
    } catch (error) {
      console.error('RAG analysis error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">データの読み込みに失敗しました</h2>
        <p className="text-gray-600 mb-4">しばらく時間をおいて再度お試しください</p>
        <Button onClick={fetchAnalysisData}>再読み込み</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">スコア分析</h1>
        <p className="text-gray-600">推し活安心度スコアの詳細分析とAIによる個人分析</p>
      </div>

      {/* スコア概要 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              総合スコア
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {analysisData.score.total}
                <span className="text-lg text-gray-500">/100</span>
              </div>
              <div className="text-lg font-medium text-green-600 mb-4">
                {analysisData.score.label}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysisData.score.total}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              スコア内訳
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">収入比率スコア</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(analysisData.score.breakdown.incomeRatioScore / 40) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-16 text-right">
                    {analysisData.score.breakdown.incomeRatioScore}/40
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">余剰金スコア</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(analysisData.score.breakdown.surplusScore / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-16 text-right">
                    {analysisData.score.breakdown.surplusScore}/30
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">推奨額適合スコア</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(analysisData.score.breakdown.recommendedAmountScore / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-16 text-right">
                    {analysisData.score.breakdown.recommendedAmountScore}/30
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 支出分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              収支サマリー（直近3ヶ月）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">収入</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(analysisData.summary.income)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">推し活支出</span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(analysisData.summary.oshiExpenses)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">生活支出</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(analysisData.summary.lifeExpenses)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">推し活比率</span>
                  <span className="font-bold text-gray-900">
                    {analysisData.summary.income > 0 
                      ? `${Math.round((analysisData.summary.oshiExpenses / analysisData.summary.income) * 100)}%`
                      : '---'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-green-600" />
              現在の残高
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">総残高</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(analysisData.accounts.totalBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">生活口座</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(analysisData.accounts.life?.balanceCached || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">推し活口座</span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(analysisData.accounts.oshi?.balanceCached || 0)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">取引回数</span>
                  <span className="font-bold text-gray-900">
                    {analysisData.summary.totalTransactions}件
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI推し活分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!ragAnalysis && !isAnalyzing && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                個人分析を開始
              </h3>
              <p className="text-gray-600 mb-6">
                あなたの推し活パターンをAIが詳しく分析し、<br />
                個別のアドバイスを提供します。
              </p>
              <Button
                onClick={performRagAnalysis}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI分析を開始
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                分析中...
              </h3>
              <p className="text-gray-600">
                AIがあなたの推し活データを詳しく分析しています
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                エラーが発生しました
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={performRagAnalysis} variant="outline">
                再試行
              </Button>
            </div>
          )}

          {ragAnalysis && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                  {ragAnalysis}
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <Button
                  onClick={performRagAnalysis}
                  variant="outline"
                  size="sm"
                >
                  再分析
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 