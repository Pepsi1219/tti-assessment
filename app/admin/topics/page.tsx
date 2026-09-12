"use client";

import { Edit2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import type { EvaluationTopic } from "@/lib/types";

type TopicForm = { topicName: string; description: string; status: "Active" | "Inactive" };
const emptyForm: TopicForm = { topicName: "", description: "", status: "Active" };

export default function TopicManagementPage() {
  const { t } = useI18n();
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EvaluationTopic | null>(null);
  const [form, setForm] = useState<TopicForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/topics");
    if (response.ok) setTopics(await response.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  const filtered = topics.filter((topic) => [topic.topicName, topic.description, topic.status].join(" ").toLowerCase().includes(query.toLowerCase()));

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(topic: EvaluationTopic) { setEditing(topic); setForm({ topicName: topic.topicName, description: topic.description, status: topic.status }); setDialogOpen(true); }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editing?.id }) });
      if (response.ok) { setDialogOpen(false); await load(); }
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p><h1 className="mt-1 text-2xl font-black tracking-tight">{t.topicManagement}</h1></div><Button onClick={openCreate}><Plus className="h-4 w-4" />{t.addTopic}</Button></div>
      <div className="relative max-w-sm"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="space-y-3">
        {filtered.map((topic) => <Card key={topic.id} className="flex items-start justify-between gap-4 p-5"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black">{topic.topicName}</h2><Badge tone={topic.status === "Active" ? "success" : "neutral"}>{topic.status === "Active" ? t.active : t.inactive}</Badge></div>{topic.description && <p className="mt-2 text-sm leading-6 text-slate-500">{topic.description}</p>}</div><button onClick={() => openEdit(topic)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-blue-50"><Edit2 className="h-4 w-4 text-primary" /></button></Card>)}
        {!filtered.length && <Card className="p-10 text-center text-sm text-slate-400">{t.noData}</Card>}
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? t.edit : t.addTopic}>
        <div className="space-y-4"><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.topicName}</span><Input value={form.topicName} onChange={(event) => setForm({ ...form, topicName: event.target.value })} /></label><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.topicDescription}</span><textarea className="min-h-28 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-primary" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.status}</span><select className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TopicForm["status"] })}><option value="Active">{t.active}</option><option value="Inactive">{t.inactive}</option></select></label><div className="flex justify-end gap-3 pt-2"><Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>{t.cancel}</Button><Button onClick={save} disabled={saving || !form.topicName}>{saving ? t.submitting : t.save}</Button></div></div>
      </Dialog>
    </div>
  );
}
