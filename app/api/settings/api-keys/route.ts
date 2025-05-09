import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get API keys from database
    const { data, error } = await supabase
      .from('api_settings')
      .select('*');
    
    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET api-keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { stt, llm } = await request.json();
    
    if (stt === undefined || llm === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabaseClient();
    
    // Update STT API key
    const { error: sttError } = await supabase
      .from('api_settings')
      .upsert(
        { name: 'stt', key: stt },
        { onConflict: 'name' }
      );
    
    if (sttError) {
      console.error('Error updating STT API key:', sttError);
      return NextResponse.json(
        { error: 'Failed to update STT API key' },
        { status: 500 }
      );
    }
    
    // Update LLM API key
    const { error: llmError } = await supabase
      .from('api_settings')
      .upsert(
        { name: 'llm', key: llm },
        { onConflict: 'name' }
      );
    
    if (llmError) {
      console.error('Error updating LLM API key:', llmError);
      return NextResponse.json(
        { error: 'Failed to update LLM API key' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST api-keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
