# 技术选型与架构

## 技术栈

| 层面 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js | 15.5.19 | App Router 模式 |
| 语言 | TypeScript | ^5 | 严格模式 |
| 运行时 | Node.js | 24.x | |
| 数据库 | PostgreSQL (Supabase) | - | 免费 500MB |
| ORM | Prisma | ^6.3.0 | 类型安全 |
| 认证 | NextAuth.js | 5.0.0-beta.31 | 邮箱密码登录 |
| 样式 | Tailwind CSS | ^4 | 原子化 CSS |
| AI SDK | Vercel AI SDK | ^4.2.0 | 多提供商统一接口 |
| AI 提供商 | @ai-sdk/openai | ^1.2.0 | OpenAI 支持 |
| AI 提供商 | @ai-sdk/anthropic | ^1.2.0 | Claude 支持 |
| 图标 | react-icons | ^5.4.0 | 免费图标库 |
| 通知 | react-hot-toast | ^2.5.2 | Toast 提示 |
| 部署 | Vercel | - | 免费套餐 |

## 项目结构

```
src/
├── app/                      # Next.js App Router 页面
│   ├── layout.tsx            # 根布局（导航栏 + 页脚）
│   ├── page.tsx              # 首页
│   ├── auth/
│   │   ├── login/page.tsx    # 登录页
│   │   └── register/page.tsx # 注册页
│   ├── settings/page.tsx     # API Key 设置页
│   ├── write/page.tsx        # 写作与翻译页
│   ├── check/
│   │   └── [id]/page.tsx     # AI 检查结果页
│   ├── notes/page.tsx        # 笔记列表页
│   ├── practice/page.tsx     # 练习页
│   └── api/                  # API 路由
│       ├── auth/             # NextAuth API
│       ├── articles/         # 文章 CRUD
│       ├── check/            # AI 检查
│       ├── notes/            # 笔记 CRUD
│       └── practice/         # 练习生成
├── components/               # 可复用组件
│   ├── ui/                   # 基础 UI 组件
│   ├── layout/               # 布局组件（导航栏等）
│   ├── write/                # 写作页组件
│   ├── check/                # 检查结果组件
│   └── notes/                # 笔记组件
├── lib/                      # 工具函数
│   ├── auth.ts               # NextAuth 配置
│   ├── db.ts                 # Prisma 客户端
│   ├── ai.ts                 # AI 调用封装
│   └── encryption.ts         # API Key 加密解密
└── types/                    # TypeScript 类型定义
```

## 数据流

```
用户输入文章 → 保存到 PostgreSQL
         ↓
   点击"AI 检查"
         ↓
   后端读取用户 AI 设置（API Key + 模型）
         ↓
   调用对应 AI API（OpenAI / Claude / DeepSeek 等）
         ↓
   解析 AI 返回的结构化结果
         ↓
   存储检查结果到 PostgreSQL
         ↓
   返回结果给前端展示
         ↓
   用户选择错误 → 生成笔记
         ↓
   笔记汇总 → AI 生成练习文章
```

## 安全设计

- API Key 使用 AES-256 加密存储
- 用户密码使用 bcrypt 哈希
- NextAuth 会话使用 JWT
- 所有 API 路由验证用户身份
- 用户只能访问自己的数据
