import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get prompt templates from database
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*');
    
    if (error) {
      console.error('Error fetching prompt templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompt templates' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { type, template } = await request.json();
    
    if (!type || !template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabaseClient();
    
    // Update prompt template
    const { error } = await supabase
      .from('prompt_templates')
      .upsert(
        { type, template },
        { onConflict: 'type' }
      );
    
    if (error) {
      console.error('Error updating prompt template:', error);
      return NextResponse.json(
        { error: 'Failed to update prompt template' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
