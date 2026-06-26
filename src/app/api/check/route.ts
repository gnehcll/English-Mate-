import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { performCheck } from "@/lib/ai";
import { findSpanPositions, extractSentence } from "@/lib/annotation";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { articleId } = await req.json();

  if (!articleId) {
    return NextResponse.json({ error: "缺少文章 ID" }, { status: 400 });
  }

  // 获取文章
  const article = await db.article.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  if (article.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  try {
    // 执行 AI 检查
    const result = await performCheck(
      session.user.id,
      article.content,
      article.title,
      article.chineseText
    );

    // Generate temp IDs for position matching
    const grammarWithIds = result.grammarErrors.map((e, i) => ({
      id: `g-${i}`,
      originalText: e.originalText,
      correctedText: e.correctedText,
      explanation: e.explanation,
    }));
    const exprWithIds = result.expressionOpts.map((o, i) => ({
      id: `e-${i}`,
      originalText: o.originalText,
      improvedText: o.improvedText,
      explanation: o.explanation,
    }));

    // Compute positions for inline annotation
    const resolvedSpans = findSpanPositions(
      article.content,
      grammarWithIds,
      exprWithIds
    );

    // Build lookup: temp id → position
    const posById = new Map<string, { position: number; length: number }>();
    for (const span of resolvedSpans) {
      posById.set(span.id, { position: span.position, length: span.length });
    }

    // Save check result to database
    const checkResult = await db.checkResult.create({
      data: {
        articleId: article.id,
        userId: session.user.id,
        grammarErrors: {
          create: result.grammarErrors.map((e, i) => {
            const pos = posById.get(`g-${i}`);
            const sentenceCtx = e.sentenceContext ||
              (pos ? extractSentence(article.content, pos.position, pos.length) : null);
            return {
              originalText: e.originalText,
              correctedText: e.correctedText,
              errorType: e.errorType,
              explanation: e.explanation,
              position: pos?.position ?? null,
              sentenceContext: sentenceCtx,
            };
          }),
        },
        expressionOpts: {
          create: result.expressionOpts.map((o, i) => {
            const pos = posById.get(`e-${i}`);
            const sentenceCtx = o.sentenceContext ||
              (pos ? extractSentence(article.content, pos.position, pos.length) : null);
            return {
              originalText: o.originalText,
              improvedText: o.improvedText,
              explanation: o.explanation,
              position: pos?.position ?? null,
              sentenceContext: sentenceCtx,
            };
          }),
        },
        overallScore: {
          create: {
            ieltsScore: result.overallScore.ieltsScore,
            summary: result.overallScore.summary,
            mainIssues: JSON.stringify(result.overallScore.mainIssues),
          },
        },
      },
    });

    return NextResponse.json({
      checkResultId: checkResult.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 检查失败";
    console.error("AI Check error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
