import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// 音声処理を行う関数
async function processAudioJob(jobId: string) {
  const supabase = createServerSupabaseClient();

  try {
    // ジョブの状態を「文字起こし中」に更新
    await supabase
      .from('jobs')
      .update({ status: 'transcribing' })
      .eq('id', jobId);

    // 実際の実装では、ここで音声ファイルをSTT APIに送信
    // 今回はモックデータで処理をシミュレート
    console.log(`Starting transcription for job ${jobId}`);

    // 文字起こし処理をシミュレート（2秒待機）
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockTranscription = `
こんにちは、今日はカウンセリングにお越しいただきありがとうございます。
まず、今回どのようなことでお悩みでしょうか？

はい、最近髪の毛が乾燥してパサパサになってしまって、特に毛先の方がひどくて困っています。
あと、白髪も少し気になり始めて、どうしたらいいのかわからなくて。

なるほど、乾燥と白髪のお悩みですね。
髪質はどのような感じでしょうか？もともと乾燥しやすい髪質でしたか？

そうですね、もともと少し乾燥しやすい方だったんですが、最近特にひどくなった気がします。
冬になってから特に気になるようになりました。

冬場は空気が乾燥するので、髪の毛も影響を受けやすいですね。
普段のヘアケアはどのようなことをされていますか？

シャンプーとコンディショナーは普通のものを使っています。
特別なケアはしていないです。

わかりました。それでは、まず保湿力の高いシャンプーとトリートメントに変えることをおすすめします。
また、週に1-2回はヘアマスクでしっかりと栄養を補給することも大切です。
白髪に関しては、カラートリートメントから始めてみるのはいかがでしょうか？
`;

    // ジョブの状態を「AI分析中」に更新
    await supabase
      .from('jobs')
      .update({
        status: 'analyzing',
        transcription: mockTranscription.trim()
      })
      .eq('id', jobId);

    console.log(`Starting AI analysis for job ${jobId}`);

    // AI分析処理をシミュレート（3秒待機）
    await new Promise(resolve => setTimeout(resolve, 3000));

    // プロンプトテンプレートを取得
    const { data: templates } = await supabase
      .from('prompt_templates')
      .select('*');

    const customerConcernsTemplate = templates?.find(t => t.type === 'customer_concerns')?.template || '';
    const serviceEvaluationTemplate = templates?.find(t => t.type === 'service_evaluation')?.template || '';

    // 実際の実装では、ここでLLM APIを呼び出して分析を行う
    // 今回はモックデータで結果を生成
    const customerConcerns = `# 顧客の悩みシート

## 基本情報
- **顧客名**: お客様
- **年齢**: 30代（推定）
- **髪質**: 乾燥しやすい髪質

## 主な悩み
1. 髪の乾燥とパサつき
2. 毛先のダメージ
3. 白髪の増加
4. 冬場の髪の状態悪化
5. 適切なヘアケア方法がわからない

## 詳細
お客様は髪の乾燥に長年悩まれており、特に最近は毛先のパサつきが深刻化している状況です。もともと乾燥しやすい髪質でしたが、冬場の乾燥した環境により症状が悪化しています。また、年齢とともに白髪も気になり始めており、適切な対処法を求めています。

現在のヘアケアは基本的なシャンプー・コンディショナーのみで、特別なケアは行っていない状況です。保湿力の向上と白髪対策が急務と考えられます。

## 推奨製品
1. **保湿シャンプー・コンディショナー** - 乾燥対策の基本
2. **集中ヘアマスク** - 週1-2回の特別ケア
3. **ヘアオイル** - 毛先の保護とツヤ出し
4. **カラートリートメント** - 白髪の自然なカバー
5. **洗い流さないトリートメント** - 日常の保護

## フォローアップ
- 2週間後：新しいヘアケア製品の使用感確認
- 1ヶ月後：髪の状態改善度チェック
- 3ヶ月後：白髪の状況と今後の対策相談`;

    const serviceEvaluation = `# 接客評価チェックシート

## 総合評価
⭐⭐⭐⭐⭐ (5/5)

## 強み
- 顧客の悩みを丁寧にヒアリングしている
- 具体的で実践的な解決策を提案している
- 顧客の髪質や状況を考慮したアドバイス

## 改善点
- より詳細な髪質診断があるとさらに良い
- 予算に関する確認があると親切

## 詳細評価

### 1. 挨拶・第一印象
⭐⭐⭐⭐⭐ (5/5)
丁寧な挨拶で顧客を迎え、リラックスできる雰囲気を作っている。

### 2. ヒアリング
⭐⭐⭐⭐⭐ (5/5)
顧客の悩みを段階的に深掘りし、髪質や普段のケア方法まで確認している。非常に丁寧なヒアリング。

### 3. 提案力
⭐⭐⭐⭐⭐ (5/5)
乾燥と白髪という2つの悩みに対して、それぞれ具体的で実現可能な解決策を提案している。

### 4. 説明力
⭐⭐⭐⭐☆ (4/5)
提案内容は分かりやすいが、なぜその製品が効果的なのかの理由をもう少し詳しく説明するとより良い。

### 5. クロージング
⭐⭐⭐⭐☆ (4/5)
適切な提案で終わっているが、次回の来店や経過確認についての案内があるとさらに良い。

## 総評
非常に質の高いカウンセリングです。顧客の悩みを丁寧にヒアリングし、それぞれの問題に対して具体的で実践的な解決策を提案できています。特にヒアリング力が優秀で、顧客が安心して相談できる環境を作れています。

今後は、提案理由の詳細説明と、アフターフォローの案内を加えることで、さらに完璧なカウンセリングになるでしょう。`;

    // ジョブの状態を「完了」に更新し、結果を保存
    await supabase
      .from('jobs')
      .update({
        status: 'completed',
        customer_concerns: customerConcerns,
        service_evaluation: serviceEvaluation,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`Job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);

    // エラーが発生した場合、ジョブの状態を「失敗」に更新
    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      .eq('id', jobId);
  }
}

export async function POST(request: Request) {
  try {
    const { jobId, fileName } = await request.json();

    if (!jobId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ジョブが存在するか確認
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      console.error('Error fetching job:', fetchError);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // ジョブの状態を「処理中」に更新
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job status:', error);
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      );
    }

    // バックグラウンドで音声処理を開始（非同期）
    processAudioJob(jobId).catch(error => {
      console.error('Background processing error:', error);
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    console.error('Error in start-job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
