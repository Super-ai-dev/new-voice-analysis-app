'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, FileText, Download, RefreshCw } from 'lucide-react';

interface JobStatusProps {
  jobId: string;
  onReset: () => void;
}

type JobStatus = 'pending' | 'processing' | 'transcribing' | 'analyzing' | 'completed' | 'failed';

interface JobData {
  id: string;
  status: JobStatus;
  fileName: string;
  transcription?: string;
  customerConcerns?: string;
  serviceEvaluation?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export function JobStatus({ jobId, onReset }: JobStatusProps) {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'concerns' | 'evaluation'>('concerns');

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`/api/job-status/${jobId}`);

      if (!response.ok) {
        throw new Error('ジョブステータスの取得に失敗しました');
      }

      const data = await response.json();
      setJobData(data);

      if (data.status === 'failed') {
        toast.error('処理中にエラーが発生しました');
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
      toast.error('ステータス取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobStatus();

    // Poll for updates every 5 seconds if the job is not completed or failed
    const interval = setInterval(() => {
      if (jobData && (jobData.status === 'completed' || jobData.status === 'failed')) {
        clearInterval(interval);
      } else {
        fetchJobStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, jobData?.status]);

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case 'pending': return '処理待ち';
      case 'transcribing': return '文字起こし中...';
      case 'analyzing': return 'AI分析中...';
      case 'processing': return '処理中...';
      case 'completed': return '完了';
      case 'failed': return 'エラー';
      default: return '不明';
    }
  };

  const getStatusPercentage = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 10;
      case 'processing': return 25;
      case 'transcribing': return 50;
      case 'analyzing': return 75;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-400';
      case 'processing': return 'bg-indigo-500';
      case 'transcribing': return 'bg-orange-500';
      case 'analyzing': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusClass = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'transcribing': return 'status-transcribing';
      case 'analyzing': return 'status-analyzing';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const handleDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="card flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
        <p className="text-lg">ジョブ情報を読み込み中...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="card">
        <div className="text-center">
          <p className="text-red-500 mb-4">ジョブ情報が見つかりませんでした</p>
          <button onClick={onReset} className="btn btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            処理状況
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            ファイル名: <span className="font-medium text-gray-700">{jobData.fileName}</span>
          </p>
        </div>
        <button onClick={onReset} className="btn-ghost flex items-center gap-2 self-start sm:self-center">
          <RefreshCw className="h-4 w-4" />
          新しいファイル
        </button>
      </div>

      {/* Status Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(jobData.status)} animate-pulse`}></div>
            <span className="text-lg font-semibold text-gray-800">
              {getStatusText(jobData.status)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {getStatusPercentage(jobData.status)}%
          </span>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="progress-bar">
            <div
              className={`progress-fill ${getStatusClass(jobData.status)}`}
              style={{ width: `${getStatusPercentage(jobData.status)}%` }}
            >
              {jobData.status !== 'failed' && jobData.status !== 'completed' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              )}
            </div>
          </div>

          {/* Status milestones */}
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span className={jobData.status !== 'pending' ? 'text-indigo-600 font-medium' : ''}>
              開始
            </span>
            <span className={['transcribing', 'analyzing', 'completed'].includes(jobData.status) ? 'text-indigo-600 font-medium' : ''}>
              文字起こし
            </span>
            <span className={['analyzing', 'completed'].includes(jobData.status) ? 'text-indigo-600 font-medium' : ''}>
              AI分析
            </span>
            <span className={jobData.status === 'completed' ? 'text-green-600 font-medium' : ''}>
              完了
            </span>
          </div>
        </div>
      </div>

      {jobData.status === 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">エラー: {jobData.error || '不明なエラーが発生しました'}</p>
        </div>
      )}

      {jobData.status === 'completed' && (
        <div className="animate-slide-up">
          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                分析完了！
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-300">
              音声の分析が完了しました。以下のタブから結果をご確認ください。
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-neutral-200/50 dark:border-neutral-700/50 mb-6">
            <div className="flex gap-1">
              <button
                className={`tab-button ${activeTab === 'concerns' ? 'active' : ''}`}
                onClick={() => setActiveTab('concerns')}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  顧客の悩みシート
                </span>
              </button>
              <button
                className={`tab-button ${activeTab === 'evaluation' ? 'active' : ''}`}
                onClick={() => setActiveTab('evaluation')}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  接客評価シート
                </span>
              </button>
            </div>
          </div>

          {/* Content Display */}
          <div className="space-y-6">
            {activeTab === 'concerns' && (
              <div className="animate-fade-in">
                <div className="card-glass p-6 mb-6">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {jobData.customerConcerns}
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDownload(jobData.customerConcerns || '', '顧客の悩みシート.md')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    顧客の悩みシートをダウンロード
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'evaluation' && (
              <div className="animate-fade-in">
                <div className="card-glass p-6 mb-6">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {jobData.serviceEvaluation}
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDownload(jobData.serviceEvaluation || '', '接客評価シート.md')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    接客評価シートをダウンロード
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
