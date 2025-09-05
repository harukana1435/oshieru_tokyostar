# 推しエール口座 プロトタイプ

健康的に推し活を続けるための口座管理アプリケーションです。AI による推し活安心度スコア算出機能を搭載し、ユーザーが無理のない範囲で推し活を楽しめるよう支援します。

## 🏗️ アーキテクチャ

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **バックエンド**: Cloudflare Workers (Hono + TypeScript)  
- **スコア計算**: Cloudflare Workers (Python)
- **データベース**: Cloudflare D1 (SQLite) + drizzle-orm
- **ホスティング**: Cloudflare Pages (フロントエンド) + Cloudflare Workers (API)
- **モノレポ**: pnpm + Turborepo

## 📁 プロジェクト構成

```
repo/
├── apps/
│   ├── web/                 # Next.js フロントエンド
│   ├── api/                 # Hono API Worker
│   └── score/               # Python スコア計算 Worker
├── packages/
│   ├── types/               # 共通型定義 (Zod スキーマ)
│   ├── db/                  # drizzle-orm スキーマ & マイグレーション
│   └── config/              # 共通設定
├── infra/cf/               # Cloudflare 設定ファイル
└── docs/                   # ドキュメント
```

## ✨ 主要機能

### 📊 推し活安心度スコア
- **収入比率スコア** (40点): 推し活費用が収入に対して適切な割合かを判定
- **余剰金スコア** (30点): 生活必需支出を差し引いた余剰金の範囲内かを判定  
- **推奨額適合スコア** (30点): システム推奨額との乖離度を評価

### 🤖 インテリジェント取引管理
- **自動振り分け**: 給与・電気料金等は自動でカテゴリ分類
- **保留グループ**: クレジットカード・振込等は手動振り分け待ち
- **編集機能**: 全ての取引の用途をユーザーが後から編集可能
- **実データ対応**: 3人の実際の顧客データ（178件の取引履歴）

### 💰 口座管理
- **生活口座**: 日常の収入・支出管理
- **推し活口座**: 推し活専用の予算管理
- **取引履歴**: 目的別の支出記録・分析

### 🎁 特典システム
- スコアに応じた会員ランク
- 限定オンラインショップアクセス
- 低金利ローン・分割払い優遇
- 荷物預かりサービス

### 📱 モバイル対応
- スマートフォン優先のレスポンシブデザイン
- タッチ操作に最適化されたUI/UX

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
# pnpm をインストール (未インストールの場合)
npm install -g pnpm

# 依存関係をインストール
pnpm install
```

### 2. Cloudflare 設定

#### D1 データベース作成
```bash
# D1 データベースを作成
wrangler d1 create oshieru-db

# データベース ID を wrangler.toml に設定
# infra/cf/wrangler.toml の database_id を更新
```

#### KV ネームスペース作成
```bash
# KV ネームスペースを作成
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview

# ネームスペース ID を wrangler.toml に設定
```

### 3. データベースマイグレーション

```bash
# スキーマ生成
pnpm db:generate

# マイグレーション実行
pnpm db:migrate

# サンプルデータ投入（オプション）
cd packages/db && node -e "
import('./seed.ts').then(async ({ seedDatabase }) => {
  const { drizzle } = await import('drizzle-orm/d1');
  // D1 データベース接続設定が必要
  console.log('Seed script ready - manual execution required');
});
"
```

### 4. 開発サーバー起動

```bash
# すべてのアプリを同時起動
pnpm dev

# 個別起動の場合
pnpm --filter @oshieru/web dev      # Next.js (localhost:3000)
pnpm --filter @oshieru/api dev      # API Worker (localhost:8787)
```

## 🔧 開発コマンド

```bash
# ビルド
pnpm build

# 型チェック
pnpm type-check

# リンター
pnpm lint

# データベース操作
pnpm db:generate    # スキーマ生成
pnpm db:migrate     # マイグレーション
pnpm db:studio      # データベース管理画面
```

## 🚢 デプロイ

### Cloudflare Workers (API)
```bash
cd apps/api
wrangler deploy --env api
```

### Cloudflare Workers (スコア計算)
```bash
cd apps/score
wrangler deploy --env score
```

### Cloudflare Pages (フロントエンド)
1. GitHub リポジトリを Cloudflare Pages に連携
2. ビルド設定:
   - **Framework preset**: Next.js
   - **Build command**: `cd apps/web && npm run build`
   - **Build output directory**: `apps/web/.next`

## 📊 推し活安心度スコア仕様

詳細な計算ロジックは [`oshikatu_safety_score.md`](./oshikatu_safety_score.md) を参照してください。

### スコア構成
- **総合スコア**: 0-100点
- **評価ラベル**: 
  - 80点以上: "とても安心"
  - 60-79点: "安心"  
  - 40-59点: "注意"
  - 39点以下: "危険"

## 🎯 API エンドポイント

### 認証
- `POST /auth/login` - ログイン
- `GET /auth/me` - ユーザー情報取得
- `POST /auth/logout` - ログアウト

### 口座管理  
- `GET /accounts` - 口座一覧
- `POST /accounts` - 口座作成
- `GET /accounts/:id` - 口座詳細

### 取引管理
- `GET /transactions` - 取引履歴
- `POST /transactions` - 取引作成
- `GET /transactions/account/:accountId` - 口座別取引履歴

### スコア管理
- `GET /scores` - スコア履歴
- `GET /scores/latest` - 最新スコア
- `POST /scores/calculate` - スコア計算

### 特典管理
- `GET /rewards` - 特典一覧
- `GET /rewards/my` - 自分の特典状況
- `POST /rewards/:id/redeem` - 特典交換

### ダッシュボード・分析
- `GET /dashboard` - ダッシュボードデータ
- `GET /analysis/oshi-spending` - 推し活支出分析

## 🧪 テストデータ

実際のダミーデータを使用した3人の顧客:

### 顧客1 (`customer1@oshieru.com`)
- **生活口座残高**: ¥380,000
- **取引件数**: 51件
- **最新スコア**: 60点 (安心)
- **特徴**: 給与振込、クレジットカード支払い等の一般的な取引パターン

### 顧客2 (`customer2@oshieru.com`)
- **生活口座残高**: ¥1,399,999
- **取引件数**: 56件
- **最新スコア**: 70点 (安心)
- **特徴**: 高額収入、投資関連取引を含む

### 顧客3 (`customer3@oshieru.com`)
- **生活口座残高**: ¥230
- **取引件数**: 71件
- **最新スコア**: 80点 (とても安心)
- **特徴**: 少額取引が多く、細かい支出管理が特徴

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🔗 関連ドキュメント

- [サービス概要](./service_overview.md)
- [開発仕様書](./devlopment_outline.md)  
- [推し活安心度スコア仕様](./oshikatu_safety_score.md) # oshieru_tokyostar
