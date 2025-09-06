'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency } from '@/lib/utils'

interface ScoreBreakdown {
  income: number
  oshiExpense: number
  essentialExpense: number
  recommendedAmount: number
  surplus: number
  incomeRatioPercent: number
  surplusRatioValue: number
  deviationPercent: number
}

interface ScoreFactors {
  incomeRatioScore: number
  surplusScore: number
  recommendedAmountScore: number
  incomeRatio: number
  surplusRatio: number
  recommendedDeviation: number
}

interface ScoreBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
  label: string
  factors: ScoreFactors
  breakdown: ScoreBreakdown
  analysisData?: any
  spendingAnalysis?: any
  aiRecommendations?: string[]
}

export function ScoreBreakdownModal({ 
  isOpen, 
  onClose, 
  score, 
  label, 
  factors, 
  breakdown, 
  analysisData,
  spendingAnalysis,
  aiRecommendations 
}: ScoreBreakdownModalProps) {
  if (!isOpen) return null

  const getScoreColor = (score: number) => {
    if (score >= 30) return 'text-green-600 bg-green-50'
    if (score >= 20) return 'text-yellow-600 bg-yellow-50'
    if (score >= 10) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getTotalScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
    if (score >= 60) return 'text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300'
    if (score >= 40) return 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300'
    return 'text-red-700 bg-gradient-to-r from-red-100 to-rose-100 border-red-300'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl">
        <CardHeader className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📊 スコア計算内訳
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                実際の取引データに基づく詳細な分析結果
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
          {/* 総合スコア */}
          <div className={`p-6 rounded-xl border-2 mb-6 ${getTotalScoreColor(score)}`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{score}点</h2>
              <p className="text-xl font-semibold">{label}</p>
              {analysisData && (
                <p className="text-sm mt-2 opacity-75">
                  分析期間: {new Date(analysisData.analysisDate).toLocaleDateString('ja-JP')} 以降
                  （{analysisData.transactionCount}件の取引を分析）
                </p>
              )}
            </div>
          </div>

          {/* 分析データサマリー */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl border border-blue-200">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700">月収入</p>
                <p className="text-lg font-bold text-blue-800">{formatCurrency(breakdown.income)}</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200">
              <div className="text-center">
                <p className="text-sm font-medium text-purple-700">推し活支出</p>
                <p className="text-lg font-bold text-purple-800">{formatCurrency(breakdown.oshiExpense)}</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200">
              <div className="text-center">
                <p className="text-sm font-medium text-orange-700">生活必需品</p>
                <p className="text-lg font-bold text-orange-800">{formatCurrency(breakdown.essentialExpense)}</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
              <div className="text-center">
                <p className="text-sm font-medium text-green-700">余剰金</p>
                <p className="text-lg font-bold text-green-800">{formatCurrency(breakdown.surplus)}</p>
              </div>
            </div>
          </div>

          {/* スコア内訳 */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🔍</span> スコア内訳詳細
            </h3>

            {/* 収入比率スコア */}
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800">1. 収入比率スコア</h4>
                <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(factors.incomeRatioScore)}`}>
                  {factors.incomeRatioScore}/40点
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">推し活支出が収入に占める割合</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">計算式:</span> {formatCurrency(breakdown.oshiExpense)} ÷ {formatCurrency(breakdown.income)} = {breakdown.incomeRatioPercent}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  • 20%以下: 40点 • 30%以下: 30点 • 40%以下: 20点 • それ以上: 10点
                </p>
              </div>
            </div>

            {/* 余剰金スコア */}
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800">2. 余剰金スコア</h4>
                <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(factors.surplusScore)}`}>
                  {factors.surplusScore}/30点
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">余剰金に対する推し活支出の割合</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">余剰金:</span> {formatCurrency(breakdown.income)} - {formatCurrency(breakdown.essentialExpense)} = {formatCurrency(breakdown.surplus)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">比率:</span> {formatCurrency(breakdown.oshiExpense)} ÷ {formatCurrency(breakdown.surplus)} = {breakdown.surplusRatioValue}倍
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  • 1.0倍以下: 30点 • 1.2倍以下: 20点 • 1.5倍以下: 10点 • それ以上: 0点
                </p>
              </div>
            </div>

            {/* 推奨額適合スコア */}
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800">3. 推奨額適合スコア</h4>
                <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(factors.recommendedAmountScore)}`}>
                  {factors.recommendedAmountScore}/30点
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">推奨推し活額からの乖離度</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">推奨額:</span> {formatCurrency(breakdown.recommendedAmount)} (収入の20%)
                </p>
                <p className="text-sm">
                  <span className="font-medium">乖離:</span> {breakdown.deviationPercent}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  • 10%以内: 30点 • 20%以内: 20点 • 50%以内: 10点 • それ以上: 0点
                </p>
              </div>
            </div>
          </div>

          {/* 支出パターン分析 */}
          {spendingAnalysis && (
            <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <span>📈</span> 支出パターン分析
              </h3>
              
              {spendingAnalysis.patterns && spendingAnalysis.patterns.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-700 mb-2">検出されたパターン:</h4>
                  <ul className="space-y-1 text-sm text-purple-600">
                    {spendingAnalysis.patterns.map((pattern: string, index: number) => (
                      <li key={index}>• {pattern}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {spendingAnalysis.insights && spendingAnalysis.insights.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-700 mb-2">詳細分析:</h4>
                  <ul className="space-y-1 text-sm text-purple-600">
                    {spendingAnalysis.insights.map((insight: string, index: number) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {spendingAnalysis.categoryBreakdown && Object.keys(spendingAnalysis.categoryBreakdown).length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {Object.entries(spendingAnalysis.categoryBreakdown).map(([category, amount]: [string, any]) => (
                    <div key={category} className="p-3 bg-white/70 rounded-lg">
                      <p className="text-xs font-medium text-purple-700">
                        {category === 'ticket' ? 'チケット' : 
                         category === 'goods' ? 'グッズ' : 
                         category === 'event' ? 'イベント' : category}
                      </p>
                      <p className="text-sm font-bold text-purple-800">{formatCurrency(amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI推奨事項 */}
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span>🤖</span> AI推奨事項
            </h3>
            <div className="space-y-3 text-sm text-blue-700">
              {aiRecommendations && aiRecommendations.length > 0 ? (
                aiRecommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="p-3 bg-white/60 rounded-lg border-l-4 border-blue-300">
                    <p>{recommendation}</p>
                  </div>
                ))
              ) : (
                <>
                  {score < 60 && (
                    <>
                      {factors.incomeRatioScore < 30 && (
                        <p>• 収入に対する推し活支出の割合が高めです。月収の20%以内に抑えることを推奨します。</p>
                      )}
                      {factors.surplusScore < 20 && (
                        <p>• 余剰金に対する推し活支出が多めです。生活費を見直して余剰金を増やしましょう。</p>
                      )}
                      {factors.recommendedAmountScore < 20 && (
                        <p>• 推奨額と実際の支出に大きな差があります。計画的な推し活予算を立てることをお勧めします。</p>
                      )}
                    </>
                  )}
                  {score >= 60 && (
                    <p>• とても良いバランスです！この調子で健康的な推し活を続けましょう。</p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 