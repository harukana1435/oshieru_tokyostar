# 推しエール口座 デザインルール

## デザインコンセプト
**「温かみのある安心感と、推し活への愛情を表現する可愛らしいデザイン」**

健康的な推し活をサポートする金融アプリとして、ユーザーに安心感と親しみやすさを与える温かみのあるデザインを目指します。ベージュの安定感と黄色の明るさで、推し活への愛情と金融の信頼性を両立させます。

---

## 1. カラーシステム

### プライマリーカラー
```css
/* ベージュ系 - メインカラー */
--primary-50: #fefdf8    /* bg-amber-50 */
--primary-100: #fef3c7   /* bg-amber-100 */
--primary-200: #fde68a   /* bg-amber-200 */
--primary-300: #fcd34d   /* bg-amber-300 */
--primary-400: #f59e0b   /* bg-amber-400 */
--primary-500: #d97706   /* bg-amber-500 */
--primary-600: #b45309   /* bg-amber-600 */
--primary-700: #92400e   /* bg-amber-700 */
--primary-800: #78350f   /* bg-amber-800 */
--primary-900: #451a03   /* bg-amber-900 */
```

### セカンダリーカラー
```css
/* 黄色系 - アクセントカラー */
--secondary-50: #fffbeb   /* bg-yellow-50 */
--secondary-100: #fef3c7  /* bg-yellow-100 */
--secondary-200: #fde68a  /* bg-yellow-200 */
--secondary-300: #fcd34d  /* bg-yellow-300 */
--secondary-400: #fbbf24  /* bg-yellow-400 */
--secondary-500: #f59e0b  /* bg-yellow-500 */
--secondary-600: #d97706  /* bg-yellow-600 */
--secondary-700: #b45309  /* bg-yellow-700 */
--secondary-800: #92400e  /* bg-yellow-800 */
--secondary-900: #78350f  /* bg-yellow-900 */
```

### ニュートラルカラー
```css
/* グレー系 - テキストと背景 */
--neutral-50: #fafaf9    /* bg-stone-50 */
--neutral-100: #f5f5f4   /* bg-stone-100 */
--neutral-200: #e7e5e4   /* bg-stone-200 */
--neutral-300: #d6d3d1   /* bg-stone-300 */
--neutral-400: #a8a29e   /* bg-stone-400 */
--neutral-500: #78716c   /* bg-stone-500 */
--neutral-600: #57534e   /* bg-stone-600 */
--neutral-700: #44403c   /* bg-stone-700 */
--neutral-800: #292524   /* bg-stone-800 */
--neutral-900: #1c1917   /* bg-stone-900 */
```

### セマンティックカラー
```css
/* 成功・安全 */
--success-50: #f0fdf4    /* bg-green-50 */
--success-500: #22c55e   /* bg-green-500 */
--success-600: #16a34a   /* bg-green-600 */

/* 警告 */
--warning-50: #fffbeb    /* bg-orange-50 */
--warning-500: #f97316   /* bg-orange-500 */
--warning-600: #ea580c   /* bg-orange-600 */

/* エラー・危険 */
--error-50: #fef2f2      /* bg-red-50 */
--error-500: #ef4444     /* bg-red-500 */
--error-600: #dc2626     /* bg-red-600 */

/* 情報 */
--info-50: #eff6ff       /* bg-blue-50 */
--info-500: #3b82f6      /* bg-blue-500 */
--info-600: #2563eb      /* bg-blue-600 */
```

### 推し活安心度スコア専用カラー
```css
/* スコア表示用グラデーション */
--score-excellent: linear-gradient(135deg, #fbbf24, #f59e0b)  /* yellow-400 to yellow-500 */
--score-good: linear-gradient(135deg, #fde68a, #fcd34d)       /* yellow-200 to yellow-300 */
--score-warning: linear-gradient(135deg, #f97316, #ea580c)    /* orange-500 to orange-600 */
--score-danger: linear-gradient(135deg, #ef4444, #dc2626)     /* red-500 to red-600 */
```

---

## 2. タイポグラフィシステム

### フォントファミリー
```css
/* プライマリフォント（日本語対応） */
font-family: 'Hiragino Sans', 'ヒラギノ角ゴシック', 'Yu Gothic UI', 'Meiryo UI', sans-serif;

/* Tailwind CSS設定 */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

### フォントサイズスケール（モバイルファースト）
```css
/* 見出し */
--text-xs: 0.75rem     /* text-xs - 12px */
--text-sm: 0.875rem    /* text-sm - 14px */
--text-base: 1rem      /* text-base - 16px */
--text-lg: 1.125rem    /* text-lg - 18px */
--text-xl: 1.25rem     /* text-xl - 20px */
--text-2xl: 1.5rem     /* text-2xl - 24px */
--text-3xl: 1.875rem   /* text-3xl - 30px */
--text-4xl: 2.25rem    /* text-4xl - 36px */
--text-5xl: 3rem       /* text-5xl - 48px */
```

### タイポグラフィスタイル定義
```css
/* H1 - ページタイトル */
.heading-1 {
  @apply text-2xl md:text-3xl font-bold text-stone-800 leading-tight;
}

/* H2 - セクションタイトル */
.heading-2 {
  @apply text-xl md:text-2xl font-semibold text-stone-700 leading-tight;
}

/* H3 - サブセクション */
.heading-3 {
  @apply text-lg md:text-xl font-medium text-stone-700 leading-snug;
}

/* ボディテキスト */
.body-large {
  @apply text-base md:text-lg text-stone-600 leading-relaxed;
}

.body-medium {
  @apply text-sm md:text-base text-stone-600 leading-relaxed;
}

.body-small {
  @apply text-xs md:text-sm text-stone-500 leading-normal;
}

/* キャプション */
.caption {
  @apply text-xs text-stone-400 leading-normal;
}

/* 強調テキスト */
.text-emphasis {
  @apply font-semibold text-amber-600;
}
```

---

## 3. 余白・間隔システム

### スペーシングスケール
```css
/* Tailwind CSS標準スケールを使用 */
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-3: 0.75rem   /* 12px */
--spacing-4: 1rem      /* 16px */
--spacing-5: 1.25rem   /* 20px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
--spacing-10: 2.5rem   /* 40px */
--spacing-12: 3rem     /* 48px */
--spacing-16: 4rem     /* 64px */
--spacing-20: 5rem     /* 80px */
```

### コンポーネント別スペーシング
```css
/* カード内余白 */
.card-padding {
  @apply p-4 md:p-6;
}

/* セクション間隔 */
.section-spacing {
  @apply mb-8 md:mb-12;
}

/* 要素間の基本間隔 */
.element-spacing {
  @apply mb-4 md:mb-6;
}

/* ボタン内余白 */
.button-padding {
  @apply px-4 py-2 md:px-6 md:py-3;
}
```

---

## 4. 角丸システム

### 角丸スケール
```css
--rounded-none: 0px        /* rounded-none */
--rounded-sm: 0.125rem     /* rounded-sm - 2px */
--rounded: 0.25rem         /* rounded - 4px */
--rounded-md: 0.375rem     /* rounded-md - 6px */
--rounded-lg: 0.5rem       /* rounded-lg - 8px */
--rounded-xl: 0.75rem      /* rounded-xl - 12px */
--rounded-2xl: 1rem        /* rounded-2xl - 16px */
--rounded-3xl: 1.5rem      /* rounded-3xl - 24px */
--rounded-full: 9999px     /* rounded-full */
```

### コンポーネント別角丸
```css
/* カード */
.card-rounded {
  @apply rounded-xl md:rounded-2xl;
}

/* ボタン */
.button-rounded {
  @apply rounded-lg;
}

/* インプットフィールド */
.input-rounded {
  @apply rounded-md;
}

/* アバター・アイコン */
.avatar-rounded {
  @apply rounded-full;
}

/* モーダル */
.modal-rounded {
  @apply rounded-t-2xl md:rounded-2xl;
}
```

---

## 5. 影の効果システム

### シャドウスケール
```css
/* 軽いシャドウ */
.shadow-soft {
  box-shadow: 0 1px 3px 0 rgba(120, 113, 108, 0.1), 0 1px 2px 0 rgba(120, 113, 108, 0.06);
}

/* 標準シャドウ */
.shadow-normal {
  box-shadow: 0 4px 6px -1px rgba(120, 113, 108, 0.1), 0 2px 4px -1px rgba(120, 113, 108, 0.06);
}

/* 強いシャドウ */
.shadow-strong {
  box-shadow: 0 10px 15px -3px rgba(120, 113, 108, 0.1), 0 4px 6px -2px rgba(120, 113, 108, 0.05);
}

/* フローティングシャドウ */
.shadow-floating {
  box-shadow: 0 20px 25px -5px rgba(120, 113, 108, 0.1), 0 10px 10px -5px rgba(120, 113, 108, 0.04);
}

/* インナーシャドウ */
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(120, 113, 108, 0.06);
}
```

### Tailwind CSS対応
```css
/* 対応するTailwindクラス */
.shadow-soft     /* shadow-sm */
.shadow-normal   /* shadow-md */
.shadow-strong   /* shadow-lg */
.shadow-floating /* shadow-2xl */
.shadow-inner    /* shadow-inner */
```

---

## 6. コンポーネント設計

### 6.1 ボタン

#### プライマリボタン
```css
.btn-primary {
  @apply bg-amber-400 hover:bg-amber-500 active:bg-amber-600 
         text-stone-800 font-medium 
         px-4 py-2 md:px-6 md:py-3 
         rounded-lg shadow-normal hover:shadow-strong 
         transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-opacity-50;
}
```

#### セカンダリボタン
```css
.btn-secondary {
  @apply bg-stone-100 hover:bg-stone-200 active:bg-stone-300 
         text-stone-700 font-medium 
         px-4 py-2 md:px-6 md:py-3 
         rounded-lg shadow-soft hover:shadow-normal 
         transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-opacity-50;
}
```

#### アウトラインボタン
```css
.btn-outline {
  @apply bg-transparent hover:bg-amber-50 active:bg-amber-100 
         text-amber-600 hover:text-amber-700 font-medium 
         border-2 border-amber-300 hover:border-amber-400 
         px-4 py-2 md:px-6 md:py-3 
         rounded-lg 
         transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-opacity-50;
}
```

#### ゴーストボタン
```css
.btn-ghost {
  @apply bg-transparent hover:bg-stone-50 active:bg-stone-100 
         text-stone-600 hover:text-stone-700 font-medium 
         px-4 py-2 md:px-6 md:py-3 
         rounded-lg 
         transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-opacity-50;
}
```

### 6.2 カード

#### 基本カード
```css
.card {
  @apply bg-white border border-stone-200 
         rounded-xl md:rounded-2xl 
         shadow-normal hover:shadow-strong 
         p-4 md:p-6 
         transition-all duration-200 ease-in-out;
}
```

#### アクセントカード
```css
.card-accent {
  @apply bg-gradient-to-br from-amber-50 to-yellow-50 
         border border-amber-200 
         rounded-xl md:rounded-2xl 
         shadow-normal hover:shadow-strong 
         p-4 md:p-6 
         transition-all duration-200 ease-in-out;
}
```

#### スコアカード
```css
.card-score {
  @apply bg-gradient-to-br from-yellow-100 to-amber-100 
         border border-yellow-300 
         rounded-xl md:rounded-2xl 
         shadow-strong 
         p-6 md:p-8 
         text-center;
}
```

### 6.3 フォーム要素

#### インプットフィールド
```css
.input-field {
  @apply w-full px-3 py-2 md:px-4 md:py-3 
         bg-white border border-stone-300 
         rounded-md 
         text-stone-700 placeholder-stone-400 
         focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 
         transition-colors duration-200;
}
```

#### セレクトボックス
```css
.select-field {
  @apply w-full px-3 py-2 md:px-4 md:py-3 
         bg-white border border-stone-300 
         rounded-md 
         text-stone-700 
         focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 
         transition-colors duration-200
         appearance-none bg-no-repeat bg-right bg-[length:20px];
}
```

### 6.4 ナビゲーション

#### タブナビゲーション
```css
.tab-nav {
  @apply flex bg-stone-100 rounded-lg p-1;
}

.tab-item {
  @apply flex-1 px-3 py-2 text-sm font-medium text-center 
         text-stone-600 rounded-md 
         transition-all duration-200;
}

.tab-item-active {
  @apply bg-white text-amber-600 shadow-soft;
}
```

#### ボトムナビゲーション
```css
.bottom-nav {
  @apply fixed bottom-0 left-0 right-0 
         bg-white border-t border-stone-200 
         px-4 py-2 
         flex justify-around items-center;
}

.bottom-nav-item {
  @apply flex flex-col items-center 
         px-2 py-1 
         text-xs text-stone-500 
         transition-colors duration-200;
}

.bottom-nav-item-active {
  @apply text-amber-600;
}
```

---

## 7. アクセシビリティ配慮

### 7.1 カラーコントラスト
- **AAA基準準拠**: 背景とテキストのコントラスト比7:1以上を維持
- **テキストカラー推奨組み合わせ**:
  ```css
  /* 背景白に対して */
  .text-primary { @apply text-stone-800; }    /* コントラスト比: 12.6:1 */
  .text-secondary { @apply text-stone-600; }  /* コントラスト比: 7.5:1 */
  .text-muted { @apply text-stone-500; }      /* コントラスト比: 5.7:1 */
  ```

### 7.2 フォーカス管理
```css
/* フォーカス可能要素の統一スタイル */
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-opacity-50;
}

/* キーボードナビゲーション用 */
.focus-within {
  @apply focus-within:ring-2 focus-within:ring-amber-300 focus-within:ring-opacity-50;
}
```

### 7.3 タッチターゲット
```css
/* 最小タッチターゲットサイズ（44px×44px） */
.touch-target {
  @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
}
```

### 7.4 動作配慮
```css
/* アニメーション無効化対応 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. モバイルファーストアプローチ

### 8.1 ブレークポイント
```css
/* Tailwind CSS標準ブレークポイント */
sm: 640px    /* @media (min-width: 640px) */
md: 768px    /* @media (min-width: 768px) */
lg: 1024px   /* @media (min-width: 1024px) */
xl: 1280px   /* @media (min-width: 1280px) */
2xl: 1536px  /* @media (min-width: 1536px) */
```

### 8.2 レスポンシブ設計原則
1. **モバイルファースト**: 基本スタイルはモバイル向け
2. **プログレッシブエンハンスメント**: 画面サイズに応じて機能追加
3. **タッチフレンドリー**: 十分なタッチターゲットサイズ確保

### 8.3 コンテナ設計
```css
/* ページコンテナ */
.page-container {
  @apply max-w-sm mx-auto px-4 md:max-w-2xl md:px-6 lg:max-w-4xl lg:px-8;
}

/* カードグリッド */
.card-grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3;
}
```

---

## 9. 実装ガイドライン

### 9.1 Tailwind CSS設定
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fefdf8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        }
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(120, 113, 108, 0.1), 0 1px 2px 0 rgba(120, 113, 108, 0.06)',
        'normal': '0 4px 6px -1px rgba(120, 113, 108, 0.1), 0 2px 4px -1px rgba(120, 113, 108, 0.06)',
        'strong': '0 10px 15px -3px rgba(120, 113, 108, 0.1), 0 4px 6px -2px rgba(120, 113, 108, 0.05)',
        'floating': '0 20px 25px -5px rgba(120, 113, 108, 0.1), 0 10px 10px -5px rgba(120, 113, 108, 0.04)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ]
}
```

### 9.2 CSS カスタムプロパティ
```css
/* globals.css */
:root {
  --color-primary-50: #fefdf8;
  --color-primary-400: #f59e0b;
  --color-primary-500: #d97706;
  
  --shadow-soft: 0 1px 3px 0 rgba(120, 113, 108, 0.1), 0 1px 2px 0 rgba(120, 113, 108, 0.06);
  --shadow-normal: 0 4px 6px -1px rgba(120, 113, 108, 0.1), 0 2px 4px -1px rgba(120, 113, 108, 0.06);
  
  --border-radius-card: 0.75rem;
  --border-radius-button: 0.5rem;
}
```

---

## 10. 推し活特化デザイン要素

### 10.1 推し活安心度スコア表示
```css
.score-display {
  @apply relative overflow-hidden bg-gradient-to-br from-yellow-100 to-amber-100 
         rounded-2xl p-6 text-center;
}

.score-circle {
  @apply w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 
         rounded-full border-8 border-yellow-300 
         flex items-center justify-center 
         text-2xl md:text-3xl font-bold text-amber-600;
}

.score-label {
  @apply text-sm md:text-base text-stone-600 font-medium;
}
```

### 10.2 口座残高表示
```css
.balance-card {
  @apply bg-white border border-stone-200 rounded-xl p-4 
         shadow-normal hover:shadow-strong transition-all duration-200;
}

.balance-amount {
  @apply text-2xl md:text-3xl font-bold text-stone-800;
}

.balance-label {
  @apply text-sm text-stone-500 font-medium;
}
```

### 10.3 特典・リワード表示
```css
.reward-badge {
  @apply inline-flex items-center px-3 py-1 
         bg-gradient-to-r from-yellow-200 to-amber-200 
         text-amber-700 text-xs font-semibold 
         rounded-full border border-amber-300;
}

.reward-card {
  @apply bg-gradient-to-br from-amber-50 to-yellow-50 
         border border-amber-200 rounded-xl p-4 
         shadow-soft hover:shadow-normal transition-all duration-200;
}
```

---

## 11. デザイントークン管理

### 11.1 デザイントークンファイル
```json
{
  "color": {
    "primary": {
      "50": "#fefdf8",
      "400": "#f59e0b",
      "500": "#d97706"
    },
    "neutral": {
      "50": "#fafaf9",
      "600": "#57534e",
      "800": "#292524"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem"
  },
  "typography": {
    "fontFamily": {
      "primary": "ui-sans-serif, system-ui, sans-serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem"
    }
  }
}
```

---

## 12. 品質保証チェックリスト

### デザイン実装時の確認項目
- [ ] カラーコントラスト比がAA基準（4.5:1）以上
- [ ] タッチターゲットが44px×44px以上
- [ ] フォーカス状態が視覚的に明確
- [ ] モバイル画面で読みやすいフォントサイズ（16px以上）
- [ ] 適切な余白とスペーシング
- [ ] 一貫した角丸とシャドウの使用
- [ ] レスポンシブデザインの動作確認
- [ ] ダークモード対応（将来的）

このデザインルールに従って、推しエール口座の温かみがあり親しみやすいUIを実現し、ユーザーが安心して推し活を楽しめるデザインを提供します。
