"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Practice {
  id: string;
  chineseArticle: string;
  sourceNoteIds: string;
  createdAt: string;
}

export default function PracticePage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [practice, setPractice] = useState<Practice | null>(null);
  const [translation, setTranslation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Practice[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const res = await fetch("/api/practice");
    if (res.ok) {
      setHistory(await res.json());
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setPractice(null);
    setTranslation("");

    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteIds: [] }),
    });

    if (res.ok) {
      const data = await res.json();
      setPractice(data);
      fetchHistory();
    } else {
      const data = await res.json();
      setError(data.error || "生成失败");
    }

    setGenerating(false);
  }

  async function handleSubmitTranslation() {
    if (!practice || !translation.trim()) return;
    setSubmitting(true);

    // 保存翻译并触发检查
    const articleRes = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: translation,
        type: "translation",
        chineseText: practice.chineseArticle,
        title: `练习翻译 - ${new Date().toLocaleDateString("zh-CN")}`,
      }),
    });

    if (articleRes.ok) {
      const article = await articleRes.json();
      router.push(`/check/${article.id}`);
    } else {
      setError("提交失败");
    }

    setSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">翻译练习</h1>
        <p className="text-sm text-gray-500 mb-8">
          AI 根据你的笔记薄弱点生成中文文章，你来翻译成英文
        </p>

        {/* 生成按钮 */}
        {!practice && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-500 mb-6">
              点击下方按钮，AI 会根据你的笔记内容生成一篇中文练习文章
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? "AI 正在生成..." : "生成练习"}
            </button>
            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
          </div>
        )}

        {/* 练习区 */}
        {practice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                中文原文（AI 生成）
              </label>
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[300px]">
                {practice.chineseArticle}
              </div>
              <button
                onClick={handleGenerate}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                重新生成
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                你的英文翻译
              </label>
              <textarea
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="在这里写你的英文翻译..."
                rows={16}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
              <button
                onClick={handleSubmitTranslation}
                disabled={submitting || !translation.trim()}
                className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "提交中..." : "提交 AI 检查"}
              </button>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              历史练习
            </h2>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                >
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {h.chineseArticle}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(h.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
