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
│   ├── card-map/               … カード還元率マップのサブサイト
│   ├── parenting/               … 育児防災チェックリスト
│   ├── disaster-prevention/     … 防災DXリサーチ
│   ├── home-buying-guide/       … 自宅不動産購入ガイド
│   ├── tennis/                  … テニススイング分析
│   └── nisa-simulator/          … 新NISA積立・株式投資シミュレーター
│   ├── claude-code/             … Claude Code活用ガイドのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   ├── disaster-prevention/     … 防災DXリサーチのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   ├── lifestyle/               … ミニマル育児ブログのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   ├── lifestyle/               … ファミリー＆ライフスタイルカテゴリのサブサイト
│   └── home-buying-guide/       … 住宅購入ガイドとローン試算アプリ
│   ├── parenting/               … 育児防災チェックリストのサブサイト
│   │   ├── index.html
│   │   └── styles.css
│   └── tennis/                  … テニススイング分析のサブサイト
├── docs/
│   └── 静的サイト無料デプロイ手順.md … GitHub Pages の手順書（参照用）
└── 内容.md                       … メモや記事などを置くためのファイル
```

ホームページとサブページは共通のデザインシステムを利用しながらも、カテゴリごとに CSS や JavaScript を追加できます。GitHub Pages にデプロイする場合は、`index.html` を含む `main` ブランチのルートを公開対象に設定してください。サブページは `/pages/<カテゴリ名>/index.html` で公開されます。
ホームページとサブページは共通のデザインシステムを利用しながらも、カテゴリごとに CSS やアセットを追加できます。GitHub Pages にデプロイする場合は、`index.html` を含む `main` ブランチのルートを公開対象に設定してください。サブページは `/pages/<カテゴリ名>/index.html` で公開されます。


## 追加した機能（2026-03-31）

- `pages/home-buying-guide/` に、住宅ローンの金利計算と住宅ローン減税の目安を確認できる試算フォームを追加しました。
- 入力した借入額・年利・返済期間から毎月返済額を表示し、入居年と住宅区分に応じた控除上限の目安を表示します。
- この試算はブラウザ内だけで動作し、サーバーは不要です。
