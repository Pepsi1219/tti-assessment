"use client";

import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StandardSelect } from "@/components/ui/standard-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import type { EvaluationResult, Evaluator } from "@/lib/types";

type EvaluatorForm = {
  employeeId: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
};

const emptyForm: EvaluatorForm = {
  employeeId: "",
  name: "",
  email: "",
  status: "Active",
};

export default function EvaluatorManagementPage() {
  const { t } = useI18n();
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterBuCode, setFilterBuCode] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Evaluator | null>(null);
  const [form, setForm] = useState<EvaluatorForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [evaluatorsResult, evaluationsResult] = await Promise.allSettled([
      fetch("/api/evaluators?includeInactive=1"),
      fetch("/api/evaluations"),
    ]);
    if (evaluatorsResult.status === "fulfilled" && evaluatorsResult.value.ok) {
      setEvaluators(await evaluatorsResult.value.json());
    } else {
      setError(t.error);
    }
    if (
      evaluationsResult.status === "fulfilled" &&
      evaluationsResult.value.ok
    ) {
      setEvaluations(await evaluationsResult.value.json());
    }
    setLoading(false);
  }, [t.error]);

  useEffect(() => {
    load();
  }, [load]);

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      Array.from(
        new Set(values.filter((value): value is string => Boolean(value))),
      ).sort();
    return {
      buCodes: unique(evaluations.map((evaluation) => evaluation.buCode)),
      departments: unique(evaluations.map((evaluation) => evaluation.bu)),
      courses: unique(evaluations.map((evaluation) => evaluation.topicName)),
      years: unique(
        evaluations.map((evaluation) => evaluation.evaluationDate?.slice(0, 4)),
      ).reverse(),
    };
  }, [evaluations]);

  const filtered = useMemo(
    () =>
      evaluators.filter((evaluator) => {
        if (
          filterStatus !== "all" &&
          (evaluator.status ?? "Active") !== filterStatus
        )
          return false;
        if (
          filterEmployeeId &&
          !evaluator.employeeId
            .toLowerCase()
            .includes(filterEmployeeId.trim().toLowerCase())
        )
          return false;
        const hasEvaluationFilters =
          filterBuCode !== "all" ||
          filterDepartment !== "all" ||
          filterCourse !== "all" ||
          filterYear !== "all" ||
          filterResult !== "all";
        if (!hasEvaluationFilters) return true;
        return evaluations.some((evaluation) => {
          const sameEvaluator = evaluation.evaluatorEmployeeId
            ? evaluation.evaluatorEmployeeId === evaluator.employeeId
            : evaluation.evaluatorName === evaluator.name;
          if (!sameEvaluator) return false;
          if (filterBuCode !== "all" && evaluation.buCode !== filterBuCode)
            return false;
          if (filterDepartment !== "all" && evaluation.bu !== filterDepartment)
            return false;
          if (filterCourse !== "all" && evaluation.topicName !== filterCourse)
            return false;
          if (
            filterYear !== "all" &&
            evaluation.evaluationDate?.slice(0, 4) !== filterYear
          )
            return false;
          if (filterResult !== "all" && evaluation.result !== filterResult)
            return false;
          return true;
        });
      }),
    [
      evaluations,
      evaluators,
      filterBuCode,
      filterCourse,
      filterDepartment,
      filterEmployeeId,
      filterResult,
      filterStatus,
      filterYear,
    ],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );
  const pageNumbers = useMemo(
    () => getPageNumbers(totalPages, page),
    [page, totalPages],
  );

  useEffect(() => {
    setPage(1);
  }, [
    filterEmployeeId,
    filterBuCode,
    filterDepartment,
    filterCourse,
    filterYear,
    filterResult,
    filterStatus,
    pageSize,
  ]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(evaluator: Evaluator) {
    setEditing(evaluator);
    setForm({
      employeeId: evaluator.employeeId,
      name: evaluator.name,
      email: evaluator.email,
      status: evaluator.status ?? "Active",
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
        body: JSON.stringify({ ...form, id: editing?.id }),
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

  async function remove(evaluator: Evaluator) {
    if (!window.confirm(`${t.confirmDelete} ${evaluator.name}`)) return;

    setError("");
    const response = await fetch(
      `/api/evaluators?id=${encodeURIComponent(evaluator.id)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? t.error);
      return;
    }
    await load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {t.admin}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">
            {t.evaluatorManagement}
          </h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.addEvaluator}
        </Button>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="w-full max-w-[220px]">
            <Input
              className="rounded-2xl"
              placeholder={t.employeeId}
              value={filterEmployeeId}
              onChange={(event) => setFilterEmployeeId(event.target.value)}
            />
          </div>
          <div className="w-full max-w-[170px]">
            <FilterSelect value={filterBuCode} onChange={setFilterBuCode} label={t.bu} options={filterOptions.buCodes} />
          </div>
          <div className="w-full max-w-[200px]">
            <FilterSelect value={filterDepartment} onChange={setFilterDepartment} label={t.department} options={filterOptions.departments} />
          </div>
          <div className="w-full max-w-[180px]">
            <FilterSelect value={filterCourse} onChange={setFilterCourse} label={t.course} options={filterOptions.courses} />
          </div>
          <div className="w-full max-w-[130px]">
            <FilterSelect value={filterYear} onChange={setFilterYear} label={t.year} options={filterOptions.years} />
          </div>
          <div className="w-full max-w-[150px]">
            <FilterSelect value={filterResult} onChange={setFilterResult} label={t.result} options={["Pass", "Fail"]} optionLabels={{ Pass: t.pass, Fail: t.fail }} />
          </div>
          <div className="w-full max-w-[180px]">
            <FilterSelect
              value={filterStatus}
              onChange={setFilterStatus}
              label={t.status}
              options={["Active", "Inactive"]}
              optionLabels={{ Active: t.active, Inactive: t.inactive }}
            />
          </div>
        </div>
        <Table className="min-w-[1040px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-px whitespace-nowrap">
                {t.employeeId}
              </TableHead>
              <TableHead className="min-w-56 text-left">{t.evaluator}</TableHead>
              <TableHead className="min-w-64 text-left">{t.email}</TableHead>
              <TableHead className="w-[140px] min-w-[140px] whitespace-nowrap">
                {t.status}
              </TableHead>
              <TableHead className="w-[120px] min-w-[120px] whitespace-nowrap text-center">
                {t.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((evaluator) => {
              const active = evaluator.status !== "Inactive";
              return (
                <TableRow key={evaluator.id}>
                  <TableCell className="whitespace-nowrap font-bold tabular-nums">
                    {evaluator.employeeId}
                  </TableCell>
                  <TableCell className="text-left">{evaluator.name}</TableCell>
                  <TableCell className="text-left">{evaluator.email}</TableCell>
                  <TableCell className="w-[140px] min-w-[140px] whitespace-nowrap">
                    <Badge tone={active ? "success" : "danger"}>
                      {active ? t.active : t.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[120px] min-w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(evaluator)}
                        className="grid h-9 w-9 place-items-center rounded-xl text-primary transition hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        title={t.edit}
                        aria-label={`${t.edit}: ${evaluator.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(evaluator)}
                        className="grid h-9 w-9 place-items-center rounded-xl text-danger transition hover:bg-red-50 dark:hover:bg-red-950/60"
                        title={t.delete}
                        aria-label={`${t.delete}: ${evaluator.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtered.length && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-slate-400"
                >
                  {t.noData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap">{t.rowsPerPage}</span>
          <StandardSelect
            ariaLabel={t.rowsPerPage}
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
            className="h-9 w-20 rounded-xl px-3 text-sm font-bold"
            options={[25, 50, 100].map((size) => ({
              value: String(size),
              label: String(size),
            }))}
          />
          <span className="whitespace-nowrap">
            {filtered.length === 0
              ? "0"
              : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)}`}{" "}
            {t.of} {filtered.length}
          </span>
        </div>
        <nav aria-label={t.rowsPerPage} className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t.previous}
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageNumbers.map((pageNumber, index) =>
            pageNumber === null ? (
              <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={pageNumber}
                type="button"
                aria-label={`${t.page} ${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
                className={`grid h-9 min-w-9 place-items-center rounded-xl border px-2 font-bold transition ${pageNumber === page ? "border-primary bg-primary text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"}`}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label={t.next}
            disabled={page === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? t.edit : t.addEvaluator}
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">
              {t.employeeId}
            </span>
            <Input
              value={form.employeeId}
              onChange={(event) =>
                setForm({ ...form, employeeId: event.target.value })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">
              {t.evaluator}
            </span>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.email}</span>
            <Input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.status}</span>
            <StandardSelect
              value={form.status}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  status: value as EvaluatorForm["status"],
                })
              }
              ariaLabel={t.status}
              options={[
                { value: "Active", label: t.active },
                { value: "Inactive", label: t.inactive },
              ]}
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300"
              onClick={() => setDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={save}
              disabled={saving || !form.employeeId || !form.name || !form.email}
            >
              {saving ? t.submitting : t.save}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
  optionLabels,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
  optionLabels?: Record<string, string>;
}) {
  return (
    <StandardSelect
      value={value}
      onValueChange={onChange}
      ariaLabel={label}
      options={[
        { value: "all", label },
        ...options.map((option) => ({
          value: option,
          label: optionLabels?.[option] ?? option,
        })),
      ]}
    />
  );
}

function getPageNumbers(
  totalPages: number,
  currentPage: number,
): Array<number | null> {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const ordered = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const result: Array<number | null> = [];
  ordered.forEach((page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) result.push(null);
    result.push(page);
  });
  return result;
}
