# ADR-001: 認証方式の選択

## ステータス
Proposed

## コンテキスト

Next.js（フロントエンド）+ Rails API（バックエンド）の構成で認証を実装するにあたり、認証の責務をどこに持たせるかを決定する必要がある。

具体的な背景として、商品の削除ボタンを「出品者本人のみに表示する」という要件が生じた際に、現在の構成（RailsがJWTを発行しJavaScriptから読めるCookieに保存）ではServer Componentからログイン状態を取得できないという問題が顕在化した。

## 検討した選択肢

### A. Auth.jsをNext.jsに導入し、認証の主体をNext.jsにする

Auth.jsのCredentialsProviderでRailsの`/auth/login`を呼び出し、セッション管理はAuth.jsが担う。

**メリット**
- `auth()` 一発でServer Component・Client Component両方からユーザー情報が取得できる
- 認証の複雑さがNext.jsに集約され、RailsはステートレスなAPIに徹せる
- OAuthなど将来の認証方式拡張が容易

**デメリット**
- 既存のRails JWT認証からの移行コストがかかる

---

### B. Rails JWTを維持しつつCookieをHttpOnlyに変える

Rails側のレスポンスで `HttpOnly` フラグ付きCookieにJWTをセットし、Next.jsの `cookies()` でServer Componentから読めるようにする。

**メリット**
- Auth.jsを導入しない場合のXSS対策として正しい構成
- 移行コストはAより小さい

**デメリット**
- 認証の責務がRailsとNext.jsに分散したまま
- Server ComponentでJWTをデコードするロジックがフロントに必要

---

### C. 現状維持（RailsがJWTを発行・フロントがCookieに保存）

現在の実装のまま運用する。具体的な構成は以下の通り。

1. ログイン時にRailsの `POST /api/v1/auth/login` がJWTを発行してレスポンスBodyで返す
2. フロント（`lib/auth.ts` の `setToken()`）がそのJWTを `document.cookie` に保存する（HttpOnlyなし）
3. API呼び出し時は `lib/api.ts` の `apiFetch()` がCookieからトークンを読み取り `Authorization: Bearer {token}` ヘッダーに付与する
4. Railsの `ApplicationController#authenticate_user!` がヘッダーのJWTを検証し `@current_user` を設定する

`document.cookie` を使っているためServer Componentからは読めず、ログイン状態の取得はClient Componentでのみ可能。

**メリット**
- 変更コストゼロ

**デメリット**
- XSSによるトークン窃取リスクがある
- Server Componentからログイン状態を取得できないため、表示制御はClient Component頼りになる

## 決定

A（Auth.jsをNext.jsに導入）を選択予定

## 理由

現状（C）はすでに問題が顕在化している。削除ボタンの表示制御というシンプルな要件でServer Componentからログイン状態を取得できないという壁にぶつかった。今後、管理者機能・購入機能など認証が絡む要件が増えるたびに同じ問題に直面することが予想される。

後回しにするほど機能が増えて移行コストが上がるため、早期にAへ移行する方が長期的なコストが低い。

BはXSSリスクの解消とServer Component対応という点では改善になるが、認証の責務がRailsとNext.jsに分散したままであり、根本的な解決にはならない。

AはAuth.jsに認証を集約することで以下が実現できる。

- `auth()` 一発でServer Component・Client Component両方からユーザー情報が取得できる
- RailsはステートレスなAPIに徹することができ、責務が明確になる
- 管理者認証やOAuth追加など将来の拡張に対応しやすい
- Next.js + 外部APIの認証のデファクトであり、学習価値も高い

## 結果

- 現状はAPIが権限を守っており機能的な問題はない
- 選択によっては既存の認証コード（`lib/auth.ts`・`JwtHelper`・AuthController）の大幅な変更が生じる
