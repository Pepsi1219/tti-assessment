"use client";

import { ClipboardList, History, LogOut, Menu, X } from "lucide-react";
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
    if (!session) router.replace("/login");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { href: "/evaluator", label: t.newEvaluation, icon: ClipboardList },
    { href: "/evaluator/history", label: t.myEvaluations, icon: History },
  ];

  return (
    <div className="min-h-screen text-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link href="/evaluator" className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 p-1.5 shadow-lg shadow-slate-950/20">
                <Image
                  src={logo}
                  alt="Nanyang"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Nanyang
                </p>
                <h1 className="text-sm font-bold leading-tight">{t.title}</h1>
              </div>
            </Link>
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
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
          <nav className="border-t border-white/60 bg-white/90 p-3 backdrop-blur-xl lg:hidden">
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
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
