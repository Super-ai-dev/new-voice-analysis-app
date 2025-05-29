'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { JobStatus } from '@/components/JobStatus';
import { Sparkles, Mic, Brain, FileText } from 'lucide-react';

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 backdrop-blur-sm border border-indigo-200 rounded-full px-6 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              AI-Powered Voice Analysis
            </span>
          </div>

          <h1 className="animate-slide-up">
            音声分析アプリ
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            美容サロンのカウンセリング音声を
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              AI が自動分析
            </span>
            し、プロフェッショナルなレポートを生成します
          </p>
        </div>

        {/* Feature Cards */}
        {!jobId && (
          <div className="grid md:grid-cols-3 gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-glass text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-shadow duration-300">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">音声認識</h3>
              <p className="text-sm text-gray-600">
                高精度な音声認識技術で会話を正確にテキスト化
              </p>
            </div>

            <div className="card-glass text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-shadow duration-300">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">AI分析</h3>
              <p className="text-sm text-gray-600">
                最新のAI技術で顧客の悩みと接客品質を詳細分析
              </p>
            </div>

            <div className="card-glass text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-shadow duration-300">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">レポート生成</h3>
              <p className="text-sm text-gray-600">
                プロフェッショナルな評価シートを自動生成
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!jobId ? (
            <div className="card-gradient animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  音声ファイルをアップロード
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  美容サロンのカウンセリング音声をアップロードすると、自動で
                  <span className="font-semibold text-indigo-600">「接客評価チェックシート」</span>
                  と
                  <span className="font-semibold text-purple-600">「顧客の悩みシート」</span>
                  を生成します。
                </p>
              </div>

              <FileUploader onJobCreated={setJobId} />

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">サポート形式</p>
                      <p>MP3, WAV, M4A, AAC, OGG</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">最大ファイルサイズ</p>
                      <p>100MB まで</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <JobStatus jobId={jobId} onReset={() => setJobId(null)} />
            </div>
          )}
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-400 to-indigo-400 opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-purple-400 to-orange-400 opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
