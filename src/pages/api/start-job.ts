import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storageKey } = req.body;
    
    if (!storageKey) {
      return res.status(400).json({ error: 'Storage key is required' });
    }
    
    const supabase = createServerSupabaseClient();
    
    // ファイルの存在確認
    const { data: fileExists, error: fileError } = await supabase.storage
      .from('voice-analysis')
      .getPublicUrl(storageKey);
    
    if (fileError) {
      throw fileError;
    }
    
    // ジョブの作成
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        storage_key: storageKey,
        status: 'queued',
        // 将来的にはユーザーIDを設定
        // user_id: auth.uid(),
      })
      .select()
      .single();
    
    if (jobError) {
      throw jobError;
    }
    
    return res.status(200).json({ jobId: job.id });
  } catch (error) {
    console.error('Error starting job:', error);
    return res.status(500).json({ error: 'Failed to start job' });
  }
}
