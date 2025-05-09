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
      case 'transcribing': return 30;
      case 'analyzing': return 70;
      case 'processing': return 50;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
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
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">処理状況</h2>
        <button onClick={onReset} className="btn btn-secondary flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          新しいファイル
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">ファイル名: {jobData.fileName}</p>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {getStatusText(jobData.status)}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                jobData.status === 'failed' ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{ width: `${getStatusPercentage(jobData.status)}%` }}
            />
          </div>
        </div>
      </div>
      
      {jobData.status === 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">エラー: {jobData.error || '不明なエラーが発生しました'}</p>
        </div>
      )}
      
      {jobData.status === 'completed' && (
        <div>
          <div className="border-b border-gray-200 mb-4">
            <div className="flex">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'concerns'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('concerns')}
              >
                顧客の悩みシート
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'evaluation'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('evaluation')}
              >
                接客評価シート
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            {activeTab === 'concerns' && (
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{jobData.customerConcerns}</pre>
                </div>
                <button
                  onClick={() => handleDownload(jobData.customerConcerns || '', '顧客の悩みシート.md')}
                  className="btn btn-primary flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ダウンロード
                </button>
              </div>
            )}
            
            {activeTab === 'evaluation' && (
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{jobData.serviceEvaluation}</pre>
                </div>
                <button
                  onClick={() => handleDownload(jobData.serviceEvaluation || '', '接客評価シート.md')}
                  className="btn btn-primary flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ダウンロード
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
