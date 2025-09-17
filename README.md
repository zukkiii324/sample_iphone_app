# サンプル静的サイト

ホームページとカテゴリごとのサブページをセットで構築できる静的サイトのテンプレートです。共通スタイルを `assets/css/base.css` にまとめ、各カテゴリは独立したフォルダで開発できるように整理しています。

## フォルダ構成

```
├── README.md                    … このリポジトリ全体の説明
├── index.html                   … ホームページ
├── assets/
│   └── css/
│       └── base.css             … 全ページで共有するスタイル
├── pages/
│   ├── business/                … ビジネスカテゴリのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   ├── creative/                … クリエイティブカテゴリのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   ├── support/                 … サポートカテゴリのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   └── lifestyle/               … ファミリー＆ライフスタイルカテゴリのサブサイト
│       ├── index.html
│       └── styles.css
├── docs/
│   └── 静的サイト無料デプロイ手順.md … GitHub Pages の手順書（参照用）
└── 内容.md                       … メモや記事などを置くためのファイル
```

ホームページとサブページは共通のデザインシステムを利用しながらも、カテゴリごとに CSS やアセットを追加できます。GitHub Pages にデプロイする場合は、`index.html` を含む `main` ブランチのルートを公開対象に設定してください。サブページは `/pages/<カテゴリ名>/index.html` で公開されます。
