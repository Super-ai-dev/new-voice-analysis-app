import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { SpeechClient } from '@google-cloud/speech';
import { OpenAI } from 'openai';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google Speech-to-Text クライアントの初期化
const speechClient = new SpeechClient();

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // 処理待ちのジョブを取得
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (jobsError) {
      throw jobsError;
    }
    
    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No jobs to process' });
    }
    
    const job = jobs[0];
    
    // ジョブのステータスを処理中に更新
    await supabase
      .from('jobs')
      .update({ status: 'processing' })
      .eq('id', job.id);
    
    // 音声ファイルのダウンロード
    const { data: fileData, error: fileError } = await supabase.storage
      .from('voice-analysis')
      .download(job.storage_key);
    
    if (fileError) {
      throw fileError;
    }
    
    // 音声ファイルをBase64に変換
    const audioBytes = await fileData.arrayBuffer();
    const base64Audio = Buffer.from(audioBytes).toString('base64');
    
    // Google Speech-to-Text で文字起こし
    const [response] = await speechClient.recognize({
      audio: {
        content: base64Audio,
      },
      config: {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'ja-JP',
      },
    });
    
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join('\n');
    
    if (!transcription) {
      throw new Error('Transcription failed');
    }
    
    // プロンプトの取得
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['check_prompt', 'pain_prompt']);
    
    if (settingsError) {
      throw settingsError;
    }
    
    const settings = settingsData.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
    
    // OpenAI で接客評価チェックシートを生成
    const checkCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: settings.check_prompt || '以下は美容サロンでのカウンセリング音声の文字起こしです。この会話を分析して、接客評価チェックシートを作成してください。',
        },
        {
          role: 'user',
          content: transcription,
        },
      ],
    });
    
    const checkMd = checkCompletion.choices[0]?.message.content || '';
    
    // OpenAI で顧客の悩みシートを生成
    const painCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: settings.pain_prompt || '以下は美容サロンでのカウンセリング音声の文字起こしです。この会話から顧客の主な悩みや要望を抽出し、「顧客の悩みシート」を作成してください。',
        },
        {
          role: 'user',
          content: transcription,
        },
      ],
    });
    
    const painMd = painCompletion.choices[0]?.message.content || '';
    
    // 生成されたMarkdownをSupabase Storageに保存
    const checkMdPath = `results/${job.id}/check.md`;
    const painMdPath = `results/${job.id}/pain.md`;
    
    const [checkUploadResult, painUploadResult] = await Promise.all([
      supabase.storage
        .from('voice-analysis')
        .upload(checkMdPath, checkMd, {
          contentType: 'text/markdown',
        }),
      supabase.storage
        .from('voice-analysis')
        .upload(painMdPath, painMd, {
          contentType: 'text/markdown',
        }),
    ]);
    
    if (checkUploadResult.error) {
      throw checkUploadResult.error;
    }
    
    if (painUploadResult.error) {
      throw painUploadResult.error;
    }
    
    // ジョブを完了状態に更新
    await supabase
      .from('jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        check_md_url: checkMdPath,
        pain_md_url: painMdPath,
      })
      .eq('id', job.id);
    
    return NextResponse.json({
      message: 'Job processed successfully',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Error processing job:', error);
    
    // エラーが発生した場合、ジョブのステータスをエラーに更新
    try {
      const supabase = createServerSupabaseClient();
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'processing')
        .limit(1);
      
      if (jobs && jobs.length > 0) {
        await supabase
          .from('jobs')
          .update({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', jobs[0].id);
      }
    } catch (updateError) {
      console.error('Error updating job status:', updateError);
    }
    
    return NextResponse.json(
      { error: 'Failed to process job' },
      { status: 500 }
    );
  }
}

// Vercel Cron設定
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5分
