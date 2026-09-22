"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { getSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import logo from "@/logo.png";
import { useI18n } from "@/lib/i18n/context";

export default function EvaluationClosedPage() {
  const { t } = useI18n();
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function signInAsAdmin(event: React.FormEvent) {
    event.preventDefault();
    if (!employeeId.trim() || signingIn) return;

    setSigningIn(true);
    setError("");
    try {
      // A closed evaluation can be reached while an evaluator session is
      // still active. Clear that session before creating the Admin session.
      await signOut({ redirect: false });
      const result = await signIn("credentials", {
        employeeId: employeeId.trim(),
        redirect: false,
      });
      if (!result || result.error) {
        setError(t.loginError);
        return;
      }
      const session = await getSession();
      if (session?.user?.role !== "Admin") {
        await signOut({ redirect: false });
        setError(t.loginError);
        return;
      }
      window.location.replace("/admin");
    } catch {
      setError(t.loginTemporaryError);
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#06112e] p-5 text-white sm:p-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.38),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(14,165,233,0.22),transparent_30%),linear-gradient(140deg,#08183f_0%,#06112e_48%,#020617_100%)]" />
      <div className="absolute -left-32 top-16 -z-10 h-72 w-72 rounded-full border border-white/10" />
      <div className="absolute -bottom-44 -right-28 -z-10 h-[32rem] w-[32rem] rounded-full border border-white/10" />

      <section className="w-full max-w-xl overflow-hidden rounded-[36px] border border-white/15 bg-white/[0.08] shadow-[0_34px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-7 py-6 sm:px-10">
          <Image src={logo} alt="Nanyang" className="h-12 w-12 object-contain" priority />
        </div>
        <div className="px-7 py-10 sm:px-10 sm:py-12">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-300 text-[#422006] shadow-[0_16px_40px_rgba(251,191,36,0.28)]">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-blue-200">
            Nanyang · Train The Trainer
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {t.evaluationClosedTitle}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
            {t.evaluationClosedDescription}
          </p>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold text-slate-400">{t.adminAccessDescription}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setAdminDialogOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t.adminLogin}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <Dialog
        open={adminDialogOpen}
        onClose={() => !signingIn && setAdminDialogOpen(false)}
        title={t.adminLogin}
      >
        <form onSubmit={signInAsAdmin} className="space-y-5">
          <p className="text-sm leading-6 text-slate-500">
            {t.adminAccessDescription}
          </p>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-700">{t.employeeId}</span>
            <Input
              autoFocus
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="h-12 rounded-xl"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300"
              onClick={() => setAdminDialogOpen(false)}
              disabled={signingIn}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={signingIn || !employeeId.trim()}>
              {signingIn ? t.loading : t.login}
            </Button>
          </div>
        </form>
      </Dialog>
    </main>
  );
}
