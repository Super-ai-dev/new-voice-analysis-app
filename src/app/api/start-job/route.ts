import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { storageKey } = await request.json();
    
    if (!storageKey) {
      return NextResponse.json(
        { error: 'Storage key is required' },
        { status: 400 }
      );
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
    
    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error('Error starting job:', error);
    return NextResponse.json(
      { error: 'Failed to start job' },
      { status: 500 }
    );
  }
}
