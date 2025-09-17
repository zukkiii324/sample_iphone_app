# サンプル静的サイト

GitHub Pages の手順書に従って作成したローカル用の静的サイトです。`index.html` と `style.css` のみで構成されたシンプルなページになっています。

## フォルダ構成

```
├── README.md              … このリポジトリ全体の説明
├── index.html             … 公開用の HTML（リポジトリ直下）
├── style.css              … 公開用の CSS（リポジトリ直下）
├── 内容.md                 … 記事やメモなどを書きたいときに使うファイル（リポジトリ直下）
└── docs/
    └── 静的サイト無料デプロイ手順.md … GitHub Pages の手順書（参照用）
```

サイトとして公開したい HTML/CSS や、随時編集する Markdown ファイルはリポジトリ直下に配置されています。GitHub Pages にデプロイする場合は、`index.html` と `style.css` を含む `main` ブランチのルートを公開対象に設定してください。
