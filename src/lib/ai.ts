import { db } from "./db";
import { decrypt } from "./encryption";

interface AIConfig {
  apiKey: string;
  model: string;
  provider: string;
}

interface GrammarError {
  originalText: string;
  correctedText: string;
  errorType: string;
  explanation: string;
  sentenceContext: string | null;
}

interface ExpressionOpt {
  originalText: string;
  improvedText: string;
  explanation: string;
  sentenceContext: string | null;
}

interface OverallScoreResult {
  ieltsScore: number;
  summary: string;
  mainIssues: string[];
}

export interface CheckResult {
  grammarErrors: GrammarError[];
  expressionOpts: ExpressionOpt[];
  overallScore: OverallScoreResult;
}

// 获取用户的默认 AI 配置（第一个配置的提供商）
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

// 调用 AI（支持 OpenAI / Anthropic / DeepSeek / 通义千问）
async function callAI(
  config: AIConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { provider, apiKey, model } = config;

  // DeepSeek 和 Qwen 是 OpenAI 兼容 API
  if (provider === "openai" || provider === "deepseek" || provider === "qwen") {
    let baseURL: string;
    if (provider === "deepseek") {
      baseURL = "https://api.deepseek.com/v1";
    } else if (provider === "qwen") {
      baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    } else {
      baseURL = "https://api.openai.com/v1";
    }

    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API 错误 (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }

  // Anthropic (Claude)
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
        max_tokens: 4096,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API 错误 (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.content[0].text;
  }

  throw new Error(`不支持的 AI 提供商: ${provider}`);
}

// 解析 AI 返回的 JSON
function parseAIJson(text: string): unknown {
  // 尝试直接解析
  try {
    return JSON.parse(text);
  } catch {
    // 尝试提取 ```json ... ``` 块
    const jsonBlock = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonBlock) {
      return JSON.parse(jsonBlock[1]);
    }
    throw new Error("AI 返回格式异常，无法解析");
  }
}

// ===== 三个检查 Prompt =====

const GRAMMAR_PROMPT = `你是一位专业的英语语法老师。请检查以下英语文本的语法错误。

对每个错误，请标注错误类型：时态(Tense)、介词(Preposition)、搭配(Collocation)、冠词(Article)、拼写(Spelling)、其他(Other)。

请严格按以下 JSON 格式回复，只回复 JSON，不要有其他内容：
{
  "errors": [
    {
      "originalText": "错误的原文片段",
      "correctedText": "修改后的正确文本",
      "errorType": "Tense/Preposition/Collocation/Article/Spelling/Other",
      "explanation": "用中文解释为什么错了",
      "sentenceContext": "包含该错误的完整原文句子"
    }
  ]
}

如果没有发现任何语法错误，返回 { "errors": [] }。`;

const EXPRESSION_PROMPT = `你是一位英语母语编辑。请检查以下英语文本，找出语法正确但表达不够自然、不够地道的句子或短语。

每处优化请提供更地道的说法，并解释原因。注意：不要报告语法错误（那由另一位老师负责），只关注表达的自然度。

请严格按以下 JSON 格式回复，只回复 JSON，不要有其他内容：
{
  "optimizations": [
    {
      "originalText": "原句",
      "improvedText": "更地道的说法",
      "explanation": "用中文解释为什么这样改更自然",
      "sentenceContext": "包含该表达的完整原文句子"
    }
  ]
}

如果没有需要优化的地方，返回 { "optimizations": [] }。`;

const SCORE_PROMPT = `你是一位雅思考试评分官。请对以下英语文本按雅思写作标准进行整体评分。

雅思写作评分标准（0-9分）：
- 9分：专家水平，完全掌握
- 7-8分：良好水平，偶尔有不准确
- 5-6分：中等水平，有错误但不影响理解
- 3-4分：有限水平，错误较多
- 0-2分：基础水平，表达非常有限

请给出分数（可精确到 0.5）、整体评价、以及 3-5 个主要问题。

请严格按以下 JSON 格式回复，只回复 JSON，不要有其他内容：
{
  "ieltsScore": 6.5,
  "summary": "用中文写一段整体评价，约100字",
  "mainIssues": ["问题1", "问题2", "问题3"]
}`;

// ===== 主函数 =====

export async function performCheck(
  userId: string,
  articleContent: string,
  articleTitle?: string | null,
  chineseText?: string | null
): Promise<CheckResult> {
  const config = await getUserAIConfig(userId);
  if (!config) {
    throw new Error("请先在设置页面配置 AI 提供商和 API Key");
  }

  // 构建用户消息
  let userMessage = `请检查以下英语文本：\n\n${articleContent}`;
  if (articleTitle) {
    userMessage = `题目：${articleTitle}\n\n${userMessage}`;
  }
  if (chineseText) {
    userMessage = `中文原文：${chineseText}\n\n${userMessage}\n\n请对照中文原文进行翻译质量评估（注意翻译是否准确）。`;
  }

  // 并行调用三个检查
  const [grammarResult, expressionResult, scoreResult] = await Promise.all([
    callAI(config, GRAMMAR_PROMPT, userMessage),
    callAI(config, EXPRESSION_PROMPT, userMessage),
    callAI(config, SCORE_PROMPT, userMessage),
  ]);

  // 解析结果
  const grammarParsed = parseAIJson(grammarResult) as {
    errors: GrammarError[];
  };
  const expressionParsed = parseAIJson(expressionResult) as {
    optimizations: ExpressionOpt[];
  };
  const scoreParsed = parseAIJson(scoreResult) as OverallScoreResult;

  return {
    grammarErrors: grammarParsed.errors.map((e) => ({
      ...e,
      errorType: mapErrorType(e.errorType),
      sentenceContext: e.sentenceContext || null,
    })),
    expressionOpts: expressionParsed.optimizations.map((o) => ({
      ...o,
      sentenceContext: o.sentenceContext || null,
    })),
    overallScore: scoreParsed,
  };
}

// 将英文错误类型映射为中文标签
function mapErrorType(type: string): string {
  const map: Record<string, string> = {
    Tense: "时态",
    Preposition: "介词",
    Collocation: "搭配",
    Article: "冠词",
    Spelling: "拼写",
    Other: "其他",
  };
  return map[type] || type;
}
