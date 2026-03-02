# Device Detector Demo

デバイスの種類（モバイル/デスクトップ）を判定するデモアプリケーションです。

## プロジェクトの目的

このプロジェクトは、ブラウザのAPIを使用してユーザーのデバイスを正確に判定するための実験的なツールです。以下の情報を収集・分析します：

- **User Agent** - ブラウザが報告するユーザーエージェント文字列
- **User-Agent Client Hints** - モバイルデバイスであるかの判定情報
- **画面サイズ** - 物理画面幅・高さと表示領域サイズ
- **タッチ機能** - タッチポイント数とポインタ精度
- **ホバー対応** - ホバー操作への対応状況
- **画面向き** - デバイスの現在の向き（ポートレート/ランドスケープ）

これらの情報を組み合わせることで、以下の判定を行います：

1. **デスクトップデバイス** - マウス/トラックパッド操作デバイス
2. **モバイルデバイス** - スマートフォン/タブレット
3. **モバイルデバイス (PCモード)** - スマートフォンでPC表示モードを有効にした状態

## セットアップ

### 依存関係のインストール

```bash
yarn
```

### 開発サーバーの起動

```bash
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、デバイス判定デモページが表示されます。

## 技術スタック

- **Next.js 16.1.6** - React フレームワーク（Turbopack対応）
- **React 19.2.3** - UIライブラリ
- **TypeScript 5** - 型安全性
- **Tailwind CSS 4** - ユーティリティファーストCSSフレームワーク
- **Yarn** - パッケージマネージャー

## 利用しているブラウザAPI

- `navigator.userAgent` - ユーザーエージェント文字列
- `navigator.userAgentData.getHighEntropyValues()` - User-Agent Client Hints
- `window.innerWidth/Height` - 表示領域のサイズ
- `window.screen.width/height` - 物理画面のサイズ
- `navigator.maxTouchPoints` - タッチポイント数
- `window.matchMedia()` - CSSメディアクエリの評価
- `window.screen.orientation` - 画面向き情報

## ブラウザ互換性

このアプリケーションは、以下のブラウザで動作します：

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome

一部の機能（User-Agent Client Hints など）は、古いブラウザではサポートされていない場合があります。

## ライセンス

MIT