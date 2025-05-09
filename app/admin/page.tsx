'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [checkPrompt, setCheckPrompt] = useState('');
  const [painPrompt, setPainPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/settings/prompt');

        if (!response.ok) {
          throw new Error('プロンプト設定の取得に失敗しました');
        }

        const data = await response.json();

        setCheckPrompt(data.check_prompt || '');
        setPainPrompt(data.pain_prompt || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/settings/prompt', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          check_prompt: checkPrompt,
          pain_prompt: painPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('プロンプト設定の更新に失敗しました');
      }

      setSuccessMessage('プロンプト設定を更新しました');

      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">管理画面</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/api-settings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                API設定 →
              </Link>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← ユーザー画面に戻る
              </Link>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-medium">プロンプト設定</h2>
          </div>

          {isLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                  <p>{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-100 text-green-700 rounded-md">
                  <p>{successMessage}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="check-prompt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  接客評価チェックシート生成プロンプト
                </label>
                <textarea
                  id="check-prompt"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={checkPrompt}
                  onChange={(e) => setCheckPrompt(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="pain-prompt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  顧客の悩みシート生成プロンプト
                </label>
                <textarea
                  id="pain-prompt"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={painPrompt}
                  onChange={(e) => setPainPrompt(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? '保存中...' : '設定を保存'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
