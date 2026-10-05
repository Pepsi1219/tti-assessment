"use client";

import { BarChart3, ClipboardList, FileCheck2, History, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n/context";
import logo from "@/logo.png";

export default function EvaluatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (
      pathname === "/evaluator" &&
      !new URLSearchParams(window.location.search).has("topicId")
    )
      router.replace("/login");
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { href: "/evaluator", label: t.newEvaluation, icon: ClipboardList },
    { href: "/evaluator/exams", label: t.examMode, icon: FileCheck2 },
    { href: "/evaluator/history", label: t.myEvaluations, icon: History },
    {
      href: "/evaluator/evaluation-summaries",
      label: t.evaluationSummaries,
      icon: BarChart3,
    },
  ];

  return (
    <div className="h-[100dvh] overflow-y-auto text-slate-950 scrollbar-hide">
      <header className="relative sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-2xl">
        <div className="flex w-full min-w-0 items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={
                mobileMenuOpen ? t.closeNavigation : t.openNavigation
              }
              className="shrink-0 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link href="/evaluator" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 p-1.5 shadow-lg shadow-slate-950/20">
                <Image
                  src={logo}
                  alt="Nanyang"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[10px] sm:tracking-[0.24em]">
                  Nanyang
                </p>
                <h1 className="line-clamp-2 text-[11px] font-bold leading-tight sm:text-sm">
                  {t.title}
                </h1>
              </div>
            </Link>
          </div>
          <nav aria-label={t.evaluatorNavigation} className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <div className="hidden items-center gap-2 md:flex">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-700">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-slate-400">{t.evaluator}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"
                title={t.signOut}
              >
                <LogOut className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav aria-label={t.evaluatorNavigation} className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/60 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl scrollbar-hide lg:hidden">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${active ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              {t.signOut}
            </button>
          </nav>
        )}
      </header>
      <main className="min-w-0 overflow-x-hidden p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
