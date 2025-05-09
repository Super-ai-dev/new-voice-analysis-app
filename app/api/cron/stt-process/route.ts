import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// This would be a cron job that processes pending jobs
export async function GET(request: Request) {
  try {
    // Check for authorization header (in a real app, use a proper secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = createServerSupabaseClient();
    
    // Get pending jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .limit(5);
    
    if (jobsError) {
      console.error('Error fetching pending jobs:', jobsError);
      return NextResponse.json(
        { error: 'Failed to fetch pending jobs' },
        { status: 500 }
      );
    }
    
    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No pending jobs found' });
    }
    
    // Process each job
    const results = await Promise.all(
      jobs.map(async (job) => {
        try {
          // Update job status to transcribing
          await supabase
            .from('jobs')
            .update({ status: 'transcribing' })
            .eq('id', job.id);
          
          // In a real implementation, you would:
          // 1. Get the audio file from storage
          // 2. Send it to a speech-to-text API
          // 3. Update the job with the transcription
          // 4. Update the job status to 'analyzing'
          // 5. Send the transcription to an LLM for analysis
          // 6. Update the job with the analysis results
          // 7. Update the job status to 'completed'
          
          // For this example, we'll simulate the process with a delay
          // and update the job with mock data
          
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update job with mock data
          await supabase
            .from('jobs')
            .update({
              status: 'completed',
              transcription: 'これはサンプルの文字起こしです。実際の実装では、音声ファイルをSTT APIに送信して文字起こしを行います。',
              customer_concerns: '# 顧客の悩みシート\n\n## 基本情報\n- **顧客名**: 山田様\n- **年齢**: 30代\n- **髪質**: 普通\n\n## 主な悩み\n1. 髪の乾燥\n2. 白髪が気になる\n3. スタイリングが難しい\n\n## 詳細\n顧客は髪の乾燥に悩んでおり、特に冬場は静電気も気になるとのこと。また、最近白髪が増えてきたことも気にしている。自宅でのスタイリングが上手くいかず、サロンでのスタイリング方法を知りたいと考えている。\n\n## 推奨製品\n- モイスチャーシャンプー・コンディショナー\n- ヘアオイル（乾燥対策）\n- カラートリートメント（白髪対策）\n\n## フォローアップ\n次回来店時に、ホームケア製品の使用感を確認し、必要に応じて調整する。',
              service_evaluation: '# 接客評価チェックシート\n\n## 総合評価\n⭐⭐⭐⭐ (4/5)\n\n## 強み\n- お客様の話をよく聞いていた\n- 専門知識を分かりやすく説明していた\n- 親身な対応ができていた\n\n## 改善点\n- 製品の説明がやや早口だった\n- 価格の説明をもう少し丁寧にするとよい\n\n## 詳細評価\n\n### 1. 挨拶・第一印象\n⭐⭐⭐⭐⭐ (5/5)\n- 明るく元気な挨拶ができていた\n- 笑顔で対応していた\n\n### 2. ヒアリング\n⭐⭐⭐⭐ (4/5)\n- お客様の悩みを丁寧に聞き出していた\n- 適切な質問ができていた\n- もう少し掘り下げた質問があるとよかった\n\n### 3. 提案力\n⭐⭐⭐⭐ (4/5)\n- お客様の悩みに合わせた提案ができていた\n- 複数の選択肢を提示できていた\n\n### 4. 説明力\n⭐⭐⭐ (3/5)\n- 専門用語を使いすぎる場面があった\n- 説明がやや早口だった\n\n### 5. クロージング\n⭐⭐⭐⭐ (4/5)\n- 次回の予約につなげることができていた\n- お見送りの挨拶が丁寧だった\n\n## 総評\n全体的に良好な接客ができていました。特にお客様の話をよく聞き、親身になって対応している点が素晴らしいです。製品説明の際にはもう少しゆっくり話し、専門用語を噛み砕いて説明するとさらに良くなるでしょう。',
            })
            .eq('id', job.id);
          
          return { id: job.id, status: 'completed' };
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          
          // Update job status to failed
          await supabase
            .from('jobs')
            .update({
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', job.id);
          
          return { id: job.id, status: 'failed', error };
        }
      })
    );
    
    return NextResponse.json({ processed: results });
  } catch (error) {
    console.error('Error in cron/stt-process:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
