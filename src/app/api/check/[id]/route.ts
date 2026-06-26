import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const checkResult = await db.checkResult.findUnique({
    where: { id },
    include: {
      article: {
        select: {
          title: true,
          content: true,
          type: true,
          chineseText: true,
        },
      },
      grammarErrors: true,
      expressionOpts: true,
      overallScore: true,
    },
  });

  if (!checkResult) {
    return NextResponse.json({ error: "检查结果不存在" }, { status: 404 });
  }

  if (checkResult.userId !== session.user.id) {
    return NextResponse.json({ error: "无权查看" }, { status: 403 });
  }

  return NextResponse.json(checkResult);
}
