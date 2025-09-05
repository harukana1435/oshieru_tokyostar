# 🚀 デプロイ手順書

推しエール口座をGitHub + Cloudflare Pages/Workersにデプロイする詳細手順です。

## 📋 デプロイ構成

- **フロントエンド (apps/web)** → Cloudflare Pages
- **API Worker (apps/api)** → Cloudflare Workers
- **スコア計算 Worker (apps/score)** → Cloudflare Workers
- **データベース** → Cloudflare D1
- **セッション管理** → Cloudflare KV

## 🔧 事前準備

### 1. GitHubリポジトリの作成

```bash
# 1. GitHubでリポジトリを作成（例: oshieru-prototype）
# 2. ローカルでGitを初期化
git init
git add .
git commit -m "Initial commit: 推しエール口座プロトタイプ"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oshieru-prototype.git
git push -u origin main
```

### 2. Cloudflareアカウント・wrangler準備

```bash
# wranglerをインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# アカウントIDを確認
wrangler whoami
```

## 🗄️ データベース・KVの準備

### 1. D1データベース作成

```bash
# D1データベースを作成
wrangler d1 create oshieru-db

# 出力例:
# ✅ Successfully created DB 'oshieru-db' in region APAC
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "oshieru-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. KVネームスペース作成

```bash
# セッション用KVネームスペースを作成
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview

# 出力例:
# 🌀 Creating namespace with title "oshieru-prototype-SESSIONS"
# ✨ Success!
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "SESSIONS", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

### 3. wrangler.toml更新

`infra/cf/wrangler.toml` を実際のIDで更新：

```toml
# API Worker Configuration
[env.api]
name = "oshieru-api"
main = "../../apps/api/src/index.ts"
compatibility_date = "2024-01-15"
compatibility_flags = ["nodejs_compat"]

[[env.api.d1_databases]]
binding = "DB"
database_name = "oshieru-db"
database_id = "YOUR_D1_DATABASE_ID"  # ← ここを更新

[[env.api.kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID"          # ← ここを更新
preview_id = "YOUR_KV_PREVIEW_ID"    # ← ここを更新

[[env.api.services]]
binding = "SCORE_WORKER"
service = "oshieru-score"

# Score Worker Configuration
[env.score]
name = "oshieru-score"
main = "../../apps/score/src/main.py"
compatibility_date = "2024-01-15"
python_compatibility = true
```

### 4. データベースマイグレーション

```bash
# スキーマ生成
cd packages/db
npx drizzle-kit generate:sqlite --config=drizzle.config.ts

# マイグレーション実行
wrangler d1 execute oshieru-db --file=./migrations/0000_initial.sql

# サンプルデータ投入（オプション）
# SQLファイルを作成してサンプルデータを投入
```

## ⚙️ Workers デプロイ

### 1. スコア計算Worker デプロイ

```bash
cd apps/score
wrangler deploy --name oshieru-score --compatibility-date 2024-01-15

# 成功例:
# ✨ Success! Uploaded 1 files (0.23 sec)
# ✨ Success! Published oshieru-score
#    https://oshieru-score.YOUR_SUBDOMAIN.workers.dev
```

### 2. API Worker デプロイ

```bash
cd apps/api

# 依存関係をインストール
pnpm install

# TypeScriptビルド
pnpm build

# デプロイ
wrangler deploy --name oshieru-api --compatibility-date 2024-01-15

# 成功例:
# ✨ Success! Uploaded 15 files (1.23 sec)
# ✨ Success! Published oshieru-api
#    https://oshieru-api.YOUR_SUBDOMAIN.workers.dev
```

### 3. API動作確認

```bash
# ヘルスチェック
curl https://oshieru-api.YOUR_SUBDOMAIN.workers.dev/

# レスポンス例:
# {
#   "message": "Oshieru API is running",
#   "version": "0.1.0",
#   "timestamp": "2024-02-01T10:00:00.000Z"
# }
```

## 📱 Cloudflare Pages デプロイ

### 1. Pages プロジェクト作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 「Pages」セクションに移動
3. 「Create a project」をクリック
4. 「Connect to Git」を選択

### 2. GitHub連携設定

1. **Repository**: `YOUR_USERNAME/oshieru-prototype` を選択
2. **Project name**: `oshieru-web`
3. **Production branch**: `main`
4. **Framework preset**: `Next.js`
5. **Build settings**:
   - **Build command**: `cd apps/web && npm run build`
   - **Build output directory**: `apps/web/.next`
   - **Root directory**: `/` (ルートのまま)

### 3. 環境変数設定

Pages の設定で以下の環境変数を追加：

```
NEXT_PUBLIC_API_URL=https://oshieru-api.YOUR_SUBDOMAIN.workers.dev
NODE_VERSION=18
```

### 4. デプロイ実行

1. 「Save and Deploy」をクリック
2. ビルド完了を待つ（3-5分程度）
3. デプロイ完了後、URLが表示される

```
✅ デプロイ成功！
🌐 https://oshieru-web.pages.dev
```

## 🔗 サービス間連携設定

### 1. API Worker の環境変数更新

```bash
# API WorkerにPages URLを設定
wrangler secret put FRONTEND_URL --env api
# 入力: https://oshieru-web.pages.dev
```

### 2. CORS設定確認

`apps/api/src/index.ts` でCORS設定を確認：

```typescript
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://oshieru-web.pages.dev',
    'https://YOUR_CUSTOM_DOMAIN.com' // カスタムドメインがある場合
  ],
  credentials: true
}));
```

## 🧪 動作確認

### 1. フロントエンド確認

```bash
# Pages URLにアクセス
open https://oshieru-web.pages.dev

# ログインページが表示されることを確認
# デモアカウント（demo@oshieru.com）でログイン可能
```

### 2. API連携確認

ブラウザの開発者ツールで以下を確認：

1. **Network タブ**: API リクエストが正常に送信されている
2. **Console**: エラーが発生していない
3. **Application > Local Storage**: セッション情報が保存されている

### 3. スコア計算確認

```bash
# スコア計算APIを直接テスト
curl -X POST https://oshieru-score.YOUR_SUBDOMAIN.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{
    "income": 300000,
    "oshiExpense": 50000,
    "essentialExpense": 120000
  }'

# レスポンス例:
# {
#   "score": 75,
#   "label": "安心",
#   "factors": {
#     "incomeRatioScore": 30,
#     "surplusScore": 25,
#     "recommendedAmountScore": 20,
#     ...
#   }
# }
```

## 🚀 継続的デプロイ設定

### 1. GitHub Actions（オプション）

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [ main ]

jobs:
  deploy-workers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install
      
      - name: Deploy Score Worker
        run: |
          cd apps/score
          wrangler deploy --name oshieru-score
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Deploy API Worker
        run: |
          cd apps/api
          pnpm build
          wrangler deploy --name oshieru-api
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 2. Pages 自動デプロイ

Pages は GitHub と連携済みのため、`main` ブランチへのプッシュで自動デプロイされます。

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **ビルドエラー**: 
   ```bash
   # 依存関係を再インストール
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **API接続エラー**:
   - CORS設定を確認
   - 環境変数 `NEXT_PUBLIC_API_URL` を確認

3. **D1接続エラー**:
   - wrangler.toml のデータベースIDを確認
   - マイグレーションが実行されているか確認

4. **KV接続エラー**:
   - KVネームスペースIDを確認
   - セッション作成時のエラーログを確認

## 📊 モニタリング

### Cloudflare Analytics

1. **Pages Analytics**: アクセス数、パフォーマンス
2. **Workers Analytics**: リクエスト数、エラー率、レスポンス時間
3. **D1 Analytics**: クエリ実行回数、レスポンス時間

### ログ確認

```bash
# Worker ログをリアルタイム表示
wrangler tail oshieru-api
wrangler tail oshieru-score
```

## 🎉 完了！

これで推しエール口座が本格的にインターネット上で動作します！

- **フロントエンド**: https://oshieru-web.pages.dev
- **API**: https://oshieru-api.YOUR_SUBDOMAIN.workers.dev  
- **スコア計算**: https://oshieru-score.YOUR_SUBDOMAIN.workers.dev

ハッカソンでのデモ準備完了です！🎊 