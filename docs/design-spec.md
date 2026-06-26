# 设计规范

## 设计理念

**简洁清爽** — 参考 Notion 风格：大量留白、克制的色彩、清晰的层级。

## 色彩系统

| 用途 | 颜色 | Tailwind Class |
|------|------|----------------|
| 主背景 | 白色 | `bg-white` |
| 次级背景 | 浅灰 | `bg-gray-50` |
| 卡片 | 白色 + 边框 | `bg-white border border-gray-200` |
| 主文字 | 深黑 | `text-gray-900` |
| 次级文字 | 中灰 | `text-gray-500` |
| 辅助文字 | 浅灰 | `text-gray-400` |
| 主按钮 | 蓝色 | `bg-blue-600 hover:bg-blue-700 text-white` |
| 次按钮 | 白底边框 | `bg-white border border-gray-300 hover:bg-gray-50` |
| 危险按钮 | 红色 | `bg-red-500 hover:bg-red-600 text-white` |

### 错误类型标签颜色

| 错误类型 | 颜色 | Tailwind |
|----------|------|----------|
| 时态 | 橙色 | `bg-orange-100 text-orange-700` |
| 介词 | 紫色 | `bg-purple-100 text-purple-700` |
| 搭配 | 蓝色 | `bg-blue-100 text-blue-700` |
| 冠词 | 绿色 | `bg-green-100 text-green-700` |
| 拼写 | 红色 | `bg-red-100 text-red-700` |
| 其他 | 灰色 | `bg-gray-100 text-gray-700` |

## 字体

- **正文**：系统默认字体栈（`font-sans`），保证加载速度
- **代码/英文**：优先使用 `SF Mono`, `Cascadia Code`, `Consolas` 等宽字体
- **字号层级**：
  - 标题：`text-2xl` (24px)
  - 副标题：`text-lg` (18px)
  - 正文：`text-base` (16px)
  - 辅助文字：`text-sm` (14px)
  - 标签：`text-xs` (12px)

## 间距

- 页面最大宽度：`max-w-4xl` (896px)，内容居中
- 卡片间距：`gap-6` (24px)
- 元素内边距：`p-6` (24px) 或 `p-4` (16px)
- 按钮与输入框高度：`h-10` (40px)

## 圆角

- 卡片：`rounded-xl` (12px)
- 按钮：`rounded-lg` (8px)
- 输入框：`rounded-lg` (8px)
- 标签：`rounded-full`（胶囊形）

## 阴影

- 卡片悬停：`shadow-sm hover:shadow-md transition-shadow`
- 不使用大面积阴影，保持轻盈感

## 组件风格

### 导航栏
- 顶部固定，白色背景 + 底部细边框
- 左侧 Logo + 右侧用户菜单
- 高度 56px

### 卡片
- 白色背景，浅灰边框
- 圆角 12px，内边距 24px
- 轻微 hover 阴影

### 输入框
- 白色背景，浅灰边框
- focus 时蓝色边框
- placeholder 使用灰色文字

### 按钮
- 主按钮：蓝色填充
- 次按钮：白色 + 边框
- 圆角 8px，高度 40px
- Hover 时颜色加深

### 标签
- 小圆角胶囊形
- 浅色背景 + 深色文字
- 字号 12px

### 折叠面板（检查结果）
- 每层可展开/折叠
- 标题栏点击切换
- 展开时显示内容区
- 使用不同左侧色条区分三层（红/黄/蓝）

## 响应式设计

- 桌面端（>768px）：内容居中，最大宽度 896px
- 平板端（640-768px）：内容宽度 90%
- 手机端（<640px）：内容宽度 95%，导航栏简化
