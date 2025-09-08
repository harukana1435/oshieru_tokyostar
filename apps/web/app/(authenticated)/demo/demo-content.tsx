'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { 
  TestTube, 
  Plus, 
  Trash2, 
  Calendar,
  DollarSign,
  CreditCard,
  Settings,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  ArrowDownWideNarrow
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  purpose: string
  memo: string
  sign: 'in' | 'out'
  accountKind: 'life' | 'oshi'
  eventAt: string
  createdAt: string
}

// デモ用のサンプルデータ（フォールバック用）
const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-1',
    amount: 50000,
    purpose: '給与',
    memo: '月給',
    sign: 'in',
    accountKind: 'life',
    eventAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    amount: 15000,
    purpose: '推し活',
    memo: 'ライブチケット',
    sign: 'out',
    accountKind: 'oshi',
    eventAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-3',
    amount: 8000,
    purpose: '食費',
    memo: 'スーパーでの買い物',
    sign: 'out',
    accountKind: 'life',
    eventAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'demo-4',
    amount: 3000,
    purpose: 'グッズ',
    memo: '推しのグッズ購入',
    sign: 'out',
    accountKind: 'oshi',
    eventAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'demo-5',
    amount: 12000,
    purpose: '光熱費',
    memo: '電気代',
    sign: 'out',
    accountKind: 'life',
    eventAt: new Date(Date.now() - 345600000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString()
  }
]

export function DemoContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterAccountType, setFilterAccountType] = useState<'all' | 'life' | 'oshi'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    memo: '',
    sign: 'out' as 'in' | 'out',
    accountKind: 'life' as 'life' | 'oshi',
    eventAt: new Date().toISOString().split('T')[0]
  })

  const purposeOptions = {
    in: ['給与', '副収入', 'その他'],
    out: ['食費', '光熱費', '交通費', '娯楽費', '推し活', 'その他']
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        setError('ユーザー情報が見つかりません')
        setTransactions(DEMO_TRANSACTIONS) // フォールバック
        return
      }

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        setError('APIのURLが設定されていません。')
        setTransactions(DEMO_TRANSACTIONS)
        return
      }
      
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'

      console.log('Fetching transactions with:', {
        apiUrl: `${apiUrl}/transactions`,
        userEmail: correctEmail,
        sessionId: sessionId ? 'present' : 'missing'
      })

      const response = await fetch(`${apiUrl}/transactions`, {
        method: 'POST', // GETからPOSTに変更
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail
        },
        body: JSON.stringify({}) // POSTリクエストのため空のbodyを追加
      })

      console.log('API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        
        if (data.success && data.data && data.data.transactions) {
          if (data.data.transactions.length > 0) {
            console.log('Using API data:', data.data.transactions.length, 'transactions')
            setTransactions(data.data.transactions)
          } else {
            console.log('API returned empty data, using demo data')
            setTransactions(DEMO_TRANSACTIONS)
          }
        } else {
          console.log('API response format error, using demo data')
          setTransactions(DEMO_TRANSACTIONS)
        }
      } else {
        console.log('API request failed, using demo data')
        setError(`API request failed: ${response.status}`)
        setTransactions(DEMO_TRANSACTIONS)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setError('取引データの取得に失敗しました')
      setTransactions(DEMO_TRANSACTIONS) // フォールバック
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        setError('ユーザー情報が見つかりません')
        return
      }

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'

      const transactionData = {
        ...formData,
        amount: parseInt(formData.amount),
        eventAt: new Date(formData.eventAt).toISOString()
      }

      console.log('Creating transaction:', transactionData)

      const response = await fetch(`${apiUrl}/transactions/demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail
        },
        body: JSON.stringify(transactionData)
      })

      console.log('Create transaction response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Create transaction response data:', data)
        
        if (data.success) {
          setFormData({
            amount: '',
            purpose: '',
            memo: '',
            sign: 'out',
            accountKind: 'life',
            eventAt: new Date().toISOString().split('T')[0]
          })
          setShowForm(false)
          
          // 取引作成後にデータを再取得
          setTimeout(async () => {
            await fetchTransactions()
          }, 1000)
        } else {
          setError('取引の作成に失敗しました')
        }
      } else {
        setError('取引の作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create transaction:', error)
      setError('取引の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        setError('ユーザー情報が見つかりません')
        return
      }

      const user = JSON.parse(currentUser)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev'
      const sessionId = localStorage.getItem('sessionId')
      const correctEmail = user.email || localStorage.getItem('userEmail') || 'customer1@oshieru.com'

      console.log('Deleting transaction:', id)

      const response = await fetch(`${apiUrl}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
          'X-User-Email': correctEmail
        }
      })

      console.log('Delete transaction response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Delete transaction response data:', data)
        
        if (data.success) {
          // 削除後にデータを再取得
          setTimeout(async () => {
            await fetchTransactions()
          }, 1000)
        } else {
          setError('取引の削除に失敗しました')
        }
      } else {
        setError('取引の削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      setError('取引の削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      if (filterAccountType === 'all') return true
      return transaction.accountKind === filterAccountType
    })
    .sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        comparison = new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime()
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-full mx-auto lg:max-w-6xl xl:max-w-7xl">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">取引デモ</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    デモモード
                  </span>
                  <span className="text-sm text-gray-600">実際の取引を体験できます</span>
                </div>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-8">
            {/* 左側: 取引作成フォーム */}
            <div className="xl:w-1/3 xl:flex-shrink-0">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    取引作成
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!showForm ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">新しい取引を作成</h3>
                      <p className="text-gray-600 mb-6">収入や支出を記録して、<br />家計管理を体験してみましょう</p>
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        取引を作成
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="金額を入力"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">目的</label>
                        <select
                          value={formData.purpose}
                          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">目的を選択</option>
                          {purposeOptions[formData.sign].map((purpose) => (
                            <option key={purpose} value={purpose}>{purpose}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                        <input
                          type="text"
                          value={formData.memo}
                          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="メモを入力"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">収支</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFormData({ ...formData, sign: 'in' })}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                              formData.sign === 'in' 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            収入
                          </button>
                          <button
                            onClick={() => setFormData({ ...formData, sign: 'out' })}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                              formData.sign === 'out' 
                                ? 'bg-red-100 text-red-800 border border-red-300' 
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            支出
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">口座</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFormData({ ...formData, accountKind: 'life' })}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                              formData.accountKind === 'life' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            生活
                          </button>
                          <button
                            onClick={() => setFormData({ ...formData, accountKind: 'oshi' })}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                              formData.accountKind === 'oshi' 
                                ? 'bg-pink-100 text-pink-800 border border-pink-300' 
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            推し活
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                        <input
                          type="date"
                          value={formData.eventAt}
                          onChange={(e) => setFormData({ ...formData, eventAt: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={createTransaction}
                          disabled={!formData.amount || !formData.purpose}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          作成
                        </Button>
                        <Button 
                          onClick={() => setShowForm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右側: 取引履歴 */}
            <div className="xl:flex-1">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      取引履歴
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                        {filteredTransactions.length}件
                      </span>
                    </CardTitle>
                    <Button 
                      onClick={fetchTransactions}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      更新
                    </Button>
                  </div>
                  
                  {/* フィルター・ソート */}
                  <div className="flex flex-col space-y-1.5 p-4 md:p-6 pb-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">口座:</span>
                        <div className="flex rounded-lg border overflow-hidden">
                          <button
                            onClick={() => setFilterAccountType('all')}
                            className={`inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target shadow-normal hover:shadow-strong h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-none border-0 ${
                              filterAccountType === 'all' 
                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                            }`}
                          >
                            全て
                          </button>
                          <button
                            onClick={() => setFilterAccountType('life')}
                            className={`inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target shadow-normal hover:shadow-strong h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-none border-x border-y-0 ${
                              filterAccountType === 'life' 
                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                            }`}
                          >
                            生活
                          </button>
                          <button
                            onClick={() => setFilterAccountType('oshi')}
                            className={`inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target shadow-normal hover:shadow-strong h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-none border-0 ${
                              filterAccountType === 'oshi' 
                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                            }`}
                          >
                            推し活
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                        <button
                          onClick={() => setSortBy('date')}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target shadow-normal hover:shadow-strong h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm ${
                              sortBy === 'date' 
                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-gray-900' 
                                : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                            }`}
                        >
                          日付順
                        </button>
                        <button
                          onClick={() => setSortBy('amount')}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target shadow-normal hover:shadow-strong h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm ${
                              sortBy === 'amount' 
                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-gray-900' 
                                : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                            }`}
                        >
                          金額順
                        </button>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target shadow-normal hover:shadow-strong h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm ${
                              sortOrder === 'desc' 
                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-gray-900' 
                                : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                            }`}
                        >
                          <ArrowDownWideNarrow className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">取引がありません</h3>
                      <p className="text-gray-600 mb-6">新しい取引を作成して開始しましょう</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.sign === 'in' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.sign === 'in' ? (
                                <DollarSign className="w-5 h-5" />
                              ) : (
                                <CreditCard className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{transaction.purpose}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  transaction.accountKind === 'life' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {transaction.accountKind === 'life' ? '生活' : '推し活'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{transaction.memo}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.eventAt).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-lg font-semibold ${
                              transaction.sign === 'in' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.sign === 'in' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
