# ADR-005: GitHub Actions の SHA Pinning

## ステータス

採用

## コンテキスト

2025年の tj-actions/reviewdog 事件、2026年の Trivy 事件では、GitHub Actions のメンテナーアカウントが侵害され、タグ（`@v1` 等）が悪性コミットに付け替えられた。タグはメンテナーが自由に移動でき、利用者側で検知する手段がない。

本プロジェクトでは以下の Action をタグ指定で利用している：

| Action | 現在の指定 | 使用箇所 |
|---|---|---|
| `actions/checkout` | `@v6` | ci.yml, security.yml |
| `ruby/setup-ruby` | `@v1` | ci.yml, security.yml |
| `actions/setup-node` | `@v6` | ci.yml, security.yml |
| `dependabot/fetch-metadata` | `@v3` | dependabot-auto-merge.yml |

SHA（コミットハッシュ）指定にすればタグ書き換え攻撃を無効化できる。

## 決定

全 Action のタグ指定をコミット SHA 指定に変更する。可読性のため SHA の横にバージョンコメントを残す。

```yaml
# 変更前
- uses: actions/checkout@v6

# 変更後
- uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

固定する SHA：

| Action | SHA | バージョン |
|---|---|---|
| `actions/checkout` | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` | v6.0.2 |
| `ruby/setup-ruby` | `7372622e62b60b3cb750dcd2b9e32c247ffec26a` | v1.302.0 |
| `actions/setup-node` | `53b83947a5a98c8d113130e565377fae1a50d02f` | v6.3.0 |
| `dependabot/fetch-metadata` | `ffa630c65fa7e0ecfa0625b5ceda64399aea1b36` | v3.0.0 |

## 理由

- **タグ書き換え攻撃の直接的な防御策**: SHA は不変であり、リポジトリ側で改ざんできない
- **Dependabot が SHA 更新 PR を自動作成**: `.github/dependabot.yml` に `github-actions` エコシステムが設定済みのため、新バージョンリリース時に SHA 更新の PR が自動で作られる。運用負荷は増えない
- **業界標準**: GitHub 公式ドキュメントでも SHA 指定を推奨している
- **可逆性が高い**: SHA をタグに戻すだけで元に戻せる

## 影響

- `ruby/setup-ruby` は `@v1` がブランチ（タグではない）を指しており、最新タグ v1.302.0 の SHA に固定する（v1 ブランチ HEAD と一致）。頻繁にリリースされるため Dependabot による更新が重要
- 今後 Action を追加する際は SHA 指定で追加する運用が必要
