'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiSetting {
  id: string;
  name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ApiSettingsPage() {
  const [apiSettings, setApiSettings] = useState<ApiSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ api_key: string; is_active: boolean }>({
    api_key: '',
    is_active: true,
  });

  useEffect(() => {
    fetchApiSettings();
  }, []);

  const fetchApiSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/api-keys');
      
      if (!response.ok) {
        throw new Error('API設定の取得に失敗しました');
      }
      
      const data = await response.json();
      setApiSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (setting: ApiSetting) => {
    setEditingId(setting.id);
    setEditForm({
      api_key: setting.api_key,
      is_active: setting.is_active,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const saveApiSetting = async (id: string) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...editForm,
        }),
      });
      
      if (!response.ok) {
        throw new Error('API設定の更新に失敗しました');
      }
      
      // 更新成功後、設定を再取得
      await fetchApiSettings();
      setSuccessMessage('API設定を更新しました');
      setEditingId(null);
      
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

  const getServiceLabel = (name: string) => {
    switch (name) {
      case 'openai':
        return 'OpenAI';
      case 'gemini':
        return 'Google Gemini';
      case 'groq':
        return 'Groq';
      case 'google_stt':
        return 'Google Speech-to-Text';
      default:
        return name;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">API設定</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← 管理画面に戻る
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

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-medium">API設定</h2>
            <p className="text-sm text-gray-500 mt-1">
              各AIサービスのAPIキーを設定します。有効/無効を切り替えることで使用するサービスを選択できます。
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        サービス
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        APIキー
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiSettings.map((setting) => (
                      <tr key={setting.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getServiceLabel(setting.name)}
                          </div>
                          <div className="text-sm text-gray-500">{setting.name}</div>
                        </td>
                        <td className="px-4 py-4">
                          {editingId === setting.id ? (
                            <input
                              type="text"
                              name="api_key"
                              value={editForm.api_key}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 max-w-md truncate">
                              {setting.api_key.length > 30
                                ? `${setting.api_key.substring(0, 15)}...${setting.api_key.substring(
                                    setting.api_key.length - 10
                                  )}`
                                : setting.api_key}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {editingId === setting.id ? (
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                name="is_active"
                                checked={editForm.is_active}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">有効</span>
                            </label>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                setting.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {setting.is_active ? '有効' : '無効'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {editingId === setting.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveApiSetting(setting.id)}
                                disabled={isSaving}
                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                              >
                                {isSaving ? '保存中...' : '保存'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm font-medium"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(setting)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              編集
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
