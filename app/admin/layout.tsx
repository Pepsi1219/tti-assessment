"use client";

import {
  Award,
  BarChart3,
  ClipboardList,
  FileQuestion,
  LayoutDashboard,
  ListChecks,
  LogOut,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import logo from "@/logo.png";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  async function handleSignOut() {
    await signOut({ redirect: false });
    // Resolve the destination in the browser so a LAN/IP host is preserved.
    window.location.replace("/login");
  }

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "Admin") router.replace("/evaluator");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: t.dashboard, icon: LayoutDashboard },
    { href: "/admin/evaluators", label: t.evaluator, icon: UserCheck },
    { href: "/admin/recipients", label: t.recipients, icon: Users },
    { href: "/admin/topics", label: t.evaluationTopics, icon: ListChecks },
    { href: "/admin/questions", label: t.questions, icon: FileQuestion },
    { href: "/admin/evaluations", label: t.evaluations, icon: ClipboardList },
    {
      href: "/admin/evaluation-summaries",
      label: t.evaluationSummaries,
      icon: Award,
    },
    { href: "/admin/analytics", label: t.analytics, icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-[linear-gradient(110deg,#11265d_0%,#071536_42%,#020617_100%)] px-4 py-3 text-white lg:min-h-18 lg:px-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <Image
              src={logo}
              alt="Nanyang"
              className="h-10 w-10 shrink-0 object-contain"
              priority
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Nanyang
              </p>
              <h1 className="truncate text-sm font-bold leading-tight text-white sm:text-base">
                {t.admin}
              </h1>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold text-white">
                {session?.user?.name}
              </p>
              <p className="text-[10px] text-slate-300">{t.admin}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="grid h-9 w-9 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
              title={t.signOut}
              aria-label={t.signOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav
          aria-label="Admin navigation"
          className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="overflow-x-auto px-3 sm:px-4 lg:px-6">
            <div className="flex min-w-max items-center gap-1 py-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="min-w-0 p-4 lg:p-6">{children}</main>
    </div>
  );
}
