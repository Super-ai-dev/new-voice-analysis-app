'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { JobStatus } from '@/components/JobStatus';

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">音声分析アプリ</h1>
      
      <div className="max-w-2xl mx-auto">
        {!jobId ? (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">音声ファイルをアップロード</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              美容サロンのカウンセリング音声をアップロードすると、自動で「接客評価チェックシート」と「顧客の悩みシート」を生成します。
            </p>
            <FileUploader onJobCreated={setJobId} />
          </div>
        ) : (
          <JobStatus jobId={jobId} onReset={() => setJobId(null)} />
        )}
      </div>
    </div>
  );
}
