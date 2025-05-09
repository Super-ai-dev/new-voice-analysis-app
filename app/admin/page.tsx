'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Key, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Simple authentication check - in a real app, use proper authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // This should be replaced with proper auth
      setIsAuthenticated(true);
      localStorage.setItem('admin-auth', 'true');
    } else {
      toast.error('パスワードが正しくありません');
    }
  };
  
  useEffect(() => {
    // Check if already authenticated
    if (localStorage.getItem('admin-auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">管理者ログイン</h1>
        
        <div className="max-w-md mx-auto card">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">管理画面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link href="/admin/api-settings" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Key className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">API設定</h2>
              <p className="text-gray-600 dark:text-gray-300">
                STTとLLMのAPIキーを設定します
              </p>
            </div>
          </div>
        </Link>
        
        <Link href="/admin/prompt-settings" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">プロンプト設定</h2>
              <p className="text-gray-600 dark:text-gray-300">
                LLMのプロンプトテンプレートを設定します
              </p>
            </div>
          </div>
        </Link>
        
        <Link href="/admin/jobs" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">ジョブ管理</h2>
              <p className="text-gray-600 dark:text-gray-300">
                処理ジョブの一覧と状態を確認します
              </p>
            </div>
          </div>
        </Link>
        
        <Link href="/admin/settings" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">システム設定</h2>
              <p className="text-gray-600 dark:text-gray-300">
                システム全体の設定を管理します
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
