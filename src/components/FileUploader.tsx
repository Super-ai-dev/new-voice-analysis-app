import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onUploadComplete: (jobId: string) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // ファイルサイズチェック (100MB以下)
    if (file.size > 100 * 1024 * 1024) {
      setError('ファイルサイズは100MB以下にしてください');
      return;
    }
    
    // ファイル形式チェック
    if (!file.type.includes('audio/')) {
      setError('音声ファイルのみアップロード可能です');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // 署名付きURLの取得
      const urlResponse = await fetch('/api/get-upload-url');
      if (!urlResponse.ok) {
        throw new Error('アップロードURLの取得に失敗しました');
      }
      
      const { uploadUrl, storageKey } = await urlResponse.json();
      
      // ファイルのアップロード（進捗表示付き）
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      await new Promise<void>((resolve, reject) => {
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`アップロード中にエラーが発生しました: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('アップロード中にネットワークエラーが発生しました'));
        };
        
        xhr.send(file);
      });
      
      // ジョブの開始
      const jobResponse = await fetch('/api/start-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storageKey }),
      });
      
      if (!jobResponse.ok) {
        throw new Error('ジョブの開始に失敗しました');
      }
      
      const { jobId } = await jobResponse.json();
      
      // 完了通知
      onUploadComplete(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac'],
    },
    disabled: isUploading,
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <p className="text-lg font-medium">アップロード中...</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium">
              {isDragActive
                ? 'ここにファイルをドロップ'
                : '音声ファイルをドラッグ＆ドロップ、またはクリックして選択'}
            </p>
            <p className="text-sm text-gray-500">
              MP3, WAV, M4A, AAC形式（最大100MB）
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
