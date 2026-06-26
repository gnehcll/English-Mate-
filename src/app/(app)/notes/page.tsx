"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const NOTE_TYPE_LABELS: Record<string, string> = {
  word: "单词",
  phrase: "词组",
  sentence: "句子",
};

interface Note {
  id: string;
  content: string;
  translation: string | null;
  noteType: string;
  sentenceContext: string | null;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTranslation, setEditTranslation] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const res = await fetch("/api/notes");
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除这条笔记？")) return;
    const res = await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setNotes(notes.filter((n) => n.id !== id));
      toast.success("已删除");
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditTranslation(note.translation || "");
  }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch(`/api/notes/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: editContent,
        translation: editTranslation,
      }),
    });
    if (res.ok) {
      setNotes(
        notes.map((n) =>
          n.id === editingId
            ? { ...n, content: editContent, translation: editTranslation }
            : n
        )
      );
      setEditingId(null);
      toast.success("已更新");
    } else {
      toast.error("更新失败");
    }
  }

  const filteredNotes =
    filter === "all" ? notes : notes.filter((n) => n.noteType === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">我的笔记</h1>
            <p className="text-sm text-gray-500">
              记录错误和生疏内容，随时复习
            </p>
          </div>
        </div>

        {/* 筛选 */}
        <div className="flex gap-2 mb-6">
          {["all", "word", "phrase", "sentence"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === t
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t === "all" ? "全部" : NOTE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">加载中...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500 mb-2">还没有笔记</p>
            <p className="text-sm text-gray-400">
              在 AI 检查结果中点击"加入笔记"即可创建
            </p>
            <Link
              href="/write"
              className="inline-block mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              开始写作
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      value={editTranslation}
                      onChange={(e) => setEditTranslation(e.target.value)}
                      placeholder="添加中文释义..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          {note.content}
                        </p>
                        {note.sentenceContext && (
                          <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-2">
                            &ldquo;{note.sentenceContext}&rdquo;
                          </p>
                        )}
                        {note.translation && (
                          <p className="text-sm text-gray-500 mt-1">
                            {note.translation}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {NOTE_TYPE_LABELS[note.noteType] || note.noteType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => startEdit(note)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        删除
                      </button>
                      <span className="text-xs text-gray-300">
                        {new Date(note.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
