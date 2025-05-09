import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Valid job ID is required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
