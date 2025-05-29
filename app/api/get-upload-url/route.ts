import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// ファイル名をサニタイズする関数
function sanitizeFileName(fileName: string): string {
  // ファイル拡張子を取得
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  const nameWithoutExtension = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

  // 日本語文字、特殊文字を安全な文字に置換
  const sanitized = nameWithoutExtension
    .replace(/[^\w\-_.]/g, '_') // 英数字、ハイフン、アンダースコア、ドット以外を_に置換
    .replace(/_{2,}/g, '_') // 連続するアンダースコアを1つに
    .replace(/^_+|_+$/g, ''); // 先頭と末尾のアンダースコアを削除

  // タイムスタンプを追加して一意性を確保
  const timestamp = Date.now();
  const finalName = sanitized ? `${sanitized}_${timestamp}${extension}` : `file_${timestamp}${extension}`;

  return finalName;
}

export async function POST(request: Request) {
  try {
    const { fileName, contentType, jobId } = await request.json();

    if (!fileName || !contentType || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ファイル名をサニタイズ
    const sanitizedFileName = sanitizeFileName(fileName);

    // Create a signed URL for uploading
    const filePath = `${jobId}/${sanitizedFileName}`;
    console.log('Creating signed URL for path:', filePath);
    console.log('Original filename:', fileName, '-> Sanitized:', sanitizedFileName);

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets?.map(b => b.name));

    const { data, error } = await supabase.storage
      .from('audio-uploads')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: `Failed to create upload URL: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Generated signed URL data:', data);

    // Create a job record in the database
    const { error: jobError } = await supabase
      .from('jobs')
      .insert({
        id: jobId,
        status: 'pending',
        file_path: filePath,
        file_name: fileName, // 元のファイル名を保存（表示用）
      });

    if (jobError) {
      console.error('Error creating job record:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job record' },
        { status: 500 }
      );
    }

    // Return all necessary data for the client to use uploadToSignedUrl
    return NextResponse.json({
      url: data.signedUrl,
      token: data.token,
      path: data.path
    });
  } catch (error) {
    console.error('Error in get-upload-url:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
