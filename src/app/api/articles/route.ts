import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// 获取用户的文章列表
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const articles = await db.article.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      content: true,
      chineseText: true,
      createdAt: true,
      checkResults: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          createdAt: true,
          overallScore: {
            select: { ieltsScore: true },
          },
          _count: {
            select: { grammarErrors: true, expressionOpts: true },
          },
        },
      },
    },
    take: 20,
  });

  return NextResponse.json(articles);
}

// 创建文章
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { title, content, type, chineseText } = await req.json();

  if (!content || !type) {
    return NextResponse.json(
      { error: "内容不能为空" },
      { status: 400 }
    );
  }

  if (!["writing", "translation"].includes(type)) {
    return NextResponse.json(
      { error: "类型无效" },
      { status: 400 }
    );
  }

  const article = await db.article.create({
    data: {
      userId: session.user.id,
      title: title || null,
      content,
      type,
      chineseText: chineseText || null,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
