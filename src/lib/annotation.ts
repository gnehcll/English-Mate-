/**
 * Text annotation utilities for inline error highlighting.
 */

export interface AnnotationSpan {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  type: "grammar" | "expression";
}

export interface ResolvedSpan extends AnnotationSpan {
  position: number; // character offset in the content
  length: number;   // length of originalText
}

export interface TextSegment {
  text: string;
  span?: ResolvedSpan; // undefined = plain text
}

/**
 * Find character positions for each annotation span in the content.
 * Uses greedy left-to-right matching. Handles overlapping spans by
 * giving longer spans priority (shorter ones nest inside or shift right).
 */
export function findSpanPositions(
  content: string,
  grammarErrors: { id: string; originalText: string; correctedText: string; explanation: string }[],
  expressionOpts: { id: string; originalText: string; improvedText: string; explanation: string }[]
): ResolvedSpan[] {
  const spans: AnnotationSpan[] = [
    ...grammarErrors.map((e) => ({
      id: e.id,
      originalText: e.originalText,
      correctedText: e.correctedText,
      explanation: e.explanation,
      type: "grammar" as const,
    })),
    ...expressionOpts.map((e) => ({
      id: e.id,
      originalText: e.originalText,
      correctedText: e.improvedText,
      explanation: e.explanation,
      type: "expression" as const,
    })),
  ];

  const resolved: ResolvedSpan[] = [];
  const contentLower = content.toLowerCase();

  for (const span of spans) {
    // Try to find the text in content (case-insensitive)
    const searchText = span.originalText;
    const searchLower = searchText.toLowerCase();

    // Start searching from beginning; for multiple occurrences,
    // skip positions already claimed by resolved spans
    let fromIndex = 0;
    let found = false;

    while (fromIndex < content.length) {
      const idx = contentLower.indexOf(searchLower, fromIndex);
      if (idx === -1) break;

      // Check if this position overlaps with any already-resolved span
      const end = idx + searchText.length;
      const overlaps = resolved.some(
        (r) => idx < r.position + r.length && end > r.position
      );

      if (!overlaps) {
        resolved.push({
          ...span,
          position: idx,
          length: searchText.length,
        });
        found = true;
        break;
      }

      fromIndex = idx + 1;
    }

    // If not found or all occurrences overlap, skip this span
    if (!found) {
      // Try exact (case-sensitive) match as fallback
      fromIndex = 0;
      while (fromIndex < content.length) {
        const idx = content.indexOf(searchText, fromIndex);
        if (idx === -1) break;

        const end = idx + searchText.length;
        const overlaps = resolved.some(
          (r) => idx < r.position + r.length && end > r.position
        );

        if (!overlaps) {
          resolved.push({
            ...span,
            position: idx,
            length: searchText.length,
          });
          break;
        }
        fromIndex = idx + 1;
      }
    }
  }

  // Sort by position
  resolved.sort((a, b) => a.position - b.position);

  return resolved;
}

/**
 * Extract the full sentence containing a span at the given position.
 */
export function extractSentence(content: string, position: number, length: number): string {
  // Sentence boundary characters
  const boundaries = [".", "!", "?", "\n\n"];

  // Find the start of the sentence
  let start = position;
  for (let i = position - 1; i >= 0; i--) {
    const char = content[i];
    if (char === "." || char === "!" || char === "?") {
      // Check if it's really a sentence boundary (followed by space/newline or start)
      if (i === content.length - 1 || content[i + 1] === " " || content[i + 1] === "\n") {
        start = i + 1;
        break;
      }
    }
    if (i === 0) start = 0;
  }
  // Skip leading whitespace
  while (start < position && (content[start] === " " || content[start] === "\n")) {
    start++;
  }

  // Find the end of the sentence
  const spanEnd = position + length;
  let end = content.length;
  for (let i = spanEnd; i < content.length; i++) {
    const char = content[i];
    if (char === "." || char === "!" || char === "?") {
      // Check if it's really a sentence boundary
      if (i === content.length - 1 || content[i + 1] === " " || content[i + 1] === "\n") {
        end = i + 1;
        break;
      }
    }
    // Also break on double newline (paragraph break)
    if (char === "\n" && i + 1 < content.length && content[i + 1] === "\n") {
      end = i;
      break;
    }
  }

  return content.slice(start, end).trim();
}

/**
 * Split content into text segments at annotation boundaries.
 */
export function splitIntoSegments(
  content: string,
  resolved: ResolvedSpan[]
): TextSegment[] {
  if (resolved.length === 0) {
    return [{ text: content }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  // Merge overlapping spans (longer wins, shorter is dropped)
  const merged = mergeOverlappingSpans(resolved);

  for (const span of merged) {
    // Add plain text before this span
    if (span.position > cursor) {
      segments.push({ text: content.slice(cursor, span.position) });
    }
    // Add the annotated span
    segments.push({
      text: content.slice(span.position, span.position + span.length),
      span,
    });
    cursor = span.position + span.length;
  }

  // Add remaining text
  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor) });
  }

  return segments;
}

function mergeOverlappingSpans(spans: ResolvedSpan[]): ResolvedSpan[] {
  if (spans.length <= 1) return spans;

  const result: ResolvedSpan[] = [spans[0]];

  for (let i = 1; i < spans.length; i++) {
    const current = spans[i];
    const last = result[result.length - 1];

    if (current.position < last.position + last.length) {
      // Overlap detected: keep the longer span
      if (current.length > last.length) {
        result[result.length - 1] = current;
      }
      // Otherwise, drop current (keep shorter one already in result)
    } else {
      result.push(current);
    }
  }

  return result;
}
