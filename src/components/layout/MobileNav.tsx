"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiEdit, FiType, FiClock, FiBookOpen, FiTarget } from "react-icons/fi";

const NAV_ITEMS = [
  { href: "/write", label: "写作", icon: FiEdit },
  { href: "/translate", label: "翻译", icon: FiType },
  { href: "/history", label: "历史", icon: FiClock },
  { href: "/notes", label: "笔记", icon: FiBookOpen },
  { href: "/practice", label: "练习", icon: FiTarget },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 rounded-lg transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
