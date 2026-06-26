"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoryArticle {
  id: string;
  title: string | null;
  content: string;
  type: string;
  chineseText: string | null;
  createdAt: string;
  checkResults: {
    id: string;
    createdAt: string;
    overallScore: { ieltsScore: number } | null;
    _count: { grammarErrors: number; expressionOpts: number };
  }[];
}

function groupByDate(articles: HistoryArticle[]) {
  const groups: { label: string; items: HistoryArticle[] }[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  for (const a of articles) {
    const d = new Date(a.createdAt);
    let label = "更早";
    if (d >= today) label = "今天";
    else if (d >= yesterday) label = "昨天";
    else if (d >= weekAgo) label = "本周";

    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(a);
  }
  return groups;
}

export default function HistoryPage() {
  const [articles, setArticles] = useState<HistoryArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      const res = await fetch("/api/articles");
      if (res.ok) {
        setArticles(await res.json());
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-center text-gray-400 py-20">加载中...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">历史记录</h1>
        <p className="text-sm text-gray-500 mb-8">你写过的文章和 AI 检查结果</p>
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500 mb-2">还没有写作记录</p>
          <p className="text-sm text-gray-400">
            开始写作或翻译，AI 检查后会显示在这里
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link
              href="/write"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              开始写作
            </Link>
            <Link
              href="/translate"
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              开始翻译
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const groups = groupByDate(articles);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">历史记录</h1>
      <p className="text-sm text-gray-500 mb-8">你写过的文章和 AI 检查结果</p>

      {groups.map((group) => (
        <div key={group.label} className="mb-8">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            {group.label}
          </h2>
          <div className="space-y-2">
            {group.items.map((a) => {
              const lastCheck = a.checkResults?.[0];
              return (
                <Link
                  key={a.id}
                  href={
                    lastCheck ? `/check/${lastCheck.id}` : `/check/${a.id}`
                  }
                  className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                          {a.type === "writing" ? "写作" : "翻译"}
                        </span>
                        {lastCheck?.overallScore && (
                          <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                            Band {lastCheck.overallScore.ieltsScore}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 font-medium line-clamp-1">
                        {a.title || a.content.slice(0, 50) || "无标题"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(a.createdAt).toLocaleString("zh-CN")}
                        {lastCheck &&
                          ` · ${lastCheck._count.grammarErrors} 个错误 · ${lastCheck._count.expressionOpts} 个建议`}
                      </p>
                    </div>
                    <span className="text-gray-300 text-sm shrink-0 mt-1">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
