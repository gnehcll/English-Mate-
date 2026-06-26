import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// 获取用户笔记列表
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const notes = await db.note.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

// 创建笔记
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { content, noteType, translation, articleId, sentenceContext } = await req.json();

  if (!content || !noteType) {
    return NextResponse.json(
      { error: "缺少必要参数" },
      { status: 400 }
    );
  }

  const note = await db.note.create({
    data: {
      userId: session.user.id,
      content,
      noteType,
      translation: translation || null,
      articleId: articleId || null,
      sentenceContext: sentenceContext || null,
    },
  });

  return NextResponse.json(note, { status: 201 });
}

// 删除笔记
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await req.json();

  const note = await db.note.findUnique({ where: { id } });
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  await db.note.delete({ where: { id } });

  return NextResponse.json({ message: "已删除" });
}
