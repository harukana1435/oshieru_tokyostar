# 推しエール口座 プロトタイプ — AIエージェント指示書（スマホ優先）

> 目的：ハッカソン発表用に **“推しエール口座”** の動くプロトタイプ（モバイル優先／デスクトップ対応）を、**GitHubモノレポ**＋**Cloudflare Pages（FE）**／**Cloudflare Workers（BE）**／**D1 DB** で短期構築する。

---

## 0. スコープ & 非スコープ

* **スコープ**

  * スマホUI：ダッシュボード（推し活安心度スコア表示）、口座残高／履歴、取引目的の入力、分析（推し活割合）、特典一覧。
  * デスクトップUI：同等機能のレスポンシブ対応。
  * API：認証（簡易）、口座／取引／スコア／特典のCRUD、分析エンドポイント。
  * **スコア計算マイクロサービス**（AI/Python）：`推し活安心度スコア.md` の仕様を参照する前提で、HTTP契約を先に確定。
  * データ：**D1（SQLite）** で最小スキーマ、マイグレーション、シードデータ。
* **非スコープ**（今回のプロト）

  * 本番強度のKMS・情報銀行レベルの与信・外部銀行API連携。
  * 完全な会計仕訳／出納帳レベルの厳密性。
  * アプリ内課金・外部IdP連携（必要ならモック）。

---

## 1. 技術スタック & ホスティング方針

* **フロントエンド**：Next.js（App Router）／TypeScript／Tailwind CSS／shadcn/ui、Cloudflare Pages（スマホ優先）
* **バックエンド（API）**：Cloudflare Workers（Hono/TypeScript）
* **スコア計算（AI）**：Cloudflare Workers（Python）で独立ワーカー化し、Service BindingsでAPIワーカーから内部呼び出し
* **データベース**：Cloudflare **D1**（SQLite）＋ **drizzle-orm**（D1ドライバ）
* **キャッシュ／KV**：Cloudflare KV（セッション・フィーチャーフラグ）
* **ストレージ**：R2（将来の領収書画像など。今回は任意）

> **補足**：ユーザー要望に合わせて **Pages=フロント**／**Workers=バックエンド** で構成。CI/CDはCloudflare側の仕組みを利用し、**GitHub Actionsは使わない**。

---

## 2. モノレポ構成（pnpm + Turborepo）

```text
repo/
├─ apps/
│  ├─ web/                 # Next.js (Cloudflare Pages)
│  ├─ api/                 # Hono (Workers, TypeScript)
│  └─ score/               # Python Worker (スコア計算)
├─ packages/
│  ├─ ui/                  # 共通UI（shadcn/uiのラップ, icons, charts）
│  ├─ config/              # eslint, tsconfig, tailwind config 共有
│  ├─ types/               # zodスキーマ, API型, DB型
│  └─ db/                  # **drizzle-orm スキーマ & マイグレーション**
├─ infra/
│  └─ cf/                  # wrangler.toml, pages config, env テンプレ
└─ docs/
   ├─ 推し活安心度スコア.md # スコア仕様（別紙）
   └─ API契約.md
```

---

## 3. データモデル（最小）

* **users**: id, email, display\_name, created\_at
* **accounts**: id, user\_id, kind(“life”|“oshi”), name, balance\_cached, created\_at
* **transactions**: id, account\_id, amount, sign(“in”|“out”), purpose(enum), memo, event\_at, created\_at
* **scores**: id, user\_id, score(0-100), label, snapshot\_at, factors(json)
* **rewards**: id, slug, title, description, min\_score, terms\_url, active
* **user\_rewards**: id, user\_id, reward\_id, status(“eligible”|“redeemed”), updated\_at

**drizzle スキーマ雛形**（packages/db/src/schema.ts）

```ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
});
```

---

## 4. CI/CD 方針

* **GitHub Actionsは利用しない**
* GitHubにモノレポをホストし、Cloudflare Pages/Workers の連携を直接設定
* デプロイは Cloudflare の GitHub 連携機能で自動化
* プレビュー環境は Cloudflare のブランチプレビュー機能を利用

---

## 5. その他は前稿と同様

* API設計、スコア計算ワーカー、UI設計、分析・監視方針、ロードマップなどは変更なし

---

**この指示書に沿って、Cloudflare D1 + drizzle を基盤にモノレポ開発を進めてください。**
