# CLAUDE.md — AI 工作指引

## 项目概述

这是一个基于 AI 的英语学习网站，帮助用户通过写作和翻译练习提升英语水平。项目使用 Next.js 15 + TypeScript + PostgreSQL 构建。

## 标准文档路径

每次开发前，请先阅读以下标准文件：

| 文件 | 路径 | 用途 |
|------|------|------|
| 产品需求 | [docs/requirements.md](docs/requirements.md) | 完整功能需求描述 |
| 技术选型 | [docs/tech-stack.md](docs/tech-stack.md) | 技术栈、项目结构、数据流 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 颜色、字体、间距、组件风格 |
| 实施步骤 | [docs/implementation.md](docs/implementation.md) | 分阶段执行计划，含验证方式 |

## 开发日志

每日开发结束后，在 [dev-logs/](dev-logs/) 中创建 `YYYY-MM-DD.md` 文件，记录：
- **今日完成**：完成了哪些任务
- **待办事项**：下一步要做的事
- **遇到的问题**：阻塞或疑问

## 开发原则

1. **小步推进**：每天只做 1-2 个模块，确保每一步都稳定可用
2. **先跑通再优化**：每阶段先实现核心流程，再打磨 UI 细节
3. **及时验证**：每完成一个阶段，运行 `npm run dev` 验证功能
4. **不跳步**：严格按照 [docs/implementation.md](docs/implementation.md) 的顺序执行
5. **保持简洁**：代码风格和 UI 都遵循 [docs/design-spec.md](docs/design-spec.md) 的简洁原则
6. **安全第一**：API Key 加密存储，密码哈希，用户数据隔离

## 常用命令

```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
npx prisma db push   # 同步数据库 Schema
npx prisma generate  # 生成 Prisma Client
npx prisma studio    # 打开 Prisma 数据库管理界面
```

## 关键配置

- Node.js 环境：v24.18.0
- 包管理器：npm
- Next.js 端口：3000
- 数据库：Supabase PostgreSQL（环境变量 DATABASE_URL）
