"use client";

import { LockKeyhole, UnlockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/context";

export default function SystemSettingsPage() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  useEffect(() => {
    fetch("/api/evaluation-availability")
      .then((response) => response.json())
      .then((data) => setIsOpen(data.isOpen === true))
      .catch(() => setError(t.error));
  }, [t.error]);

  async function setAvailability(next: boolean) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/evaluation-availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: next }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? t.error);
        return;
      }
      setIsOpen(data.isOpen === true);
      if (!next) setCloseConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
          {t.admin}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">{t.system}</h1>
      </div>

      <Card className="max-w-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {isOpen ? <UnlockKeyhole className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black">{t.evaluationAccess}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {isOpen ? t.evaluationOpenDescription : t.evaluationClosedDescription}
                </p>
              </div>
            </div>
            {isOpen !== null && (
              <Badge tone={isOpen ? "success" : "warning"}>
                {isOpen ? t.evaluationsOpen : t.evaluationsClosed}
              </Badge>
            )}
          </div>
          {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setAvailability(true)} disabled={saving || isOpen === true}>
              <UnlockKeyhole className="h-4 w-4" />
              {t.openEvaluations}
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setCloseConfirmOpen(true)} disabled={saving || isOpen === false}>
              <LockKeyhole className="h-4 w-4" />
              {t.closeEvaluations}
            </Button>
          </div>
      </Card>

      <Dialog
        open={closeConfirmOpen}
        onClose={() => !saving && setCloseConfirmOpen(false)}
        title={t.closeEvaluations}
      >
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {t.closeEvaluationConfirm}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300"
            onClick={() => setCloseConfirmOpen(false)}
            disabled={saving}
          >
            {t.cancel}
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setAvailability(false)}
            disabled={saving}
          >
            {saving ? t.submitting : t.closeEvaluations}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
