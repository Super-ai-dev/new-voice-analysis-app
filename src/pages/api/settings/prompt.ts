import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient();

  // GETリクエスト（プロンプト取得）
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['check_prompt', 'pain_prompt']);
      
      if (error) {
        throw error;
      }
      
      // 結果をオブジェクトに変換
      const prompts = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
      
      return res.status(200).json(prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return res.status(500).json({ error: 'Failed to fetch prompts' });
    }
  }
  
  // PUTリクエスト（プロンプト更新）
  if (req.method === 'PUT') {
    try {
      const { check_prompt, pain_prompt } = req.body;
      
      if (!check_prompt && !pain_prompt) {
        return res.status(400).json({ error: 'At least one prompt must be provided' });
      }
      
      // トランザクションで両方のプロンプトを更新
      const updates = [];
      
      if (check_prompt) {
        updates.push(
          supabase
            .from('settings')
            .update({ value: check_prompt, updated_at: new Date().toISOString() })
            .eq('key', 'check_prompt')
        );
      }
      
      if (pain_prompt) {
        updates.push(
          supabase
            .from('settings')
            .update({ value: pain_prompt, updated_at: new Date().toISOString() })
            .eq('key', 'pain_prompt')
        );
      }
      
      await Promise.all(updates);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating prompts:', error);
      return res.status(500).json({ error: 'Failed to update prompts' });
    }
  }
  
  // その他のメソッドは許可しない
  return res.status(405).json({ error: 'Method not allowed' });
}
