# ADR-006: 認証切れ時のハンドリング戦略

## ステータス

採用

## コンテキスト

バックエンド（Rails API）のJWTは有効期限24時間で発行される（`app/lib/jwt_helper.rb`）。
一方、フロントエンド（Next.js / NextAuth）のsession cookieはデフォルト30日で保持される。

この期間の不一致により、以下の事象が発生した：
- NextAuthのsessionは有効だが、中に保持しているJWT(`apiToken`)は失効している
- 認証必須APIの呼び出し時にバックエンドが401を返す
- フロント側はログイン済みと認識しているため、エラー画面が出るだけで再ログインに誘導されない

ユーザーから見ると「ログインしているのに操作できない」という壊れた状態になる。

## 検討した案

### 案A: `apiFetch` で401を検知し、ログアウト用Route Handlerへリダイレクト

共通API呼び出し関数（`frontend/lib/api.ts`）で `res.status === 401` を検知し、
`/auth/logout`（Route Handler）へ `redirect()` する。Route Handler側で
NextAuthの `signOut` を呼んでsessionを破棄し、`/auth/login` へリダイレクトする。

- メリット: 変更箇所が少ない。JWT有効期限を変えても追従する
- デメリット: 401発生時点で1回はエラーになる（即リダイレクトで救済）

補足: 当初は `apiFetch` 内で直接 `signOut()` を呼ぶ案だったが、
`signOut` はcookieを書き換えるためServer Action / Route Handlerからしか呼べず、
Server Component（例: `cart/page.tsx`）から `apiFetch` を呼ぶと
"Cookies can only be modified in a Server Action or Route Handler" エラーになる。
そのため Route Handler を挟む構成にした。

### 案B: NextAuthのsession maxAgeをJWT有効期限と揃える（24時間）

`auth.config.ts` に `session: { maxAge: 60 * 60 * 24 }` を設定し、
session自体を24時間で失効させる。NextAuthのmiddlewareが未ログイン扱いで弾く。

- メリット: NextAuthの仕組みに乗れて綺麗
- デメリット: 境界タイミングでズレが残る。JWT寿命を変えるたびに追従が必要

### 案C: `jwt` コールバックでバックエンドJWTを自動リフレッシュ

バックエンドに `/api/v1/auth/refresh` を新設し、NextAuthの `jwt` コールバックで
期限近くになったら再発行する。

- メリット: ユーザーは切れを意識しない。UXが最良
- デメリット: refresh token設計・失効管理・エラー処理など実装量が大きい

### 案D: JWT有効期限を延ばす（例: 30日）

`EXPIRY = 30.days` に変更するだけ。

- メリット: 最小変更
- デメリット: 根本解決にならず、切れた時の挙動は壊れたまま。セキュリティ的にも弱くなる

## 決定

**案Aを採用。**

## 採用理由

- 「ログイン必要ならログインさせる」という要求に対して最小コストで解決できる
- JWT寿命・session maxAgeの設定変更に追従不要で、他案より保守が楽
- このリポジトリは学習目的であり、まず最低限動く実装から始める方針（CLAUDE.md）と整合する
- 案C（refresh token）はUXは勝るが、現段階では過剰。必要になった時点で案Cに乗り換えるための後方互換を破らない

## 影響

- 全Server Component / Server ActionのAPI呼び出しで401時に `/auth/logout` 経由でログイン画面へ自動遷移する
- `/auth/logout` Route Handler（`frontend/app/auth/logout/route.ts`）を新設
- ログインAPI（`/api/v1/auth/login`）は `apiFetch` を経由していないため、ログイン失敗ループは発生しない
- 将来的にUX改善が必要になった場合は案C（refresh token）を検討する
