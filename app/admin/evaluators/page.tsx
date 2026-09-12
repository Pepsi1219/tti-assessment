"use client";

import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import type { User } from "@/lib/types";

type EvaluatorForm = {
  employeeId: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
};

const emptyForm: EvaluatorForm = { employeeId: "", name: "", email: "", status: "Active" };

export default function EvaluatorManagementPage() {
  const { t } = useI18n();
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<EvaluatorForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/evaluators?includeInactive=1");
    if (response.ok) setEvaluators(await response.json());
    else setError(t.error);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = evaluators.filter((evaluator) =>
    [evaluator.employeeId, evaluator.name, evaluator.email, evaluator.status ?? "Active"]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(evaluator: User) {
    setEditing(evaluator);
    setForm({
      employeeId: evaluator.employeeId,
      name: evaluator.name,
      email: evaluator.email,
      status: evaluator.status ?? "Active"
    });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/evaluators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing?.id })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? t.error);
        return;
      }
      setDialogOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(evaluator: User) {
    if (!window.confirm(`${t.confirmDelete} ${evaluator.name}`)) return;

    setError("");
    const response = await fetch(`/api/evaluators?id=${encodeURIComponent(evaluator.id)}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? t.error);
      return;
    }
    await load();
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{t.evaluatorManagement}</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />{t.addEvaluator}</Button>
      </div>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{error}</p>}

      <Card className="p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>{t.employeeId}</TableHead><TableHead>{t.evaluator}</TableHead><TableHead>{t.email}</TableHead><TableHead>{t.status}</TableHead><TableHead className="text-right">{t.actions}</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((evaluator) => {
              const active = evaluator.status !== "Inactive";
              return (
                <TableRow key={evaluator.id}>
                  <TableCell className="font-bold">{evaluator.employeeId}</TableCell>
                  <TableCell>{evaluator.name}</TableCell>
                  <TableCell>{evaluator.email}</TableCell>
                  <TableCell><Badge tone={active ? "success" : "danger"}>{active ? t.active : t.inactive}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(evaluator)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-blue-50" title={t.edit}><Edit2 className="h-4 w-4 text-primary" /></button>
                      <button onClick={() => remove(evaluator)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-red-50" title={t.delete}><Trash2 className="h-4 w-4 text-danger" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtered.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-400">{t.noData}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? t.edit : t.addEvaluator}>
        <div className="space-y-4">
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.employeeId}</span><Input value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} /></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.evaluator}</span><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.email}</span><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.status}</span><select className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EvaluatorForm["status"] })}><option value="Active">{t.active}</option><option value="Inactive">{t.inactive}</option></select></label>
          <div className="flex justify-end gap-3 pt-2"><Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>{t.cancel}</Button><Button onClick={save} disabled={saving || !form.employeeId || !form.name || !form.email}>{saving ? t.submitting : t.save}</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
