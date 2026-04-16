# ADR-004: Dependabot npm メジャーバージョン PR の抑制

## ステータス

採用

## コンテキスト

ADR-003 で「patch/minor は自動マージ、major は手動確認」の運用を導入した。しかし Dependabot は major アップデートの PR 自体は作成し続けるため、peer dependency の連鎖的な非互換により CI が通らない PR が残り続ける問題が発生した。

具体例として PR #29（`@vitejs/plugin-react` 5.1.4 → 6.0.1）では:

- `@vitejs/plugin-react@6.0.1` が peer に `vite@^8.0.0` を要求
- `vitest@4.0.18` が `vite@^6.0.0 || ^7.0.0` を要求
- 両方を満たす vite のバージョンが存在せず、`npm ci` が ERESOLVE で失敗

Dependabot は個別パッケージごとに PR を作る設計上、このような「単独バンプでは解決できない依存関係の競合」は構造的に起こりうる。ADR-003 の「major は手動確認」の npm 部分を見直す必要があった。

## 決定

`.github/dependabot.yml` の npm セクションに ignore ルールを追加し、全 npm パッケージのメジャーバージョン PR 作成を抑制する。

```yaml
- package-ecosystem: "npm"
  directory: "/frontend"
  schedule:
    interval: "weekly"
  ignore:
    - dependency-name: "*"
      update-types: ["version-update:semver-major"]
```

npm のメジャーアップグレードは手動で計画的に行う。

## 理由

### 採用した案: 全 npm パッケージのメジャーバンプを抑制

- auto-merge ワークフローが既にメジャーをスキップしており、方針として一貫する
- 他のパッケージでも同様の peer dependency 競合が起こりうる（eslint 9→10 の PR #37 も同種の問題）
- Dependabot Alerts（セキュリティ）は ignore ルールの影響を受けないため、脆弱性検知に支障がない

### 不採用: vite 8 エコシステムに一括アップグレード

- vitest 4.x は vite 8 未対応で、対応版もリリースされていない
- 現時点では実行不可能

### 不採用: `@vitejs/plugin-react` のみ個別に ignore

- 同様の問題が別パッケージで起きるたびに ignore を追加する対症療法になる

## 影響

- npm のメジャーアップデートの存在に気づきにくくなる。定期的に手動で確認するか、GitHub の Dependabot Alerts で補完する
- bundler・github-actions エコシステムには適用していない。同様の問題が起きた場合は個別に検討する
