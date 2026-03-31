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
│   ├── lifestyle/               … ミニマル育児ブログ
│   ├── parenting/               … 育児防災チェックリスト
│   ├── disaster-prevention/     … 防災DXリサーチ
│   ├── home-buying-guide/       … 自宅不動産購入ガイド
│   ├── tennis/                  … テニススイング分析
│   └── nisa-simulator/          … 新NISA積立・株式投資シミュレーター
├── docs/
│   └── 静的サイト無料デプロイ手順.md … GitHub Pages の手順書（参照用）
└── 内容.md                       … メモや記事などを置くためのファイル
```

ホームページとサブページは共通のデザインシステムを利用しながらも、カテゴリごとに CSS や JavaScript を追加できます。GitHub Pages にデプロイする場合は、`index.html` を含む `main` ブランチのルートを公開対象に設定してください。サブページは `/pages/<カテゴリ名>/index.html` で公開されます。
