"use client";

import { AlertCircle, LogIn, ShieldCheck } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSelector } from "@/components/language-selector";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      const role = session.user?.role;
      router.replace(role === "Admin" ? "/admin" : "/evaluator");
    }
  }, [session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId.trim()) return;

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      employeeId: employeeId.trim(),
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError(t.loginError ?? "Employee ID not found");
    } else {
      router.replace("/");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-slate-950 text-white shadow-2xl shadow-slate-900/30">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-primary">Nanyang</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{t.loginSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-700">{t.employeeId}</span>
            <Input
              className="rounded-2xl text-center text-lg font-bold tracking-wider"
              placeholder="e.g. NY001"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full gap-2 py-3"
            disabled={!employeeId.trim() || loading}
          >
            <LogIn className="h-4 w-4" />
            {loading ? t.loading : t.login}
          </Button>
        </form>

        <div className="flex justify-center">
          <LanguageSelector />
        </div>
      </div>
    </main>
  );
}
