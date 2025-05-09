import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['check_prompt', 'pain_prompt']);

    if (error) {
      throw error;
    }

    // 結果をオブジェクトに変換
    const prompts = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { check_prompt, pain_prompt } = await request.json();

    if (!check_prompt && !pain_prompt) {
      return NextResponse.json(
        { error: 'At least one prompt must be provided' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // トランザクションで両方のプロンプトを更新
    const updates = [];

    if (check_prompt) {
      updates.push(
        supabase
          .from('settings')
          .update({ value: check_prompt, updated_at: new Date().toISOString() })
          .eq('key', 'check_prompt')
      );
    }

    if (pain_prompt) {
      updates.push(
        supabase
          .from('settings')
          .update({ value: pain_prompt, updated_at: new Date().toISOString() })
          .eq('key', 'pain_prompt')
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating prompts:', error);
    return NextResponse.json(
      { error: 'Failed to update prompts' },
      { status: 500 }
    );
  }
}
