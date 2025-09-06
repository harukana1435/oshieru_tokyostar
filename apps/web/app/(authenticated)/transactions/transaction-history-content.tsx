'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { TransactionHistoryPage } from '@/components/transaction-history-page'

export function TransactionHistoryContent() {
  const router = useRouter()

  return (
    <TransactionHistoryPage
      onSwipeMode={() => {
        router.push('/transactions/swipe')
      }}
      onBatchCategorization={() => {
        router.push('/transactions/batch')
      }}
    />
  )
} 