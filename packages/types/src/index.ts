import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// Account schemas
export const accountKindSchema = z.enum(['life', 'oshi']);
export const accountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  kind: accountKindSchema,
  name: z.string(),
  balanceCached: z.number(),
  createdAt: z.date(),
});

export type AccountKind = z.infer<typeof accountKindSchema>;
export type Account = z.infer<typeof accountSchema>;

// Transaction schemas
export const transactionSignSchema = z.enum(['in', 'out']);
export const transactionPurposeSchema = z.enum([
  'salary',
  'ticket',
  'goods',
  'event',
  'food',
  'rent',
  'utilities',
  'transport',
  'other'
]);

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  amount: z.number().positive(),
  sign: transactionSignSchema,
  purpose: transactionPurposeSchema,
  memo: z.string().optional(),
  originalDescription: z.string().optional(),
  isAutoCategorized: z.boolean().default(false),
  isPending: z.boolean().default(false),
  canEdit: z.boolean().default(true),
  originalCode: z.number().optional(),
  eventAt: z.date(),
  createdAt: z.date(),
});

export type TransactionSign = z.infer<typeof transactionSignSchema>;
export type TransactionPurpose = z.infer<typeof transactionPurposeSchema>;
export type Transaction = z.infer<typeof transactionSchema>;

// Score schemas
export const scoreFactorsSchema = z.object({
  incomeRatioScore: z.number(),
  surplusScore: z.number(),
  recommendedAmountScore: z.number(),
  incomeRatio: z.number(),
  surplusRatio: z.number(),
  recommendedDeviation: z.number(),
});

export const scoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  score: z.number().min(0).max(100),
  label: z.string(),
  snapshotAt: z.date(),
  factors: scoreFactorsSchema,
});

export type ScoreFactors = z.infer<typeof scoreFactorsSchema>;
export type Score = z.infer<typeof scoreSchema>;

// Reward schemas
export const rewardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  minScore: z.number().min(0).max(100),
  termsUrl: z.string().url().optional(),
  active: z.boolean(),
});

export const userRewardStatusSchema = z.enum(['eligible', 'redeemed']);
export const userRewardSchema = z.object({
  id: z.string(),
  userId: z.string(),
  rewardId: z.string(),
  status: userRewardStatusSchema,
  updatedAt: z.date(),
});

export type Reward = z.infer<typeof rewardSchema>;
export type UserRewardStatus = z.infer<typeof userRewardStatusSchema>;
export type UserReward = z.infer<typeof userRewardSchema>;

// API request/response schemas
export const createTransactionRequestSchema = z.object({
  accountId: z.string(),
  amount: z.number().positive(),
  sign: transactionSignSchema,
  purpose: transactionPurposeSchema,
  memo: z.string().optional(),
});

export const scoreCalculationRequestSchema = z.object({
  userId: z.string(),
  income: z.number().positive(),
  oshiExpense: z.number().min(0),
  essentialExpense: z.number().min(0),
  recommendedAmount: z.number().min(0),
});

export const scoreCalculationResponseSchema = z.object({
  score: z.number().min(0).max(100),
  factors: scoreFactorsSchema,
  label: z.string(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;
export type ScoreCalculationRequest = z.infer<typeof scoreCalculationRequestSchema>;
export type ScoreCalculationResponse = z.infer<typeof scoreCalculationResponseSchema>;

// Dashboard data schemas
export const dashboardDataSchema = z.object({
  user: userSchema,
  accounts: z.array(accountSchema),
  latestScore: scoreSchema.optional(),
  recentTransactions: z.array(transactionSchema),
  availableRewards: z.array(rewardSchema),
  userRewards: z.array(userRewardSchema),
});

export type DashboardData = z.infer<typeof dashboardDataSchema>;

// Analysis schemas
export const analysisDataSchema = z.object({
  totalIncome: z.number(),
  totalOshiExpense: z.number(),
  oshiRatio: z.number(),
  monthlyBreakdown: z.array(z.object({
    month: z.string(),
    income: z.number(),
    oshiExpense: z.number(),
    ratio: z.number(),
  })),
  categoryBreakdown: z.array(z.object({
    purpose: transactionPurposeSchema,
    amount: z.number(),
    percentage: z.number(),
  })),
});

export type AnalysisData = z.infer<typeof analysisDataSchema>; 