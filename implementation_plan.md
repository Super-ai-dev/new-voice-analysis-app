# 3. 実装計画書（改訂版）

## 3.1 開発環境
- **ローカル起動**：`vercel dev` （Next.js API & Cron ローカル実行）
- **DB / Storage**：`supabase start` (local) or hosted Supabase project
- **主要ライブラリ**：`@supabase/supabase-js@2`, `openai`, `@google-cloud/speech`, `next`, `@vercel/cron` ほか

## 3.2 フェーズ & マイルストン
| フェーズ | 主タスク | Done 条件 |
|----------|---------|-----------|
| 1. 基盤 | Next.js プロジェクト scaffold / Tailwind / Supabase 連携 | UI が起動し Storage へ直 PUT 成功 |
| 2. API | `get-upload-url` / `start-job` / `job-status` 実装 | 音声アップ → ジョブ queued まで |
| 3. 非同期処理 | Vercel Cron Function で STT→LLM→Markdown→PDF→Storage | ジョブ completed & URL 取得 |
| 4. UI 強化 | プログレスバー・タブ表示・ダウンロード | UX テストクリア |
| 5. 管理画面 | APIキー & プロンプト編集フォーム（Supabase Row） | 編集→ジョブ反映確認 |
| 6. 本番デプロイ | GitHub → Vercel 自動デプロイ / Supabase Push | 音声 60 min 処理 OK |

## 3.3 デプロイ手順（抜粋）
```bash
# 1) Supabase プロジェクト作成 & schema.sql プッシュ
echo $SUPA_SERVICE_ROLE_KEY | supabase db push

# 2) Vercel プロジェクトリンク
vercel link && vercel env pull .env.local

# 3) GitHub main push → Vercel Build → Cron & API Routes デプロイ
```

## 3.4 テスト計画
- **単体**：API Route & Cron Fn Jest テスト
- **統合**：cypress でファイル 50 MB / 100 MB パス検証
- **E2E**：実機 & モバイル 3G 上でアップロードタイム／再開確認

## 3.5 保守・運用
- **監視**：Vercel Log Drain → Datadog，Supabase Logs
- **バックアップ**：Supabase 所定の自動バックアップ + Storage オブジェクトバージョニング
- **アップデート**：`turbo run build` → GitHub PR → Vercel Preview → main merge

---
## 4. 今後の拡張アイデア
- Edge Queue で水平スケール処理
- 音声リアルタイム録音 / 逐次アップロード
- 分析ダッシュボード（Supabase Vector + LLM で KPI 洞察）

---
### 作成：2025‑04‑20