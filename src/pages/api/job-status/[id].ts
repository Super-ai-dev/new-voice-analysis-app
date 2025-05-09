import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Valid job ID is required' });
    }
    
    const supabase = createServerSupabaseClient();
    
    // ジョブの状態を取得
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // 完了している場合は、生成されたファイルのURLを取得
    let checkMdUrl = null;
    let painMdUrl = null;
    
    if (job.status === 'completed' && job.check_md_url) {
      const { data: checkUrl } = await supabase.storage
        .from('voice-analysis')
        .createSignedUrl(job.check_md_url, 3600); // 1時間有効
      
      checkMdUrl = checkUrl?.signedUrl;
    }
    
    if (job.status === 'completed' && job.pain_md_url) {
      const { data: painUrl } = await supabase.storage
        .from('voice-analysis')
        .createSignedUrl(job.pain_md_url, 3600); // 1時間有効
      
      painMdUrl = painUrl?.signedUrl;
    }
    
    return res.status(200).json({
      id: job.id,
      status: job.status,
      createdAt: job.created_at,
      completedAt: job.completed_at,
      checkMdUrl,
      painMdUrl,
      error: job.error,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return res.status(500).json({ error: 'Failed to fetch job status' });
  }
}
