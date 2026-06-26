"use client";

import toast from "react-hot-toast";
import type { ResolvedSpan } from "@/lib/annotation";

interface OverallScore {
  ieltsScore: number;
  summary: string;
  mainIssues: string;
}

interface DetailPanelProps {
  selectedSpan: ResolvedSpan | null;
  overallScore: OverallScore | null;
  articleId: string;
  checkResultId: string;
  onNoteAdded: () => void;
}

export default function DetailPanel({
  selectedSpan,
  overallScore,
  articleId,
  checkResultId,
  onNoteAdded,
}: DetailPanelProps) {
  async function addSingleNote() {
    if (!selectedSpan) return;

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `${selectedSpan.originalText} → ${selectedSpan.correctedText}`,
        noteType: selectedSpan.type === "grammar" ? "phrase" : "sentence",
        translation: selectedSpan.explanation,
        articleId,
      }),
    });

    if (res.ok) {
      toast.success("已加入笔记");
      onNoteAdded();
    } else {
      toast.error("添加失败");
    }
  }

  const score = overallScore?.ieltsScore ?? 0;
  const scorePercent = Math.min((score / 9) * 100, 100);

  let mainIssues: string[] = [];
  try {
    if (overallScore?.mainIssues) {
      mainIssues = JSON.parse(overallScore.mainIssues);
    }
  } catch {
    mainIssues = [];
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {/* Selected Error Detail */}
      {selectedSpan ? (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                selectedSpan.type === "grammar" ? "bg-red-500" : "bg-yellow-500"
              }`}
            />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {selectedSpan.type === "grammar" ? "语法错误" : "表达优化"}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">原文</p>
              <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 line-through decoration-red-300">
                {selectedSpan.originalText}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">
                {selectedSpan.type === "grammar" ? "修改建议" : "更地道的表达"}
              </p>
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                {selectedSpan.correctedText}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">解释</p>
              <p className="text-sm text-gray-600">{selectedSpan.explanation}</p>
            </div>
          </div>

          <button
            onClick={addSingleNote}
            className="mt-4 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            + 加入笔记
          </button>
        </div>
      ) : (
        <div className="p-5 text-center text-sm text-gray-400">
          <p>点击文章中标注的文字</p>
          <p>查看详细解释</p>
        </div>
      )}

      {/* IELTS Score (always visible) */}
      <div className="p-5">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
          IELTS 评分
        </h3>

        {overallScore ? (
          <>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-bold text-blue-600 leading-none">
                {score}
              </span>
              <span className="text-sm text-gray-400 mb-1">/ 9</span>
            </div>

            {/* Score bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {overallScore.summary}
            </p>

            {mainIssues.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">主要问题</p>
                <ul className="space-y-1.5">
                  {mainIssues.map((issue, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-blue-400 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">暂无评分数据</p>
        )}
      </div>

      {/* Add All Notes Button (placeholder, implemented in Phase G) */}
      <div className="p-5">
        <button
          onClick={async () => {
            const res = await fetch("/api/notes/bulk", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ checkResultId }),
            });

            if (res.ok) {
              const data = await res.json();
              toast.success(`已添加 ${data.count} 条笔记`);
              onNoteAdded();
            } else {
              const data = await res.json();
              toast.error(data.error || "添加失败");
            }
          }}
          className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
        >
          一键添加全部笔记
        </button>
      </div>
    </div>
  );
}
