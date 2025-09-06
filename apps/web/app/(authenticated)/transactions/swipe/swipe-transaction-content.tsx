'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { SwipeTransactionPage } from '@/components/swipe-transaction-page'

export function SwipeTransactionContent() {
  const router = useRouter()

  return (
    <SwipeTransactionPage
      onBack={() => {
        router.push('/transactions')
      }}
      onUpdate={() => {
        router.refresh()
      }}
    />
  )
} 