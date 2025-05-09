import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase';

export async function GET() {
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

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      storageKey: filePath,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
