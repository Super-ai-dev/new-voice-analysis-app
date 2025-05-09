import { createServerSupabaseClient } from './supabase';
import { OpenAI } from 'openai';
import { SpeechClient } from '@google-cloud/speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';

// APIサービスの種類
export type ApiServiceName = 'openai' | 'gemini' | 'groq' | 'google_stt';

// API設定の型
export interface ApiSetting {
  id: string;
  name: ApiServiceName;
  api_key: string;
  is_active: boolean;
}

// データベースからAPI設定を取得する関数
export async function getApiSettings() {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('api_settings')
    .select('*')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching API settings:', error);
    return null;
  }
  
  return data as ApiSetting[];
}

// 特定のサービスのAPI設定を取得する関数
export async function getApiSetting(name: ApiServiceName) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('api_settings')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error(`Error fetching API setting for ${name}:`, error);
    return null;
  }
  
  return data as ApiSetting;
}

// OpenAIクライアントを取得する関数
export async function getOpenAIClient() {
  // まずデータベースから設定を取得
  const setting = await getApiSetting('openai');
  
  // 設定が見つからない場合は環境変数を使用
  const apiKey = setting?.api_key || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }
  
  return new OpenAI({
    apiKey,
  });
}

// Google Speech-to-Textクライアントを取得する関数
export async function getSpeechClient() {
  // まずデータベースから設定を取得
  const setting = await getApiSetting('google_stt');
  
  if (setting?.api_key) {
    try {
      // JSON形式の認証情報を解析
      const credentials = JSON.parse(setting.api_key);
      return new SpeechClient({ credentials });
    } catch (error) {
      console.error('Error parsing Google credentials:', error);
    }
  }
  
  // 設定が見つからない場合は環境変数を使用
  return new SpeechClient();
}

// Google Geminiクライアントを取得する関数
export async function getGeminiClient() {
  // まずデータベースから設定を取得
  const setting = await getApiSetting('gemini');
  
  // 設定が見つからない場合は環境変数を使用
  const apiKey = setting?.api_key || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

// Groqクライアントを取得する関数
export async function getGroqClient() {
  // まずデータベースから設定を取得
  const setting = await getApiSetting('groq');
  
  // 設定が見つからない場合は環境変数を使用
  const apiKey = setting?.api_key || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key not found');
  }
  
  return new Groq({ apiKey });
}
