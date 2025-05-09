'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import JobStatus from '@/components/JobStatus';

export default function Home() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const handleUploadComplete = (jobId: string) => {
    setCurrentJobId(jobId);
    setIsUploadComplete(true);
  };

  const handleReset = () => {
    setCurrentJobId(null);
    setIsUploadComplete(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            美容サロン音声分析アプリ
          </h1>
          <p className="text-lg text-gray-600">
            カウンセリング音声をアップロードして、接客評価と顧客の悩みを自動分析
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {!isUploadComplete ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">音声ファイルをアップロード</h2>
                <p className="text-gray-500">
                  MP3, WAV, M4A, AACなどの音声ファイルに対応しています
                </p>
              </div>
              
              <FileUploader onUploadComplete={handleUploadComplete} />
              
              <div className="text-center text-sm text-gray-500">
                <p>※ アップロードされた音声は自動で文字起こしされ、AIによって分析されます</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">分析状況</h2>
                <p className="text-gray-500">
                  音声の処理状況と分析結果を確認できます
                </p>
              </div>
              
              {currentJobId && <JobStatus jobId={currentJobId} />}
              
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  新しい音声をアップロード
                </button>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 美容サロン音声分析アプリ</p>
        </footer>
      </div>
    </main>
  );
}
