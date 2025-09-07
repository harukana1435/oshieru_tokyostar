'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { X, Brain, Loader2, Sparkles } from 'lucide-react'

interface RagAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RagAnalysisModal({ isOpen, onClose }: RagAnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const performAnalysis = async () => {
    setIsLoading(true)
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
        if (data.success) {
          setAnalysis(data.analysis)
        } else {
          setError(data.error || 'Analysis failed')
        }
      } else {
        setError('Failed to perform analysis')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI推し活分析</h2>
              <p className="text-sm text-gray-600">あなたの推し活パターンを分析します</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!analysis && !isLoading && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                推し活パターン分析を開始
              </h3>
              <p className="text-gray-600 mb-6">
                直近3ヶ月の取引データとスコア情報を基に、<br />
                あなたの推し活タイプと改善提案をAIが分析します。
              </p>
              <Button
                onClick={performAnalysis}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                分析を開始する
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                分析中...
              </h3>
              <p className="text-gray-600">
                AIがあなたの推し活データを分析しています
              </p>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="text-red-600 mb-2">⚠️ エラーが発生しました</div>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={performAnalysis}
                  variant="outline"
                  className="mt-4"
                >
                  再試行
                </Button>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI分析結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysis}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <Button
                    onClick={performAnalysis}
                    variant="outline"
                    size="sm"
                  >
                    再分析
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 