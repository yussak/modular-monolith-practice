# セキュリティポリシー

## 依存パッケージのバージョン固定

サプライチェーン攻撃対策として依存はバージョン固定する。
背景: https://www.publickey1.jp/blog/26/npm_install_trivyaxios.html

### 固定方法

- GitHub Actions: commit SHA（`actions/checkout@<sha> # v4.3.1`）
- Docker image: SHA256 digest
- npm（package.json）: exact version（`^` / `~` 禁止）
- Ruby gem（Gemfile）: exact version
