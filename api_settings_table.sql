-- api_settings テーブルの作成
CREATE TABLE IF NOT EXISTS api_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 初期データの挿入
INSERT INTO api_settings (name, api_key, is_active)
VALUES 
  ('openai', 'your_openai_api_key', true),
  ('gemini', 'AIzaSyAs2NeG6cdCGUi3VilqH-DzrKR0rXug6ME', true),
  ('groq', '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', true),
  ('google_stt', '{"type":"service_account",...}', true);

-- 更新時に updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_settings_updated_at
BEFORE UPDATE ON api_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
