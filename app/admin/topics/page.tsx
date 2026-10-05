"use client";

import { Edit2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StandardSelect } from "@/components/ui/standard-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import type { AssessmentVersion, EvaluationTopic } from "@/lib/types";

type TopicForm = { topicName: string; description: string; status: "Active" | "Inactive"; activeAssessmentVersionId: string };
const emptyForm: TopicForm = { topicName: "", description: "", status: "Active", activeAssessmentVersionId: "" };

function getAssessmentVersionLabels(version: AssessmentVersion) {
  const revisionMatch = version.name.match(/^(.*?)\s+(rev\.\d+)$/i);
  return {
    name: revisionMatch?.[1] ?? version.name,
    revision: revisionMatch?.[2] ?? `v${version.version}`,
  };
}

export default function TopicManagementPage() {
  const { t } = useI18n();
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [versions, setVersions] = useState<AssessmentVersion[]>([]);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EvaluationTopic | null>(null);
  const [form, setForm] = useState<TopicForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [response, versionResponse] = await Promise.all([
      fetch("/api/topics"),
      fetch("/api/assessment-versions"),
    ]);
    if (response.ok) setTopics(await response.json());
    if (versionResponse.ok) setVersions(await versionResponse.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  const filtered = topics.filter((topic) => [topic.topicName, topic.description, topic.status].join(" ").toLowerCase().includes(query.toLowerCase()));

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(topic: EvaluationTopic) { setEditing(topic); setForm({ topicName: topic.topicName, description: topic.description, status: topic.status, activeAssessmentVersionId: topic.activeAssessmentVersionId ?? "" }); setDialogOpen(true); }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, activeAssessmentVersionId: form.activeAssessmentVersionId || null, id: editing?.id }) });
      if (response.ok) { setDialogOpen(false); await load(); }
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p><h1 className="mt-1 text-2xl font-black tracking-tight">{t.topicManagement}</h1></div><Button onClick={openCreate}><Plus className="h-4 w-4" />{t.addTopic}</Button></div>
      <div className="relative max-w-sm"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <Table className="min-w-[960px] table-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-52 text-left">{t.topicName}</TableHead>
            <TableHead className="min-w-72 text-left">{t.topicDescription}</TableHead>
            <TableHead className="min-w-48 text-left">{t.assessmentName}</TableHead>
            <TableHead className="w-32 text-left">{t.versionLabel}</TableHead>
            <TableHead className="w-32 whitespace-nowrap">{t.status}</TableHead>
            <TableHead className="w-24 whitespace-nowrap">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell className="text-left font-bold">{topic.topicName}</TableCell>
              <TableCell className="text-left">{topic.description || "—"}</TableCell>
              <TableCell className="text-left">
                {(() => {
                  const version = versions.find((item) => item.id === topic.activeAssessmentVersionId);
                  return version ? getAssessmentVersionLabels(version).name : t.legacyAssessment;
                })()}
              </TableCell>
              <TableCell className="text-left tabular-nums">
                {(() => {
                  const version = versions.find((item) => item.id === topic.activeAssessmentVersionId);
                  return version ? getAssessmentVersionLabels(version).revision : "—";
                })()}
              </TableCell>
              <TableCell>
                <Badge tone={topic.status === "Active" ? "success" : "neutral"}>
                  {topic.status === "Active" ? t.active : t.inactive}
                </Badge>
              </TableCell>
              <TableCell>
                <button onClick={() => openEdit(topic)} aria-label={`${t.edit} ${topic.topicName}`} className="mx-auto grid h-8 w-8 place-items-center rounded-full hover:bg-blue-50">
                  <Edit2 className="h-4 w-4 text-primary" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {!filtered.length && <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">{t.noData}</TableCell></TableRow>}
        </TableBody>
      </Table>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? t.edit : t.addTopic}>
        <div className="space-y-4"><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.topicName}</span><Input value={form.topicName} onChange={(event) => setForm({ ...form, topicName: event.target.value })} /></label><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.topicDescription}</span><textarea className="min-h-28 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-primary" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.assessmentVersion}</span><StandardSelect value={form.activeAssessmentVersionId || "legacy"} onValueChange={(value) => setForm({ ...form, activeAssessmentVersionId: value === "legacy" ? "" : value })} ariaLabel={t.assessmentVersion} options={[{ value: "legacy", label: t.legacyAssessment }, ...versions.filter((version) => version.status === "Published").map((version) => ({ value: version.id, label: `${version.name} · v${version.version}` }))]} /></label><label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.status}</span><StandardSelect value={form.status} onValueChange={(value) => setForm({ ...form, status: value as TopicForm["status"] })} ariaLabel={t.status} options={[{ value: "Active", label: t.active }, { value: "Inactive", label: t.inactive }]} /></label><div className="flex justify-end gap-3 pt-2"><Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>{t.cancel}</Button><Button onClick={save} disabled={saving || !form.topicName}>{saving ? t.submitting : t.save}</Button></div></div>
      </Dialog>
    </div>
  );
}
