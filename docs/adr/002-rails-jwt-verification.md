# ADR-002: RailsのJWT検証方式の選択

## ステータス
Accepted

## コンテキスト

ADR-001でAuth.jsをNext.jsに導入し認証の責務を集約することを決定した。Auth.jsがJWTを発行するにあたり、RailsがそのJWTをどう検証するかを決定する必要がある。

## 検討した選択肢

### A. NEXTAUTH_SECRETを共有してHS256で検証 ★★★★★

Auth.jsのJWTはデフォルトでHS256（`NEXTAUTH_SECRET`で署名）。Railsに同じ`NEXTAUTH_SECRET`を環境変数として渡し、`jwt` gemで検証する。

**メリット**
- 設定がシンプル
- モノリポ構成のため秘密鍵の共有管理がしやすい

**デメリット**
- 秘密鍵が漏洩した場合、JWTを任意に偽造できる
- 将来Railsを外部に切り出す際に秘密鍵の共有管理が複雑になる

---

### B. RS256（非対称鍵）で検証 ★★★☆☆

Auth.jsをRS256に設定し、秘密鍵でJWTを署名、公開鍵をRailsに渡して検証する。

**メリット**
- 秘密鍵をRailsに渡さなくて済むためセキュリティが高い
- 将来サービスが分離しても公開鍵を配るだけで対応できる

**デメリット**
- Auth.jsのRS256設定が追加で必要（デフォルトはHS256）
- 鍵ペアの生成・管理が必要

---

### C. Next.jsにAPI Route（`/api/auth/verify`）を用意してRailsがそこに問い合わせる ★★☆☆☆

RailsがJWTを自前検証せず、Next.jsのAPI Routeに検証を委譲する。

**メリット**
- RailsがJWT検証ロジックを持たなくて良い

**デメリット**
- リクエストのたびにNext.jsへの通信が発生してパフォーマンスが落ちる
- RailsとNext.jsの間に循環的な依存が生まれる
- Next.jsが落ちるとRailsの認証も機能しなくなる

## 決定

A（NEXTAUTH_SECRETを共有してHS256で検証）を選択する。

## 理由

- モノリポ構成のため`NEXTAUTH_SECRET`を環境変数で共有するのが自然で管理しやすい
- 秘密鍵漏洩リスクは環境変数管理の問題であり、個人開発では現実的な脅威ではない
- Bの追加設定・鍵管理コストは現在の規模では複雑さに見合わない
- Cは循環依存とパフォーマンス問題があり採用できない
- 将来サービスを切り出す際にはその時点でBへ移行するADRを書けばよい

## 結果

- `NEXTAUTH_SECRET` をRailsとNext.jsで共有する
- Railsの `authenticate_user!` を `jwt` gemでHS256検証する実装に変更する
- `JwtHelper` は削除する
