"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TranslatePage() {
  const router = useRouter();
  const [chineseText, setChineseText] = useState("");
  const [translation, setTranslation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!chineseText.trim()) {
      setError("请输入中文原文");
      return;
    }
    if (!translation.trim()) {
      setError("请输入英文翻译");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: translation,
        type: "translation",
        chineseText,
        title: `翻译练习 - ${new Date().toLocaleDateString("zh-CN")}`,
      }),
    });

    if (res.ok) {
      const article = await res.json();
      router.push(`/check/${article.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "提交失败");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">中译英</h1>
      <p className="text-sm text-gray-500 mb-8">
        输入中文原文，翻译成英文后让 AI 帮你检查
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            中文原文
          </label>
          <textarea
            value={chineseText}
            onChange={(e) => setChineseText(e.target.value)}
            placeholder="输入中文原文..."
            rows={18}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            英文翻译
          </label>
          <textarea
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="在这里写英文翻译..."
            rows={18}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "提交中..." : "AI 检查"}
        </button>
      </div>
    </div>
  );
}
