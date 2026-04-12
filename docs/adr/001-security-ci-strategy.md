# ADR-001: セキュリティ CI 戦略

## ステータス

採用

## コンテキスト

本プロジェクトは EC サイトであり、ユーザー認証・商品管理・注文処理・決済（モック）を扱う。
セキュリティ上の問題を CI で自動検出し、脆弱なコードや依存パッケージが main にマージされるのを防ぎたい。

守るべき領域は大きく 2 つある：

1. **自分が書いたコードの脆弱性**（SQLインジェクション、XSS など）
2. **依存パッケージの既知脆弱性**（CVE が出ている gem / npm パッケージ）

## 決定

### 採用したツール

| ツール | 対象 | 何を守るか | CI での実行 |
|---|---|---|---|
| brakeman | Backend (Rails) | 自分が書いたコードの脆弱性 | `bundle exec brakeman --no-pager` |
| bundler-audit | Backend (Rails) | gem の既知脆弱性 (CVE) | `bundle exec bundler-audit --update` |
| npm audit | Frontend (Next.js) | npm パッケージの既知脆弱性 (CVE) | `npm audit --audit-level=high` |
| Dependabot | 両方 | 依存パッケージの自動更新 PR | GitHub App（CI job ではない） |

### 各ツールの役割と選定理由

**brakeman** — Rails に特化したセキュリティ静的解析。データフローを追跡して、params がどこで危険に使われているかを検出する。rubocop（スタイル）とは守る領域が異なる。

**bundler-audit** — Gemfile.lock をスキャンし、既知の CVE がある gem を検出する。brakeman が「自分のコード」を見るのに対し、bundler-audit は「依存パッケージ」を見る。

**npm audit** — bundler-audit の JS 版。`--audit-level=high` で severity を high 以上に絞る。low/moderate まで含めると false positive が多く CI が頻繁に壊れるため。

**Dependabot** — 上記 3 つが「脆弱性を検知してブロック」するのに対し、Dependabot は「更新 PR を自動作成して対応を促す」。検知と対応の両方をカバーするために併用する。

### 今後の候補

**Socket.dev**（サプライチェーン攻撃の検知）— npm パッケージの振る舞いを分析し、インストール時の不審な外部通信や typosquatting を検出する。npm audit が「既知の CVE」しか検知できないのに対し、Socket は「未知の不審な振る舞い」を検知できる。今後サプライチェーン攻撃対策として導入を検討する。

**lockfile-lint**（lockfile 改ざん検知）— package-lock.json のレジストリ URL が正規のものか検証する。導入コストは低いが、個人プロジェクトでは改ざんリスクが低いため優先度を下げた。

**secretlint**（シークレット漏洩防止）— コード内の API キーやトークンのハードコードを検知する。GitHub の Secret Scanning でもカバーされるため、必要性が高まったら導入する。

**eslint-plugin-security**（フロントエンドのコードレベル脆弱性）— eval や RegExp DoS を検知する ESLint プラグイン。フロントエンドの規模が大きくなったら導入を検討する。

## 補足

- brakeman の初回スキャン結果は警告 0 件（2026-04-12 時点）
- brakeman の false positive は `config/brakeman.ignore` で管理できる
- npm audit で脆弱性が出た場合は `npm audit fix` で semver 範囲内の修正、`npm audit fix --force` で破壊的更新（動作確認が必要）
