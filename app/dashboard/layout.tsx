"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Utensils,
  Carrot,
  Bot,
  Database,
  Settings as SettingsIcon,
  Wrench,
  LogOut,
} from "lucide-react";
import { CookestIcon } from "@/components/CookestIcon";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Recipes", href: "/dashboard/recipes", icon: Utensils },
  { name: "Ingredients", href: "/dashboard/ingredients", icon: Carrot },
  { name: "AI", href: "/dashboard/ai", icon: Bot },
  { name: "Database", href: "/dashboard/database", icon: Database },
  { name: "System", href: "/dashboard/system", icon: Wrench },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
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
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-text flex flex-col shrink-0 border-r border-sidebar shadow-sm">
        <div className="p-6 border-b border-sidebar-hover">
          <Link href="/dashboard" className="flex items-center gap-2 text-sidebar-text-active">
            <CookestIcon className="w-8 h-8 text-white" />
            <span className="text-xl font-heading font-bold">Cookest</span>
          </Link>
          <p className="text-xs text-on-surface-muted mt-1 font-medium tracking-wide uppercase">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                    : "text-on-surface-dim hover:bg-surface-dim hover:text-on-surface"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-on-surface-muted group-hover:text-primary transition-colors"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-on-surface-dim hover:bg-danger/10 hover:text-danger transition-colors group"
          >
            <LogOut className="w-5 h-5 text-on-surface-muted group-hover:text-danger transition-colors" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
