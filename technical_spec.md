# 2. 技術仕様書（改訂版）
 
## 2.1 
```mermaid
graph TD
  subgraph Client (Next.js / React)
    Uploader -->|PUT| SupaStoragße
    Uploader -->|GET presigned| VercelAPI[/api/get-upload-url/]
    Uploader -->|POST start| VercelAPI[/api/start-job/]
    Poller -->|GET| VercelAPI[/api/job-status/]
  end

  subgraph Vercel
    VercelAPI --> PG[(Supabase Postgres)]
    Processor[[Serverless fn<br>(STT→LLM)]] --> PG
    Processor --> SupaStorage
    Cron[Vercel Cron] --> Processor
  end

  subgraph Supabase
    SupaStorage[Storage<br>バケット]
    PG --> EdgeFn[Edge Queue (任意)]
  end
```

### 2.2 コンポーネント一覧
| レイヤ | 技術 | 役割 |
|--------|------|------|
| UI | **Next.js (React + Tailwind)** | アップロード、進捗、結果表示 |
| API | **Next.js API Routes** | presigned URL 発行・ジョブ管理 |
| Async | **Vercel Cron Function** | 長時間処理（STT→LLM→PDF） |
| Storage | **Supabase Storage** | 音声 & 生成ファイル保管 |
| DB | **Supabase Postgres** | ジョブ & 設定管理 |
| Auth | **Supabase Auth** | 将来のユーザ機能に備え実装 |

### 2.3 API エンドポイント
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/get-upload-url` | Supabase Storage 署名付き URL 取得 |
| POST | `/api/start-job` | Storage Key 登録 → jobs 行作成 |
| GET | `/api/job-status/{id}` | ジョブ状態 & 生成物 URL 取得 |
| GET | `/api/settings/prompt` | プロンプト取得 |
| PUT | `/api/settings/prompt` | プロンプト更新 |

### 2.4 データベーススキーマ
```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  storage_key text,
  status text check (status in ('queued','processing','completed','error')),
  created_at timestamptz default now(),
  completed_at timestamptz,
  check_md_url text,
  pain_md_url text,
  error text
);

alter table jobs enable row level security;
create policy "Users can access own jobs" on jobs
  for all using (auth.uid() = user_id);
```

### 2.5 フロントエンド構成
```
/app/page.tsx            # ユーザ画面
/app/admin/page.tsx       # 管理画面
/pages/api/*.ts           # API Routes
/cron/stt-process.ts      # Vercel Cron Fn
/lib/supabase.ts          # Supabase JS v2 ラッパ
```

### 2.6 環境変数（Vercel & Supabase）
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
```

---