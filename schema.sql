-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
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

-- API Settings table
CREATE TABLE api_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt Templates table
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT UNIQUE NOT NULL,
  template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies

-- Enable RLS on tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Public users can insert jobs" ON jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own jobs" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Only service role can update jobs" ON jobs
  FOR UPDATE USING (auth.role() = 'service_role');

-- API Settings policies
CREATE POLICY "Only authenticated users can view API settings" ON api_settings
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Only service role can insert/update API settings" ON api_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Prompt Templates policies
CREATE POLICY "Only authenticated users can view prompt templates" ON prompt_templates
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Only service role can insert/update prompt templates" ON prompt_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default prompt templates
INSERT INTO prompt_templates (type, template)
VALUES 
  ('customer_concerns', 'あなたは美容サロンのカウンセリング分析の専門家です。以下の会話から顧客の悩みを分析し、「顧客の悩みシート」を作成してください。\n\n# 顧客の悩みシート\n\n## 基本情報\n- **顧客名**: （会話から判断）\n- **年齢**: （会話から判断）\n- **髪質**: （会話から判断）\n\n## 主な悩み\n（箇条書きで3-5つ）\n\n## 詳細\n（悩みの詳細を2-3段落で説明）\n\n## 推奨製品\n（悩みに合わせた製品を3-5つ提案）\n\n## フォローアップ\n（次回来店時の確認事項）\n\n会話文:\n{{transcription}}'),
  ('service_evaluation', 'あなたは美容サロンの接客トレーナーです。以下の会話から美容師の接客を評価し、「接客評価チェックシート」を作成してください。\n\n# 接客評価チェックシート\n\n## 総合評価\n（5段階で評価、⭐で表示）\n\n## 強み\n（箇条書きで3つ）\n\n## 改善点\n（箇条書きで2-3つ）\n\n## 詳細評価\n\n### 1. 挨拶・第一印象\n（5段階で評価、コメント）\n\n### 2. ヒアリング\n（5段階で評価、コメント）\n\n### 3. 提案力\n（5段階で評価、コメント）\n\n### 4. 説明力\n（5段階で評価、コメント）\n\n### 5. クロージング\n（5段階で評価、コメント）\n\n## 総評\n（全体的な評価と改善アドバイスを1-2段落）\n\n会話文:\n{{transcription}}');

-- Insert default API settings (empty keys)
INSERT INTO api_settings (name, key)
VALUES 
  ('stt', ''),
  ('llm', '');
