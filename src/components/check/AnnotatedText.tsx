"use client";

import { useMemo } from "react";
import {
  findSpanPositions,
  splitIntoSegments,
  type ResolvedSpan,
} from "@/lib/annotation";

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

interface AnnotatedTextProps {
  content: string;
  grammarErrors: GrammarError[];
  expressionOpts: ExpressionOpt[];
  selectedSpanId: string | null;
  onSpanClick: (span: ResolvedSpan) => void;
}

export default function AnnotatedText({
  content,
  grammarErrors,
  expressionOpts,
  selectedSpanId,
  onSpanClick,
}: AnnotatedTextProps) {
  const segments = useMemo(() => {
    const resolved = findSpanPositions(content, grammarErrors, expressionOpts);
    return splitIntoSegments(content, resolved);
  }, [content, grammarErrors, expressionOpts]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 leading-relaxed text-base text-gray-800 whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (!seg.span) {
          // Plain text
          return <span key={i}>{seg.text}</span>;
        }

        const isGrammar = seg.span.type === "grammar";
        const isSelected = seg.span.id === selectedSpanId;

        return (
          <span
            key={seg.span.id}
            onClick={() => onSpanClick(seg.span!)}
            className={`relative inline cursor-pointer rounded px-0.5 -mx-0.5 border-b-2 transition-all duration-150 ${
              isGrammar
                ? isSelected
                  ? "bg-red-100 border-red-500 ring-2 ring-red-300"
                  : "bg-red-50 border-red-400 hover:bg-red-100"
                : isSelected
                  ? "bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300"
                  : "bg-yellow-50 border-yellow-400 hover:bg-yellow-100"
            }`}
            title={
              isGrammar
                ? `✏️ ${seg.span.correctedText}\n${seg.span.explanation}`
                : `💡 ${seg.span.correctedText}\n${seg.span.explanation}`
            }
          >
            {seg.text}
            {isGrammar && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </span>
        );
      })}
    </div>
  );
}
