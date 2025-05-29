'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FileUploaderProps {
  onJobCreated: (jobId: string) => void;
}

export function FileUploader({ onJobCreated }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Check file type
    if (!file.type.includes('audio')) {
      toast.error('音声ファイルのみアップロード可能です');
      return;
    }

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('ファイルサイズは100MB以下にしてください');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique job ID
      const jobId = uuidv4();

      // Get a signed URL for upload
      const response = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          jobId,
        }),
      });

      if (!response.ok) {
        throw new Error('アップロードURLの取得に失敗しました');
      }

      const { url, token, path } = await response.json();

      // Upload the file using Supabase's uploadToSignedUrl method
      console.log('Uploading file:', file.name);
      console.log('Upload path:', path);
      console.log('Upload token:', token);

      const { error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .uploadToSignedUrl(path, token, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);

        // より具体的なエラーメッセージを提供
        let errorMessage = 'ファイルのアップロードに失敗しました';
        if (uploadError.message.includes('Invalid key')) {
          errorMessage = 'ファイル名に問題があります。ファイル名を変更してもう一度お試しください。';
        } else if (uploadError.message.includes('bucket')) {
          errorMessage = 'ストレージの設定に問題があります。管理者にお問い合わせください。';
        } else {
          errorMessage = `アップロードエラー: ${uploadError.message}`;
        }

        throw new Error(errorMessage);
      }

      // Start the processing job
      const startJobResponse = await fetch('/api/start-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          fileName: file.name,
        }),
      });

      if (!startJobResponse.ok) {
        throw new Error('ジョブの開始に失敗しました');
      }

      toast.success('ファイルがアップロードされました');
      onJobCreated(jobId);
    } catch (error) {
      console.error('Upload error:', error);

      // エラーメッセージを適切に表示
      const errorMessage = error instanceof Error ? error.message : 'アップロード中にエラーが発生しました';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [onJobCreated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
    },
    maxFiles: 1,
  });

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={`upload-zone group ${isDragActive ? 'active' : ''} ${isUploading ? 'pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        {/* Upload Icon with Animation */}
        <div className="relative mb-6">
          {isUploading ? (
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                <Upload className="h-10 w-10 text-white" />
              </div>

              {/* Floating particles */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-float opacity-60"></div>
              </div>
              <div className="absolute top-4 right-1/4 transform translate-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="absolute top-2 left-1/4 transform -translate-x-2">
                <div className="w-1 h-1 bg-orange-400 rounded-full animate-float opacity-50" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isUploading ? (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">
                アップロード中...
              </h3>
              <div className="max-w-xs mx-auto">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {uploadProgress}% 完了
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {isDragActive ? (
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ここにファイルをドロップ
                  </span>
                ) : (
                  'ファイルを選択'
                )}
              </h3>

              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {isDragActive
                  ? 'ファイルをドロップしてアップロードを開始'
                  : 'クリックまたはドラッグ&ドロップでファイルを選択してください'}
              </p>

              {/* File format indicators */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['MP3', 'WAV', 'M4A', 'AAC', 'OGG'].map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                  >
                    {format}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                最大ファイルサイズ: 100MB
              </p>
            </div>
          )}
        </div>

        {/* Hover effect overlay */}
        {!isUploading && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        )}
      </div>

      {/* Success animation overlay */}
      {isUploading && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-pulse"></div>
      )}
    </div>
  );
}
