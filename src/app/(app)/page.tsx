import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col">
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            AI 驱动的英语学习助手
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            写作、翻译、AI 语法检查、雅思评分、智能笔记，全方位提升你的英语能力
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/write"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              开始写作
            </Link>
            <Link
              href="/notes"
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              查看笔记
            </Link>
          </div>

          {/* 功能介绍卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="text-2xl mb-3">✍️</div>
              <h3 className="font-semibold text-gray-900 mb-2">写作与翻译</h3>
              <p className="text-sm text-gray-500">
                自由写作或中译英练习，支持题目设定，让练习更有针对性。
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">AI 智能检查</h3>
              <p className="text-sm text-gray-500">
                语法纠错、表达优化、雅思标准评分，三层检查全面覆盖。
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="text-2xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-900 mb-2">自动笔记</h3>
              <p className="text-sm text-gray-500">
                错误和生疏内容自动生成笔记，分类整理，随时复习。
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">针对性练习</h3>
              <p className="text-sm text-gray-500">
                基于笔记薄弱点，AI 生成个性化中文文章，精准练习翻译。
              </p>
            </div>
          </div>
        </section>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        English Mate — AI 驱动的英语学习助手
      </footer>
    </div>
  );
}
