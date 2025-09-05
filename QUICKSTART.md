# 🚀 クイックスタート - 推しエール口座

最速でデプロイする手順です！

## ⚡ 5分でデプロイ

### 1. GitHubにプッシュ
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oshieru-prototype.git
git push -u origin main
```

### 2. Cloudflare準備
```bash
# wranglerインストール & ログイン
npm install -g wrangler
wrangler login

# D1データベース作成
wrangler d1 create oshieru-db
# → 出力されたdatabase_idをコピー

# KVネームスペース作成
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview
# → 出力されたidをコピー
```

### 3. 設定ファイル更新
`apps/api/wrangler.toml` と `apps/score/wrangler.toml` で：
- `YOUR_D1_DATABASE_ID` → 実際のD1 ID
- `YOUR_KV_NAMESPACE_ID` → 実際のKV ID
- `YOUR_KV_PREVIEW_ID` → 実際のKVプレビューID

### 4. Workers デプロイ
```bash
# スコア計算Worker
cd apps/score
wrangler deploy

# API Worker
cd ../api
wrangler deploy
```

### 5. Pages デプロイ
1. [Cloudflare Pages](https://pages.cloudflare.com/) にアクセス
2. "Create a project" → "Connect to Git"
3. リポジトリを選択
4. 設定:
   - **Build command**: `cd apps/web && npm run build`
   - **Build output**: `apps/web/.next`
   - **Framework**: Next.js
5. 環境変数追加:
   - `NEXT_PUBLIC_API_URL` = `https://oshieru-api.YOUR_SUBDOMAIN.workers.dev`

### 6. 完了！🎉
- **アプリ**: https://oshieru-web.pages.dev
- **デモログイン**: `demo@oshieru.com`

## 🔧 トラブル時
```bash
# ログ確認
wrangler tail oshieru-api
wrangler tail oshieru-score

# 再デプロイ
wrangler deploy --force
```

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) をご覧ください！ 