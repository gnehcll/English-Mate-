import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

// 获取用户的 AI 设置
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const settings = await db.aISettings.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      provider: true,
      model: true,
      createdAt: true,
      // 不返回 apiKey，但返回是否已设置
    },
  });

  // 返回每个提供商是否有 API Key（但不返回 Key 内容）
  const result = settings.map((s) => ({
    ...s,
    hasKey: true,
  }));

  return NextResponse.json(result);
}

// 保存 AI 设置
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { provider, apiKey, model } = await req.json();

  if (!provider || !apiKey || !model) {
    return NextResponse.json(
      { error: "缺少必要参数" },
      { status: 400 }
    );
  }

  const encryptedKey = encrypt(apiKey);

  // upsert：如果该提供商已有设置则更新，否则创建
  const setting = await db.aISettings.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider,
      },
    },
    update: {
      apiKey: encryptedKey,
      model,
    },
    create: {
      userId: session.user.id,
      provider,
      apiKey: encryptedKey,
      model,
    },
  });

  return NextResponse.json({
    id: setting.id,
    provider: setting.provider,
    model: setting.model,
    hasKey: true,
  });
}

// 删除 AI 设置
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { provider } = await req.json();

  await db.aISettings.deleteMany({
    where: {
      userId: session.user.id,
      provider,
    },
  });

  return NextResponse.json({ message: "已删除" });
}
