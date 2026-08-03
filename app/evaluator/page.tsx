"use client";

import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Search,
  Sparkles
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Category, EvaluationResult, Question, Trainer } from "@/lib/types";

const scoreLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function EvaluatorPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [latest, setLatest] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/trainers"), fetch("/api/questions")]).then(
      async ([trainerRes, questionRes]) => {
        setTrainers(await trainerRes.json());
        const data = await questionRes.json();
        setCategories(data.categories);
        setQuestions(data.questions);
      }
    );
  }, []);

  const activeQuestions = questions.filter((q) => q.isActive);
  const answeredCount = Object.values(scores).filter(Boolean).length;
  const progress = activeQuestions.length ? Math.round((answeredCount / activeQuestions.length) * 100) : 0;
  const selectedTrainer = trainers.find((t) => t.id === selectedTrainerId);

  const filteredTrainers = useMemo(() => {
    const text = query.toLowerCase();
    return trainers
      .filter((t) => t.status === "Active")
      .filter((t) => [t.employeeId, t.trainerName, t.bu].join(" ").toLowerCase().includes(text));
  }, [query, trainers]);

  const categoryCompletion = useMemo(() => {
    return categories.map((cat) => {
      const catQuestions = activeQuestions.filter((q) => q.categoryId === cat.id);
      const done = catQuestions.filter((q) => scores[q.id]).length;
      return { ...cat, total: catQuestions.length, done };
    });
  }, [activeQuestions, categories, scores]);

  async function submit() {
    if (!selectedTrainer || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: selectedTrainer.id,
          evaluatorName: session?.user?.name ?? "Unknown",
          evaluatorEmail: session?.user?.employeeId ?? session?.user?.email ?? "unknown",
          bu: selectedTrainer.bu,
          comment,
          scores
        })
      });
      const result = await response.json();
      setLatest(result);
      setScores({});
      setComment("");
      setSelectedTrainerId("");
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:gap-6">
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-4">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold">{t.evaluationMap}</p>
              <Badge tone={progress === 100 ? "success" : "neutral"}>{progress}%</Badge>
            </div>
            <div className="mb-4 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <nav className="space-y-1.5">
              {categoryCompletion.map((cat) => (
                <a key={cat.id} href={`#${cat.id}`} className="group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition hover:bg-white">
                  <span className="line-clamp-1 font-semibold text-slate-700">{cat.categoryName}</span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-primary">{cat.done}/{cat.total}</span>
                </a>
              ))}
            </nav>
          </Card>
        </div>
      </aside>

      <section className="space-y-6">
        <Card className="relative overflow-hidden p-5 md:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {t.newEvaluation}
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{t.title}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-2xl shadow-slate-950/20">
              <Clock3 className="h-4 w-4 text-blue-300" />
              {answeredCount}/{activeQuestions.length}
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6 p-5 md:p-7">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">{t.searchTrainer}</span>
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input className="rounded-2xl border-white/80 bg-white/90 pl-11 shadow-inner" placeholder={`${t.employeeId}, ${t.trainerName}, ${t.bu}`} value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">{t.selectTrainer}</span>
                  <select
                    className="touch-target w-full rounded-2xl border border-white/80 bg-white/90 px-4 text-sm font-semibold shadow-inner outline-none focus:ring-2 focus:ring-primary"
                    value={selectedTrainerId}
                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                  >
                    <option value="">{t.chooseTrainer}</option>
                    {filteredTrainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>{trainer.employeeId} - {trainer.trainerName} ({trainer.bu})</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-5">
                {categories.map((cat) => {
                  const catQuestions = activeQuestions.filter((q) => q.categoryId === cat.id);
                  const done = catQuestions.filter((q) => scores[q.id]).length;
                  return (
                    <section key={cat.id} id={cat.id} className="scroll-mt-28 rounded-[28px] border border-white/80 bg-white/72 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black tracking-tight">{cat.categoryName}</h3>
                            {cat.isCritical && <Badge tone="warning">{t.critical}</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{done} {t.of} {catQuestions.length} {t.complete.toLowerCase()}</p>
                        </div>
                        <div className="h-2 w-28 rounded-full bg-slate-200">
                          <div className="h-2 rounded-full bg-slate-950 transition-all" style={{ width: `${catQuestions.length ? (done / catQuestions.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {catQuestions.map((question, idx) => (
                          <QuestionRow
                            key={question.id}
                            index={idx + 1}
                            question={question}
                            score={scores[question.id]}
                            onScore={(score) => setScores({ ...scores, [question.id]: score })}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">{t.additionalComment}</span>
                <textarea
                  className="min-h-32 w-full rounded-[24px] border border-white/80 bg-white/85 p-4 text-sm leading-6 shadow-inner outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t.commentPlaceholder}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
            </div>

            <aside className="border-t border-white/70 bg-white/55 p-5 backdrop-blur-xl xl:border-l xl:border-t-0">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/25">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">{t.liveStatus}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-5xl font-black tracking-tight">{progress}%</p>
                      <p className="mt-1 text-sm text-slate-300">{t.progress}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-blue-300" />
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-white/15">
                    <div className="h-2 rounded-full bg-blue-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {selectedTrainer ? (
                  <div className="rounded-[28px] border border-white/80 bg-white/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t.candidate}</p>
                    <h3 className="mt-3 text-xl font-black">{selectedTrainer.trainerName}</h3>
                    <p className="mt-1 text-sm text-slate-500">{selectedTrainer.employeeId} · {selectedTrainer.bu}</p>
                    <Badge tone={selectedTrainer.status === "Active" ? "success" : "danger"}>{selectedTrainer.status}</Badge>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-5 text-sm font-semibold text-slate-500">
                    {t.chooseTrainerToBegin}
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedTrainer || answeredCount < activeQuestions.length || submitting}
                  onClick={submit}
                >
                  {submitting ? t.submitting : t.submit}
                </Button>

                {/* Mobile progress bar */}
                <div className="lg:hidden">
                  <div className="mb-2 text-xs font-bold text-slate-500">{t.evaluationMap}</div>
                  {categoryCompletion.map((cat) => (
                    <a key={cat.id} href={`#${cat.id}`} className="flex items-center justify-between py-1.5 text-xs font-semibold text-slate-600">
                      <span className="line-clamp-1">{cat.categoryName}</span>
                      <span>{cat.done}/{cat.total}</span>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Card>

        {latest && (
          <Card id="result" className="space-y-5 p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.resultReport}</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight">{latest.trainer?.trainerName}</h2>
              </div>
              <Badge tone={latest.result === "Pass" ? "success" : "danger"}>
                {latest.result === "Pass" ? t.pass : t.fail}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <ResultTile label={t.totalScore} value={`${latest.totalScore}/5`} />
              <ResultTile label={t.percentage} value={`${latest.percentage}%`} />
              <ResultTile label={t.date} value={latest.evaluationDate} />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="h-80 rounded-[28px] bg-white/70 p-3">
                <ResponsiveContainer>
                  <RadarChart data={latest.categorySummary}>
                    <PolarGrid stroke="#dbe3ef" />
                    <PolarAngleAxis dataKey="categoryName" tick={{ fontSize: 10, fill: "#475569" }} />
                    <Radar dataKey="average" fill="#2563EB" fillOpacity={0.28} stroke="#2563EB" strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {latest.categorySummary.map((item) => (
                  <div key={item.categoryId} className="rounded-2xl bg-white/75 p-3">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-bold">{item.categoryName}</span>
                      <span className={cn("font-black", item.isCritical && item.average < 3 ? "text-danger" : "")}>{item.average.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={cn("h-2 rounded-full", item.isCritical && item.average < 3 ? "bg-danger" : "bg-primary")}
                        style={{ width: `${(item.average / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {latest.comment && (
              <div className="rounded-2xl bg-white/75 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{t.comment}</p>
                <p className="text-sm leading-6 text-slate-700">{latest.comment}</p>
              </div>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}

function QuestionRow({ index, question, score, onScore }: { index: number; question: Question; score?: number; onScore: (score: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("rounded-[24px] border p-4 transition", score ? "border-blue-200 bg-blue-50/60 shadow-[0_12px_30px_rgba(37,99,235,0.08)]" : "border-slate-200 bg-white/78")}>
      <div className="mb-3 flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index}</span>
        <div className="flex-1">
          <p className="pt-1 text-sm font-bold leading-6 text-slate-800">{question.questionText}</p>
          {question.options.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-semibold text-primary hover:underline"
            >
              {expanded ? "ซ่อนเกณฑ์" : "ดูเกณฑ์การให้คะแนน"}
            </button>
          )}
        </div>
      </div>
      {expanded && question.options.length > 0 && (
        <div className="mb-3 ml-11 space-y-1.5 rounded-2xl bg-slate-50/80 p-3">
          {question.options.map((option, i) => (
            <div key={i} className="flex gap-2 text-xs leading-5 text-slate-600">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-bold">{i + 1}</span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={cn(
              "touch-target rounded-2xl border px-2 py-2 text-center transition",
              score === value
                ? "border-primary bg-primary text-white shadow-[0_14px_24px_rgba(37,99,235,0.24)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
            )}
            onClick={() => onScore(value)}
            aria-label={`Score ${value}: ${scoreLabels[value - 1]}`}
          >
            <span className="block text-lg font-black">{value}</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-wide sm:block">{scoreLabels[value - 1]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white/75 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}
