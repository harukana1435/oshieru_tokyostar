'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Hand, Sparkles } from 'lucide-react'

interface PendingTransaction {
  id: string
  accountId: string
  amount: number
  sign: 'in' | 'out'
  purpose: string
  memo: string
  originalDescription: string
  isAutoCategorized: boolean
  isPending: boolean
  canEdit: boolean
  originalCode?: number
  eventAt: Date
  createdAt: Date
  accountName: string
  accountKind: 'life' | 'oshi'
}

interface SwipeTransactionPageProps {
  onBack: () => void
  onUpdate?: () => void
}

export function SwipeTransactionPage({ onBack, onUpdate }: SwipeTransactionPageProps) {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [swipeCompleted, setSwipeCompleted] = useState(false)
  const [completedDirection, setCompletedDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const loadPendingTransactions = async () => {
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
            createdAt: new Date(tx.createdAt)
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

  const resetDragState = () => {
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    setSwipeDirection(null)
    setSwipeCompleted(false)
    setCompletedDirection(null)
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= transactions.length || isProcessing) return

    const transaction = transactions[currentIndex]
    const purpose = direction === 'right' ? 'goods' : 'other'
    const accountType = direction === 'right' ? 'oshi' : 'life'

    // スワイプ完了エフェクトを開始
    setSwipeCompleted(true)
    setCompletedDirection(direction)
    setIsProcessing(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const response = await fetch(`${apiUrl}/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'X-User-Email': localStorage.getItem('userEmail') || ''
        },
        body: JSON.stringify({
          purpose,
          accountId: `acc_${accountType}_${transaction.accountId.split('_')[2]}`
        })
      })

      if (response.ok) {
        // 1.5秒後に次のカードに進む
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
          resetDragState()
          setIsProcessing(false)
          if (onUpdate) {
            onUpdate()
          }
        }, 1500)
      } else {
        console.error('Failed to update transaction')
        resetDragState()
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      resetDragState()
      setIsProcessing(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProcessing) return
    setIsDragging(true)
    const touch = e.touches[0]
    setStartPosition({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isProcessing) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPosition.x
    const deltaY = touch.clientY - startPosition.y
    
    setDragOffset({ x: deltaX, y: deltaY })
    
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left')
    } else {
      setSwipeDirection(null)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || isProcessing) return
    
    const threshold = 120
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left'
      handleSwipe(direction)
    } else {
      resetDragState()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isProcessing) return
    setIsDragging(true)
    setStartPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isProcessing) return
    
    const deltaX = e.clientX - startPosition.x
    const deltaY = e.clientY - startPosition.y
    
    setDragOffset({ x: deltaX, y: deltaY })
    
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left')
    } else {
      setSwipeDirection(null)
    }
  }

  const handleMouseUp = () => {
    if (!isDragging || isProcessing) return
    
    const threshold = 120
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left'
      handleSwipe(direction)
    } else {
      resetDragState()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">振り分け未完了取引を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= transactions.length) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-green-600">振り分け完了！</h2>
            <p className="text-muted-foreground mt-4 mb-8">
              すべての取引の振り分けが完了しました。<br />
              ダッシュボードで結果を確認してください。
            </p>
            <Button onClick={onBack} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3">
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTransaction = transactions[currentIndex]
  const remainingCount = transactions.length - currentIndex

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      {/* スマホ用戻るボタン（左上固定） */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={onBack}
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Hand className="w-7 h-7 text-blue-600" />
            スワイプで振り分け
          </h2>
          <p className="text-muted-foreground mt-1">
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                処理中...
              </span>
            ) : (
              `残り ${remainingCount} 件の取引を振り分けします`
            )}
          </p>
        </div>
        {/* デスクトップ用戻るボタン（右上） */}
        <Button
          onClick={onBack}
          variant="outline"
          className="hidden md:flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
      </div>

      {/* プログレスバー */}
      <div className="w-full mb-32">
        <div className="bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${(currentIndex / transactions.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">
            {currentIndex} / {transactions.length} 完了
          </span>
        </div>
      </div>

      {/* スワイプカード */}
      <div className="flex justify-center mt-8">
        <div className="relative w-full max-w-md">
          {/* 背景のヒントカード */}
          {currentIndex + 1 < transactions.length && (
            <Card className="absolute inset-0 transform scale-95 opacity-30 z-0 bg-gray-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">次の取引</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* メインカード */}
          <Card 
            ref={cardRef}
            className={`relative z-10 transform transition-transform duration-200 ${
              swipeDirection === 'left' ? 'bg-green-50 border-green-200' :
              swipeDirection === 'right' ? 'bg-purple-50 border-purple-200' :
              'bg-white'
            }`}
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x / 10}deg)`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={isDragging ? handleMouseMove : undefined}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {currentTransaction.memo || currentTransaction.originalDescription}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {formatDateTime(currentTransaction.eventAt)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    currentTransaction.sign === 'out' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentTransaction.sign === 'out' ? '-' : '+'}
                    {formatCurrency(currentTransaction.amount)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <strong>取引内容:</strong> {currentTransaction.originalDescription}
                </div>

                {/* スワイプヒント */}
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <ArrowLeft className="w-4 h-4" />
                      <span className="font-medium">生活口座</span>
                    </div>
                    <div className="text-gray-500 font-medium">
                      スワイプで選択
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span className="font-medium">推し活口座</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* スワイプ方向のフィードバック */}
                {swipeDirection && (
                  <div className={`text-center py-2 rounded-lg font-medium ${
                    swipeDirection === 'left' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {swipeDirection === 'left' ? '← 生活口座に振り分け' : '推し活口座に振り分け →'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* スワイプ完了エフェクト */}
          {swipeCompleted && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/90 rounded-lg">
              <div className={`text-center ${
                completedDirection === 'left' ? 'text-green-600' : 'text-purple-600'
              }`}>
                <div className="text-4xl mb-2">
                  {completedDirection === 'left' ? '✓' : '💜'}
                </div>
                <div className="font-bold text-lg">
                  {completedDirection === 'left' ? '生活口座' : '推し活口座'}
                </div>
                <div className="text-sm">振り分け完了</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="text-center space-y-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-medium mb-2">
            <Hand className="w-5 h-5" />
            <span>操作方法</span>
          </div>
          <div className="text-sm text-blue-600 space-y-1">
            <p>• カードを<strong>左にスワイプ</strong>で生活口座</p>
            <p>• カードを<strong>右にスワイプ</strong>で推し活口座</p>
            <p>• または下のボタンでも操作できます</p>
          </div>
        </div>
        
        {/* 代替ボタン操作 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-gray-600 mb-4 font-medium">
            または、ボタンで操作することもできます
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleSwipe('left')}
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isProcessing 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 active:scale-95'
              } flex items-center gap-3`}
              disabled={isProcessing}
            >
              <ArrowLeft className="w-5 h-5" />
              生活口座
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isProcessing 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95'
              } flex items-center gap-3`}
              disabled={isProcessing}
            >
              推し活口座
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 