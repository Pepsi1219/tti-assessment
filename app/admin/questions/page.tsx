"use client";

import { Edit2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StandardSelect } from "@/components/ui/standard-select";
import { useI18n } from "@/lib/i18n/context";
import type { Category, Question } from "@/lib/types";

export default function QuestionManagementPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoryId: "", questionText: "", weight: "1", maxScore: "5", isActive: true, options: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/questions");
    const data = await res.json();
    setCategories(data.categories);
    setQuestions(data.questions);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = questions.filter((q) => {
    if (!query) return true;
    const cat = categories.find((c) => c.id === q.categoryId);
    return [q.questionText, cat?.categoryName].join(" ").toLowerCase().includes(query.toLowerCase());
  });

  const grouped = categories.map((cat) => ({
    ...cat,
    questions: filtered.filter((q) => q.categoryId === cat.id)
  })).filter((g) => g.questions.length > 0);

  function openCreate() {
    setEditingId(null);
    setForm({ categoryId: categories[0]?.id ?? "", questionText: "", weight: "1", maxScore: "5", isActive: true, options: "" });
    setDialogOpen(true);
  }

  function openEdit(question: Question) {
    setEditingId(question.id);
    setForm({
      categoryId: question.categoryId,
      questionText: question.questionText,
      weight: String(question.weight),
      maxScore: String(question.maxScore),
      isActive: question.isActive,
      options: question.options.join("\n")
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          categoryId: form.categoryId,
          questionText: form.questionText,
          weight: Number(form.weight),
          maxScore: Number(form.maxScore),
          isActive: form.isActive,
          options: form.options.split("\n").filter(Boolean)
        })
      });
      setDialogOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
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
          <h1 className="mt-1 text-2xl font-black tracking-tight">{t.questionManagement}</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.addQuestion}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="space-y-5">
        {grouped.map((group) => (
          <Card key={group.id} className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-black">{group.categoryName}</h3>
              {group.isCritical && <Badge tone="warning">{t.critical}</Badge>}
              <span className="text-xs font-bold text-slate-400">({group.questions.length})</span>
            </div>
            <div className="space-y-2">
              {group.questions.map((question) => (
                <div key={question.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white/75 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{question.questionText}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{t.weight}: {question.weight}</span>
                      <span>·</span>
                      <span>{t.maxScore}: {question.maxScore}</span>
                      <span>·</span>
                      <Badge tone={question.isActive ? "success" : "neutral"}>
                        {question.isActive ? t.active : t.inactive}
                      </Badge>
                    </div>
                    {question.options.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-primary">
                          {question.options.length} {t.options}
                        </summary>
                        <ol className="mt-1.5 space-y-1 pl-4">
                          {question.options.map((opt, i) => (
                            <li key={i} className="text-xs text-slate-500">{i + 1}. {opt}</li>
                          ))}
                        </ol>
                      </details>
                    )}
                  </div>
                  <button onClick={() => openEdit(question)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-blue-50">
                    <Edit2 className="h-4 w-4 text-primary" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
        {grouped.length === 0 && (
          <Card className="p-10 text-center">
            <p className="text-sm text-slate-400">{t.noData}</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? t.edit : t.addQuestion} className="max-w-xl">
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.category}</span>
            <StandardSelect
              value={form.categoryId}
              onValueChange={(value) => setForm({ ...form, categoryId: value })}
              ariaLabel={t.category}
              placeholder={t.category}
              options={categories.map((category) => ({
                value: category.id,
                label: category.categoryName,
              }))}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.question}</span>
            <textarea className="min-h-20 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-primary" value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-bold text-slate-700">{t.weight}</span>
              <Input type="number" min="1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-bold text-slate-700">{t.maxScore}</span>
              <Input type="number" min="1" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.optionsHint}</span>
            <textarea className="min-h-32 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-primary" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder={t.optionsPlaceholder} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded" />
            <span className="text-sm font-semibold">{t.active}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={save} disabled={saving || !form.questionText}>
              {saving ? t.submitting : t.save}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
