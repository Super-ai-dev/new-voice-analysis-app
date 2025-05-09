import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

// API設定の取得
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('api_settings')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching API settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API settings' },
      { status: 500 }
    );
  }
}

// API設定の更新
export async function PUT(request: NextRequest) {
  try {
    const { id, api_key, is_active } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'API setting ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabaseClient();
    
    // 更新するフィールドを準備
    const updateData: { api_key?: string; is_active?: boolean } = {};
    
    if (api_key !== undefined) {
      updateData.api_key = api_key;
    }
    
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }
    
    // データが空の場合は更新しない
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('api_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating API setting:', error);
    return NextResponse.json(
      { error: 'Failed to update API setting' },
      { status: 500 }
    );
  }
}
