"use client";

import { useState } from "react";
import AnnotatedText from "./AnnotatedText";
import DetailPanel from "./DetailPanel";
import type { ResolvedSpan } from "@/lib/annotation";

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

interface CheckLayoutProps {
  content: string;
  grammarErrors: GrammarError[];
  expressionOpts: ExpressionOpt[];
  overallScore: OverallScore | null;
  articleId: string;
  checkResultId: string;
  articleType: string;
}

export default function CheckLayout({
  content,
  grammarErrors,
  expressionOpts,
  overallScore,
  articleId,
  checkResultId,
  articleType,
}: CheckLayoutProps) {
  const [selectedSpan, setSelectedSpan] = useState<ResolvedSpan | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  function handleSpanClick(span: ResolvedSpan) {
    if (selectedSpan?.id === span.id) {
      // Deselect
      setSelectedSpan(null);
      setShowMobileDetail(false);
    } else {
      setSelectedSpan(span);
      setShowMobileDetail(true);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Article header info */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {articleType === "writing" ? "自由写作" : "中译英"}
        </span>
        <span className="text-xs text-gray-400">
          {grammarErrors.length} 个语法错误 · {expressionOpts.length} 个表达建议
        </span>
      </div>

      <div className="flex gap-6">
        {/* Left: Annotated Article */}
        <div className="flex-1 min-w-0">
          <AnnotatedText
            content={content}
            grammarErrors={grammarErrors}
            expressionOpts={expressionOpts}
            selectedSpanId={selectedSpan?.id ?? null}
            onSpanClick={handleSpanClick}
          />
        </div>

        {/* Right: Detail Panel (desktop) */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-4">
            <DetailPanel
              selectedSpan={selectedSpan}
              overallScore={overallScore}
              articleId={articleId}
              checkResultId={checkResultId}
              onNoteAdded={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Detail Panel overlay */}
      {showMobileDetail && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setShowMobileDetail(false);
              setSelectedSpan(null);
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto bg-white rounded-t-2xl shadow-xl">
            <div className="sticky top-0 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 rounded-t-2xl">
              <span className="text-sm font-medium text-gray-700">详情</span>
              <button
                onClick={() => {
                  setShowMobileDetail(false);
                  setSelectedSpan(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <DetailPanel
              selectedSpan={selectedSpan}
              overallScore={overallScore}
              articleId={articleId}
              checkResultId={checkResultId}
              onNoteAdded={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
