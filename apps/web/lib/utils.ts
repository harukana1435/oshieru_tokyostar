import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'safety-score-excellent'
  if (score >= 60) return 'safety-score-good'
  if (score >= 40) return 'safety-score-warning'
  return 'safety-score-danger'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'とても安心'
  if (score >= 60) return '安心'
  if (score >= 40) return '注意'
  return '危険'
} 