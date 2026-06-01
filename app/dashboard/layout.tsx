"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Users", href: "/dashboard/users", icon: "👥" },
  { name: "Recipes", href: "/dashboard/recipes", icon: "🍽️" },
  { name: "Ingredients", href: "/dashboard/ingredients", icon: "🥕" },
  { name: "AI", href: "/dashboard/ai", icon: "🤖" },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: "💳" },
  { name: "Promotions", href: "/dashboard/promotions", icon: "🏷️" },
  { name: "Database", href: "/dashboard/database", icon: "🗄️" },
  { name: "System", href: "/dashboard/system", icon: "⚙️" },
  { name: "Settings", href: "/dashboard/settings", icon: "🔧" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-text flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="text-lg font-heading font-bold text-white">Cookest</span>
          </Link>
          <p className="text-xs text-sidebar-text/60 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-active/20 text-sidebar-text-active font-medium"
                    : "hover:bg-sidebar-hover text-sidebar-text"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-text hover:bg-sidebar-hover transition-colors"
          >
            <span className="text-base">🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
