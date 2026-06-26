"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WritePage() {
  const router = useRouter();
  const [showTopic, setShowTopic] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: showTopic && title ? title : null,
        content,
        type: "writing",
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">自由写作</h1>
      <p className="text-sm text-gray-500 mb-8">
        用英文写一篇文章，AI 会帮你检查语法、优化表达并打分
      </p>

      <div className="space-y-4">
        {/* 题目开关 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTopic(!showTopic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showTopic ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showTopic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">题目</span>
        </div>

        {showTopic && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入写作题目或主题..."
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里写英文文章..."
          rows={18}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
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
