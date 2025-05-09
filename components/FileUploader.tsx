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
      console.log('Uploading with token:', token);
      try {
        const { error: uploadError } = await supabase.storage
          .from('audio-uploads')
          .uploadToSignedUrl(path, token, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`ファイルのアップロードに失敗しました: ${uploadError.message}`);
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
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
      toast.error('アップロード中にエラーが発生しました');
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
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 hover:border-primary-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
              <p>アップロード中... {uploadProgress}%</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p>
                {isDragActive
                  ? 'ここにファイルをドロップ'
                  : 'クリックまたはドラッグ&ドロップでファイルを選択'}
              </p>
              <p className="text-sm text-gray-500">
                サポート形式: MP3, WAV, M4A, AAC, OGG (最大100MB)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
