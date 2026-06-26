"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FiEdit, FiType, FiClock, FiBookOpen, FiTarget, FiSettings, FiLogOut } from "react-icons/fi";

const NAV_ITEMS = [
  { href: "/write", label: "写作", icon: FiEdit },
  { href: "/translate", label: "翻译", icon: FiType },
  { href: "/history", label: "历史", icon: FiClock },
  { href: "/notes", label: "笔记", icon: FiBookOpen },
  { href: "/practice", label: "练习", icon: FiTarget },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-16 lg:w-56 bg-white border-r border-gray-200 flex-col z-40">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 h-14 px-3 lg:px-5 border-b border-gray-100"
      >
        <span className="text-lg font-bold text-blue-600 shrink-0">EM</span>
        <span className="hidden lg:block text-sm font-semibold text-gray-900 whitespace-nowrap">
          English Mate
        </span>
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 lg:px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 lg:px-3 py-3 border-t border-gray-100 flex flex-col gap-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
            pathname === "/settings"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <FiSettings
            className={`w-5 h-5 shrink-0 ${
              pathname === "/settings" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
          <span className="hidden lg:block">设置</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
        >
          <FiLogOut className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-red-500" />
          <span className="hidden lg:block">退出</span>
        </button>
      </div>
    </aside>
  );
}
