import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

interface AIConfig {
  apiKey: string;
  model: string;
  provider: string;
}

// 获取用户 AI 配置
async function getUserAIConfig(userId: string): Promise<AIConfig | null> {
  const setting = await db.aISettings.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (!setting) return null;
  return {
    apiKey: decrypt(setting.apiKey),
    model: setting.model,
    provider: setting.provider,
  };
}

// 调用 AI 生成练习文章
async function generatePracticeArticle(
  config: AIConfig,
  notesContent: string
): Promise<string> {
  const prompt = `你是一位英语教学专家。请根据以下学习者笔记中记录的薄弱点和错误，生成一篇中文短文（150-300字），让学习者翻译成英文。

要求：
1. 文章中要自然地融入笔记中涉及的词汇、短语和句式
2. 难度适中，符合雅思写作 Task 2 或日常英语的难度
3. 文章主题自选，要贴近日常生活或常见考试话题
4. 只返回中文文章内容，不要有任何额外的说明或标记

学习者的笔记内容：
${notesContent}

请直接输出中文文章：`;

  const { provider, apiKey, model } = config;

  // OpenAI 兼容 API
  const baseURL =
    provider === "deepseek"
      ? "https://api.deepseek.com/v1"
      : provider === "qwen"
        ? "https://dashscope.aliyuncs.com/compatible-mode/v1"
        : provider === "anthropic"
          ? null
          : "https://api.openai.com/v1";

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API 错误: ${err}`);
    }
    const data = await res.json();
    return data.content[0].text;
  }

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API 错误: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// POST: 生成练习文章
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const config = await getUserAIConfig(session.user.id);
  if (!config) {
    return NextResponse.json(
      { error: "请先在设置页面配置 AI 提供商和 API Key" },
      { status: 400 }
    );
  }

  const { noteIds } = await req.json();

  let notes;
  if (noteIds && noteIds.length > 0) {
    notes = await db.note.findMany({
      where: {
        id: { in: noteIds },
        userId: session.user.id,
      },
    });
  } else {
    // 如果没有指定笔记，使用最近 20 条
    notes = await db.note.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  if (notes.length === 0) {
    return NextResponse.json(
      { error: "请先添加一些笔记再生成练习" },
      { status: 400 }
    );
  }

  const notesContent = notes
    .map(
      (n, i) =>
        `${i + 1}. [${n.noteType}] ${n.content}${n.translation ? ` - ${n.translation}` : ""}`
    )
    .join("\n");

  try {
    const chineseArticle = await generatePracticeArticle(config, notesContent);

    const practice = await db.practice.create({
      data: {
        userId: session.user.id,
        chineseArticle,
        sourceNoteIds: JSON.stringify(notes.map((n) => n.id)),
      },
    });

    return NextResponse.json(practice, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "生成失败";
    console.error("Practice generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: 获取练习历史
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const practices = await db.practice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(practices);
}
