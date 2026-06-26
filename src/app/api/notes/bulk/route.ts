import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { checkResultId } = await req.json();

  if (!checkResultId) {
    return NextResponse.json(
      { error: "缺少 checkResultId" },
      { status: 400 }
    );
  }

  // Get the check result with errors and optimizations
  const checkResult = await db.checkResult.findUnique({
    where: { id: checkResultId },
    include: {
      grammarErrors: true,
      expressionOpts: true,
      article: { select: { id: true } },
    },
  });

  if (!checkResult) {
    return NextResponse.json(
      { error: "检查结果不存在" },
      { status: 404 }
    );
  }

  if (checkResult.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // Check if notes already exist for this article
  const existingCount = await db.note.count({
    where: { articleId: checkResult.articleId },
  });

  if (existingCount > 0) {
    return NextResponse.json(
      {
        error: `已有 ${existingCount} 条笔记来自这篇文章，请勿重复添加`,
        count: existingCount,
      },
      { status: 409 }
    );
  }

  let count = 0;

  // Create notes for grammar errors
  for (const err of checkResult.grammarErrors) {
    await db.note.create({
      data: {
        userId: session.user.id,
        articleId: checkResult.articleId,
        content: `${err.originalText} → ${err.correctedText}`,
        noteType: "phrase",
        translation: err.explanation,
        sentenceContext: err.sentenceContext || null,
      },
    });
    count++;
  }

  // Create notes for expression optimizations
  for (const opt of checkResult.expressionOpts) {
    await db.note.create({
      data: {
        userId: session.user.id,
        articleId: checkResult.articleId,
        content: `${opt.originalText}`,
        noteType: "sentence",
        translation: `${opt.improvedText} — ${opt.explanation}`,
        sentenceContext: opt.sentenceContext || null,
      },
    });
    count++;
  }

  return NextResponse.json({ count, message: `已添加 ${count} 条笔记` });
}
