"use client";

import { useState, useEffect } from "react";

const PROVIDERS: ProviderInfo[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini"],
  },
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    models: [
      "claude-fable-5",
      "claude-opus-4-8",
      "claude-sonnet-4-6",
      "claude-haiku-4-5",
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-v4-pro", "deepseek-v4-flash"],
  },
  {
    id: "qwen",
    name: "通义千问",
    models: ["qwen-max", "qwen-plus", "qwen-turbo"],
  },
];

interface ProviderInfo {
  id: string;
  name: string;
  models: string[];
}

interface SavedSetting {
  id: string;
  provider: string;
  model: string;
  hasKey: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [savedSettings, setSavedSettings] = useState<SavedSetting[]>([]);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setSavedSettings(data);
    }
  }

  function openProvider(providerId: string) {
    setActiveProvider(providerId);
    const existing = savedSettings.find((s) => s.provider === providerId);
    setModel(existing?.model || PROVIDERS.find((p) => p.id === providerId)?.models[0] || "");
    setApiKey("");
    setMessage(null);
  }

  async function handleSave() {
    if (!activeProvider || !apiKey || !model) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: activeProvider, apiKey, model }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "保存成功" });
      setActiveProvider(null);
      setApiKey("");
      fetchSettings();
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "保存失败" });
    }
    setLoading(false);
  }

  async function handleDelete(provider: string) {
    if (!confirm(`确认删除 ${provider} 的 API Key 设置？`)) return;
    await fetch("/api/settings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    fetchSettings();
  }

  const provider = activeProvider
    ? PROVIDERS.find((p) => p.id === activeProvider)
    : null;

  return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-sm text-gray-500 mb-8">
          配置 AI 提供商和 API Key，你的密钥将被加密存储
        </p>

        {/* 已保存的设置 */}
        {savedSettings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-700 mb-3">已配置的提供商</h2>
            <div className="space-y-2">
              {savedSettings.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {PROVIDERS.find((p) => p.id === s.provider)?.name}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      模型：{s.model}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(s.provider)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加/编辑提供商 */}
        {activeProvider && provider ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">
                配置 {provider.name}
              </h2>
              <button
                onClick={() => setActiveProvider(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>

            {message && (
              <div
                className={`text-sm px-3 py-2 rounded-lg mb-4 ${
                  message.type === "success"
                    ? "text-green-700 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`输入你的 ${provider.name} API Key`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  你的密钥将被 AES-256 加密存储
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模型
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {provider.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !apiKey}
                className="w-full h-10 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROVIDERS.map((p) => {
              const isSaved = savedSettings.some((s) => s.provider === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => openProvider(p.id)}
                  className={`text-left p-6 bg-white border rounded-xl hover:shadow-sm transition-shadow ${
                    isSaved
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    {isSaved && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        已配置
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {p.models.join(" / ")}
                  </p>
                </button>
              );
            })}
          </div>
        )}
    </main>
  );
}
