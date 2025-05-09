# 1. 要件定義書（改訂版）

## 1.1 目的
美容サロンのカウンセリング音声をアップロードすると **自動で「接客評価チェックシート」と「顧客の悩みシート」** を生成・ダウンロードできる SaaS を、**Vercel（Next.js）+ Supabase** 上に 1 リポジトリで構築する。

## 1.2 背景 ✽ 変更点ハイライト
| 従来 | 改訂後 |
|------|--------|
| FastAPI on VM、ローカル FS 保管 | **Next.js API Routes** + Supabase Storage／Postgres、完全サーバレス |
| 音声 100 MB をバックエンドに POST | 音声は **Supabase Storage に直 PUT**（署名付き URL） |
| 進捗管理を JSON 保存 | **jobs テーブル** & Row Level Security |

## 1.3 主要機能
1. 音声アップロード（Supabase Storage）
2. 文字起こし（STT API）
3. LLM 解析 → 2 種類の Markdown / PDF 生成
4. シートプレビュー & ダウンロード
5. 管理画面：API キー & プロンプト設定
6. ジョブ進行状況のリアルタイム表示（ポーリング or SWR）

## 1.4 非機能要件（抜粋）
- **パフォーマンス**：60 分音声 → 10 分以内 STT、3 分以内シート生成（Cron Fn 最大 800 s）
- **セキュリティ**：RLS、署名 URL、有効期限付き JWT
- **拡張性**：Edge キューで処理分散、Next.js App Router への段階移行

---