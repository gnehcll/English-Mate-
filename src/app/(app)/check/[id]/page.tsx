"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CheckLayout from "@/components/check/CheckLayout";

interface GrammarError {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
}

interface ExpressionOpt {
  id: string;
  originalText: string;
  improvedText: string;
  explanation: string;
}

interface OverallScore {
  ieltsScore: number;
  summary: string;
  mainIssues: string;
}

interface CheckData {
  id: string;
  articleId: string;
  article: {
    title: string | null;
    content: string;
    type: string;
    chineseText: string | null;
  };
  grammarErrors: GrammarError[];
  expressionOpts: ExpressionOpt[];
  overallScore: OverallScore | null;
}

export default function CheckResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrCheck() {
      setLoading(true);

      // Try fetching existing check result
      const res = await fetch(`/api/check/${id}`);

      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLoading(false);
        return;
      }

      // No existing result — trigger AI check
      if (res.status === 404) {
        const checkRes = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: id }),
        });

        if (checkRes.ok) {
          const { checkResultId } = await checkRes.json();
          const reloadRes = await fetch(`/api/check/${checkResultId}`);
          if (reloadRes.ok) {
            setData(await reloadRes.json());
          } else {
            setError("无法加载检查结果");
          }
        } else {
          const errData = await checkRes.json();
          setError(errData.error || "AI 检查失败");
        }
      } else {
        setError("无法加载数据");
      }
      setLoading(false);
    }

    loadOrCheck();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-2xl mb-4 animate-pulse">🔍</div>
          <p className="text-gray-500">AI 正在检查你的文章...</p>
          <p className="text-sm text-gray-400 mt-2">这可能需要几秒钟</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">检查失败</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Link
            href="/write"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            返回写作
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <CheckLayout
      content={data.article.content}
      grammarErrors={data.grammarErrors}
      expressionOpts={data.expressionOpts}
      overallScore={data.overallScore}
      articleId={data.articleId}
      checkResultId={data.id}
      articleType={data.article.type}
    />
  );
}
