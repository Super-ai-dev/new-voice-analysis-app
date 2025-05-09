'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

export default function ApiSettingsPage() {
  const [sttApiKey, setSTTApiKey] = useState('');
  const [llmApiKey, setLLMApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSTTKey, setShowSTTKey] = useState(false);
  const [showLLMKey, setShowLLMKey] = useState(false);
  
  useEffect(() => {
    // Check authentication
    if (localStorage.getItem('admin-auth') !== 'true') {
      window.location.href = '/admin';
      return;
    }
    
    // Fetch API keys
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/settings/api-keys');
        
        if (!response.ok) {
          throw new Error('APIキーの取得に失敗しました');
        }
        
        const data = await response.json();
        
        // Set the API keys
        const sttKey = data.find((key: ApiKey) => key.name === 'stt');
        const llmKey = data.find((key: ApiKey) => key.name === 'llm');
        
        if (sttKey) setSTTApiKey(sttKey.key);
        if (llmKey) setLLMApiKey(llmKey.key);
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast.error('APIキーの取得中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApiKeys();
  }, []);
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stt: sttApiKey,
          llm: llmApiKey,
        }),
      });
      
      if (!response.ok) {
        throw new Error('APIキーの保存に失敗しました');
      }
      
      toast.success('APIキーが保存されました');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('APIキーの保存中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            管理画面に戻る
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">API設定</h1>
        
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">APIキー設定</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            音声認識とAI分析に使用するAPIキーを設定します。これらのキーは安全に保管され、サーバーサイドでのみ使用されます。
          </p>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="stt-api-key" className="block text-sm font-medium mb-1">
                音声認識 (STT) APIキー
              </label>
              <div className="relative">
                <input
                  type={showSTTKey ? 'text' : 'password'}
                  id="stt-api-key"
                  value={sttApiKey}
                  onChange={(e) => setSTTApiKey(e.target.value)}
                  className="input pr-10"
                  placeholder="STT APIキーを入力"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowSTTKey(!showSTTKey)}
                >
                  {showSTTKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Google Cloud Speech-to-Text APIキーを入力してください
              </p>
            </div>
            
            <div>
              <label htmlFor="llm-api-key" className="block text-sm font-medium mb-1">
                AI分析 (LLM) APIキー
              </label>
              <div className="relative">
                <input
                  type={showLLMKey ? 'text' : 'password'}
                  id="llm-api-key"
                  value={llmApiKey}
                  onChange={(e) => setLLMApiKey(e.target.value)}
                  className="input pr-10"
                  placeholder="LLM APIキーを入力"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowLLMKey(!showLLMKey)}
                >
                  {showLLMKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                OpenAI API、Anthropic API、またはGroq APIキーを入力してください
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary flex items-center"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
