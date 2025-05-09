# 音声分析アプリ

美容サロンのカウンセリング音声をアップロードすると自動で「接客評価チェックシート」と「顧客の悩みシート」を生成・ダウンロードできるSaaSアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **認証**: Supabase Auth
- **デプロイ**: Vercel

## 主要機能

1. 音声アップロード (Supabase Storage)
2. 文字起こし (STT API)
3. LLM解析 → 2種類のMarkdown/PDF生成
4. シートプレビュー & ダウンロード
5. 管理画面: APIキー & プロンプト設定
6. ジョブ進行状況のリアルタイム表示

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- npm 9.x以上
- Supabaseアカウント

### インストール手順

1. リポジトリをクローン:
   ```bash
   git clone https://github.com/yourusername/voice-analysis-app.git
   cd voice-analysis-app
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. 環境変数を設定:
   `.env.local`ファイルを作成し、以下の変数を設定:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # API Keys
   STT_API_KEY=your-stt-api-key
   LLM_API_KEY=your-llm-api-key
   
   # Cron
   CRON_SECRET=your-cron-secret
   ```

4. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

### データベースのセットアップ

Supabaseで以下のテーブルを作成:

1. `jobs` テーブル:
   ```sql
   CREATE TABLE jobs (
     id UUID PRIMARY KEY,
     status TEXT NOT NULL,
     file_path TEXT NOT NULL,
     file_name TEXT NOT NULL,
     transcription TEXT,
     customer_concerns TEXT,
     service_evaluation TEXT,
     error TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. `api_settings` テーブル:
   ```sql
   CREATE TABLE api_settings (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT UNIQUE NOT NULL,
     key TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. `prompt_templates` テーブル:
   ```sql
   CREATE TABLE prompt_templates (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     type TEXT UNIQUE NOT NULL,
     template TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### ストレージのセットアップ

Supabaseで以下のバケットを作成:

1. `audio` バケット (非公開)

## デプロイ

Vercelにデプロイする場合:

1. GitHubリポジトリを作成し、コードをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## ライセンス

MIT
