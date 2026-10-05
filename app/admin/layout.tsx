"use client";

import {
  Award,
  ClipboardList,
  ClipboardCheck,
  Download,
  Eye,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/logo.png";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AdminEvaluationActionsProvider,
  useAdminEvaluationActions,
} from "@/components/admin-evaluation-actions";
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
    { href: "/admin/admins", label: t.admin, icon: ShieldCheck },
    { href: "/admin/evaluators", label: t.evaluator, icon: UserCheck },
    { href: "/admin/recipients", label: t.recipients, icon: Users },
    { href: "/admin/topics", label: t.evaluationTopics, icon: ListChecks },
    { href: "/admin/assessment-versions", label: t.assessmentVersions, icon: ClipboardCheck },
    { href: "/admin/evaluations", label: t.evaluationsLog, icon: ClipboardList },
    {
      href: "/admin/evaluation-summaries",
      label: t.evaluationSummaries,
      icon: Award,
    },
    { href: "/admin/system", label: t.system, icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <AdminEvaluationActionsProvider>
      <div className="h-[100dvh] overflow-y-auto text-slate-950 scrollbar-hide">
      <header className="relative sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-[linear-gradient(110deg,#11265d_0%,#071536_42%,#020617_100%)] px-4 py-3 text-white lg:min-h-18 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={
                mobileMenuOpen ? t.closeNavigation : t.openNavigation
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
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
                  {t.title}
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <div className="hidden items-center gap-2 md:flex">
              <div className="text-right">
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
        </div>

        <nav
          aria-label={t.adminNavigation}
          className="hidden border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block"
        >
          <div className="flex items-center gap-2 px-3 sm:px-4 lg:px-6">
            <div className="min-w-0 flex-1 overflow-x-auto">
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
            <NavigationActions pathname={pathname} />
          </div>
        </nav>
        {mobileMenuOpen && (
          <nav
            aria-label={t.adminNavigation}
            className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/20 bg-slate-950/95 p-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] backdrop-blur-xl scrollbar-hide lg:hidden"
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-slate-200 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <NavigationActions pathname={pathname} />
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                {t.signOut}
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </AdminEvaluationActionsProvider>
  );
}

function NavigationActions({ pathname }: { pathname: string }) {
  const { actions, summaryActions } = useAdminEvaluationActions();
  const { t } = useI18n();

  if (pathname === "/admin/evaluations" && actions) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={actions.openImport}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          title={t.importResults}
          aria-label={t.importResults}
        >
          <Upload className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={actions.exportExcel}
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition hover:bg-blue-700"
          title={t.exportExcel}
          aria-label={t.exportExcel}
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (pathname !== "/admin/evaluation-summaries" || !summaryActions)
    return null;

  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={summaryActions.viewSelectedResults}
        disabled={summaryActions.disabled}
        className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        title={t.viewSelectedResults}
        aria-label={t.viewSelectedResults}
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );
}
