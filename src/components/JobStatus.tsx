import { useState, useEffect } from 'react';

interface JobStatusProps {
  jobId: string;
  onComplete?: () => void;
}

interface JobData {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  createdAt: string;
  completedAt?: string;
  checkMdUrl?: string;
  painMdUrl?: string;
  error?: string;
}

export default function JobStatus({ jobId, onComplete }: JobStatusProps) {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobStatus = async () => {
      try {
        const response = await fetch(`/api/job-status/${jobId}`);
        
        if (!response.ok) {
          throw new Error('ジョブ情報の取得に失敗しました');
        }
        
        const data = await response.json();
        setJobData(data);
        
        if (data.status === 'completed' && onComplete) {
          onComplete();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    // 初回読み込み
    fetchJobStatus();
    
    // ポーリング設定（5秒ごと）
    const intervalId = setInterval(fetchJobStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [jobId, onComplete]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        <p>ジョブ情報が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-lg font-medium">ジョブ状態</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ジョブID</p>
              <p className="font-mono text-sm">{jobData.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">ステータス</p>
              <StatusBadge status={jobData.status} />
            </div>
            
            <div>
              <p className="text-sm text-gray-500">作成日時</p>
              <p>{new Date(jobData.createdAt).toLocaleString()}</p>
            </div>
            
            {jobData.completedAt && (
              <div>
                <p className="text-sm text-gray-500">完了日時</p>
                <p>{new Date(jobData.completedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          {jobData.error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p className="font-medium">エラー</p>
              <p>{jobData.error}</p>
            </div>
          )}
          
          {jobData.status === 'completed' && (
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-medium">生成されたドキュメント</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobData.checkMdUrl && (
                  <a
                    href={jobData.checkMdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">接客評価チェックシート</p>
                      <p className="text-sm text-gray-500">クリックして表示</p>
                    </div>
                  </a>
                )}
                
                {jobData.painMdUrl && (
                  <a
                    href={jobData.painMdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">顧客の悩みシート</p>
                      <p className="text-sm text-gray-500">クリックして表示</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {(jobData.status === 'queued' || jobData.status === 'processing') && (
        <div className="text-center text-sm text-gray-500">
          <p>処理には数分かかる場合があります。このページを開いたままお待ちください。</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let label = status;
  
  switch (status) {
    case 'queued':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = '処理待ち';
      break;
    case 'processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = '処理中';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = '完了';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'エラー';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
