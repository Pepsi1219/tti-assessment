"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AssessmentKind } from "@/lib/types";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [employeeId, setEmployeeId] = useState("");
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [workflowType, setWorkflowType] = useState<AssessmentKind>("assessment");
  const [evaluators, setEvaluators] = useState<
    Array<{ id: string; name: string; employeeId: string }>
  >([]);
  const [topics, setTopics] = useState<
    Array<{ id: string; topicName: string; kind?: AssessmentKind }>
  >([]);
  const [adminMode, setAdminMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "Admin" || session?.user?.role === "Developer")
      router.replace("/admin/evaluation-summaries");
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/evaluators")
      .then((response) => {
        if (!response.ok)
          throw new Error("Evaluator directory is unavailable.");
        return response.json();
      })
      .then((data) => setEvaluators(Array.isArray(data) ? data : []))
      .catch(() => {
        setEvaluators([]);
        setError(t.loginTemporaryError);
      });
  }, [t.loginTemporaryError]);

  useEffect(() => {
    fetch("/api/public/topics")
      .then((response) => {
        if (!response.ok) throw new Error("Topic directory is unavailable.");
        return response.json();
      })
      .then((data) => setTopics(Array.isArray(data) ? data : []))
      .catch(() => setTopics([]));
  }, []);

  async function signInWith(employeeIdToUse: string, destination: string) {
    if (!employeeIdToUse) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        employeeId: employeeIdToUse,
        redirect: false,
      });

      if (!result || result.error) {
        setError(t.loginError);
        return;
      }

      // Start a new document request after the auth cookie is written. This avoids
      // relying on the SessionProvider's in-memory state immediately after sign-in.
      window.location.replace(destination);
    } catch {
      setError(t.loginTemporaryError);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signInWith(employeeId.trim(), "/admin/evaluation-summaries");
  }

  async function handleEvaluatorSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("evaluator-workflow-type", workflowType);
    const destination = workflowType === "exam"
      ? `/evaluator/exams?topicId=${encodeURIComponent(selectedTopicId)}`
      : `/evaluator?topicId=${encodeURIComponent(selectedTopicId)}`;
    if (session?.user?.role === "Evaluator" && selectedTopicId) {
      sessionStorage.setItem("evaluator-workflow-type", workflowType);
      window.location.replace(destination);
      return;
    }
    const evaluator = evaluators.find(
      (item) => item.id === selectedEvaluatorId,
    );
    if (!evaluator || !selectedTopicId) return;
    await signInWith(
      evaluator.employeeId,
      destination,
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-3 dark:bg-slate-950 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.14)] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 8% 18%, rgba(37,99,235,0.42), transparent 30%), radial-gradient(circle at 84% 78%, rgba(14,165,233,0.24), transparent 28%)",
            }}
          />
          <div className="absolute -right-32 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full border border-white/10" />

          <div className="relative">
            <div className="h-20 w-28">
              <Image
                src={logo}
                alt={t.appName}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-14 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                {t.evaluationTopics}
              </div>
              <h1 className="text-4xl font-black leading-[1.08] tracking-tight xl:text-5xl">
                {t.title}
              </h1>
              {topics.length > 0 && (
                <div className="scrollbar-hide mt-8 max-h-52 space-y-2 overflow-y-auto pr-2">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-slate-100 backdrop-blur-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-300" />
                      <span>{topic.topicName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-slate-300">
            <ShieldCheck className="h-5 w-5 text-blue-300" />
            {t.securePortal}
          </div>
        </section>

        <section className="relative flex min-h-[calc(100vh-1.5rem)] flex-col bg-white px-5 py-6 sm:px-10 sm:py-9 lg:min-h-0 lg:px-[12%] lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="h-11 w-16">
                <Image
                  src={logo}
                  alt={t.appName}
                  priority
                  className="h-full w-full object-contain brightness-0 dark:brightness-100"
                />
              </div>
              <p className="max-w-[220px] text-sm font-black leading-5 text-slate-950">
                {t.title}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            {adminMode && (
              <div className="mb-9">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  {t.admin}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {t.adminLogin}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {t.adminAccessDescription}
                </p>
              </div>
            )}

            <form
              onSubmit={adminMode ? handleAdminSubmit : handleEvaluatorSubmit}
              className="space-y-5"
            >
              {adminMode ? (
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    {t.employeeId}
                  </span>
                  <Input
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 text-center text-lg font-bold tracking-wider shadow-inner focus:bg-white"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      setError("");
                    }}
                    autoFocus
                  />
                </label>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">{t.assessmentType}</span>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                      {(["assessment", "exam"] as const).map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          aria-pressed={workflowType === kind}
                          className={`min-h-11 rounded-xl px-3 text-sm font-bold transition ${workflowType === kind ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                          onClick={() => {
                            setWorkflowType(kind);
                            setSelectedTopicId("");
                            setError("");
                          }}
                        >
                          {kind === "assessment" ? t.assessmentMode : t.examMode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">
                      {t.course}
                    </span>
                    <Select
                      value={selectedTopicId}
                      onValueChange={(value) => {
                        setSelectedTopicId(value);
                        setError("");
                      }}
                    >
                      <SelectTrigger
                        aria-label={t.selectTopic}
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 text-base shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <SelectValue placeholder={t.selectTopic} />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={8}
                        className="rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                      >
                        {topics.filter((topic) => (topic.kind ?? "assessment") === workflowType).map((topic) => (
                          <SelectItem
                            key={topic.id}
                            value={topic.id}
                            className="py-3 text-[15px]"
                          >
                            {topic.topicName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">
                      {t.evaluator}
                    </span>
                    <Select
                      value={selectedEvaluatorId}
                      onValueChange={(value) => {
                        setSelectedEvaluatorId(value);
                        setError("");
                      }}
                    >
                      <SelectTrigger
                        aria-label={t.selectEvaluator}
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 text-base shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <SelectValue placeholder={t.selectEvaluator} />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={8}
                        className="rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                      >
                        {evaluators.map((evaluator) => (
                          <SelectItem
                            key={evaluator.id}
                            value={evaluator.id}
                            className="py-3 text-[15px]"
                          >
                            {evaluator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-14 w-full gap-2 rounded-2xl text-base"
                disabled={
                  loading ||
                  (adminMode
                    ? !employeeId.trim()
                    : !selectedTopicId ||
                      (session?.user?.role !== "Evaluator" &&
                        !selectedEvaluatorId))
                }
              >
                {loading ? (
                  <LogIn className="h-5 w-5 animate-pulse" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
                {loading ? t.loading : adminMode ? t.login : t.continue}
              </Button>
            </form>

            <div className="my-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              {t.or}
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => {
                setAdminMode(!adminMode);
                setError("");
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-primary"
            >
              <ShieldCheck className="h-4 w-4" />
              {adminMode ? t.selectEvaluator : t.adminLogin}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          <p className="text-center text-xs font-medium text-slate-400">
            {t.internalUseOnly}
          </p>
        </section>
      </div>
    </main>
  );
}
