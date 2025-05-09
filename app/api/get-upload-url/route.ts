import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

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

    // Create a signed URL for uploading
    const filePath = `${jobId}/${fileName}`;
    console.log('Creating signed URL for path:', filePath);

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
        file_name: fileName,
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
