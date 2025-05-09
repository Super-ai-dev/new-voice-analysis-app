-- ジョブテーブルの作成
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

-- Row Level Securityの有効化
alter table jobs enable row level security;
create policy "Users can access own jobs" on jobs
  for all using (auth.uid() = user_id);

-- 設定テーブルの作成
create table settings (
  id serial primary key,
  key text unique,
  value text,
  updated_at timestamptz default now()
);

-- デフォルトのプロンプト設定
insert into settings (key, value) values 
('check_prompt', '以下は美容サロンでのカウンセリング音声の文字起こしです。この会話を分析して、接客評価チェックシートを作成してください。以下の項目を評価し、それぞれに点数（1-5）と改善点を記載してください：\n\n1. 挨拶・第一印象\n2. ヒアリング能力\n3. 専門知識の提供\n4. 問題解決能力\n5. クロージング\n\n総合評価と改善のためのアドバイスも含めてください。'),
('pain_prompt', '以下は美容サロンでのカウンセリング音声の文字起こしです。この会話から顧客の主な悩みや要望を抽出し、「顧客の悩みシート」を作成してください。以下の項目を含めてください：\n\n1. 顧客の主訴（主な悩み）\n2. 現在の状態\n3. 過去の施術歴\n4. 希望する結果\n5. 懸念事項\n\nそれぞれの項目について、会話から得られた情報を詳細にまとめてください。');

-- Storageバケットの作成
-- 注: これはSQLではなくSupabase UIまたはCLIで行う必要があります
