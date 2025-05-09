import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // ファイル名を生成（UUIDベース）
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.mp3`;
    const filePath = `audio/${fileName}`;
    
    // 署名付きURLを生成（10分間有効）
    const { data, error } = await supabase.storage
      .from('voice-analysis')
      .createSignedUploadUrl(filePath, {
        expiresIn: 600, // 10分
      });
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({
      uploadUrl: data.signedUrl,
      storageKey: filePath,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
