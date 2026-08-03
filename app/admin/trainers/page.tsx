"use client";

import { Edit2, Plus, Search, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import type { Trainer } from "@/lib/types";

type FormData = { employeeId: string; trainerName: string; bu: string; status: string };
const emptyForm: FormData = { employeeId: "", trainerName: "", bu: "", status: "Active" };

export default function TrainerManagementPage() {
  const { t } = useI18n();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/trainers");
    setTrainers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = trainers.filter((t) => {
    if (!query) return true;
    const text = query.toLowerCase();
    return [t.employeeId, t.trainerName, t.bu, t.status].join(" ").toLowerCase().includes(text);
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(trainer: Trainer) {
    setEditingId(trainer.id);
    setForm({ employeeId: trainer.employeeId, trainerName: trainer.trainerName, bu: trainer.bu, status: trainer.status });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId })
      });
      setDialogOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(trainer: Trainer) {
    if (!confirm(t.confirmDelete)) return;
    await fetch("/api/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...trainer, status: "Inactive" })
    });
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{t.trainerManagement}</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.addTrainer}
        </Button>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.employeeId}</TableHead>
              <TableHead>{t.trainerName}</TableHead>
              <TableHead>{t.bu}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((trainer) => (
              <TableRow key={trainer.id}>
                <TableCell className="font-bold">{trainer.employeeId}</TableCell>
                <TableCell>{trainer.trainerName}</TableCell>
                <TableCell>{trainer.bu}</TableCell>
                <TableCell>
                  <Badge tone={trainer.status === "Active" ? "success" : "danger"}>
                    {trainer.status === "Active" ? t.active : t.inactive}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(trainer)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-blue-50" title={t.edit}>
                      <Edit2 className="h-4 w-4 text-primary" />
                    </button>
                    {trainer.status === "Active" && (
                      <button onClick={() => deactivate(trainer)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-red-50" title={t.delete}>
                        <UserX className="h-4 w-4 text-danger" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-400">{t.noData}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? t.edit : t.addTrainer}>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.employeeId}</span>
            <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.trainerName}</span>
            <Input value={form.trainerName} onChange={(e) => setForm({ ...form, trainerName: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.bu}</span>
            <Input value={form.bu} onChange={(e) => setForm({ ...form, bu: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.status}</span>
            <select className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Active">{t.active}</option>
              <option value="Inactive">{t.inactive}</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={save} disabled={saving || !form.employeeId || !form.trainerName}>
              {saving ? t.submitting : t.save}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
