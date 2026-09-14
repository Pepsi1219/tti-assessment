"use client";

import { ChevronLeft, ChevronRight, Edit2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import type {
  BusinessUnitCode,
  EvaluationRecipient,
  EvaluationResult,
} from "@/lib/types";

const businessUnitCodes: BusinessUnitCode[] = [
  "G1",
  "G2",
  "G3",
  "G4",
  "EA",
  "TRM",
];
type RecipientForm = {
  employeeId: string;
  recipientName: string;
  bu: string;
  buCode: BusinessUnitCode | "";
  status: "Active" | "Inactive";
};
const emptyForm: RecipientForm = {
  employeeId: "",
  recipientName: "",
  bu: "",
  buCode: "",
  status: "Active",
};

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
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <option value="all">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {optionLabels?.[option] ?? option}
        </option>
      ))}
    </select>
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

export default function RecipientManagementPage() {
  const { t } = useI18n();
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
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
  const [editing, setEditing] = useState<EvaluationRecipient | null>(null);
  const [form, setForm] = useState<RecipientForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [recipientsResult, evaluationsResult] = await Promise.allSettled([
        fetch("/api/recipients"),
        fetch("/api/evaluations"),
      ]);
      if (recipientsResult.status === "fulfilled" && recipientsResult.value.ok)
        setRecipients(await recipientsResult.value.json());
      if (
        evaluationsResult.status === "fulfilled" &&
        evaluationsResult.value.ok
      )
        setEvaluations(await evaluationsResult.value.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      Array.from(
        new Set(values.filter((value): value is string => Boolean(value))),
      ).sort();
    return {
      buCodes: unique(recipients.map((recipient) => recipient.buCode)),
      departments: unique(recipients.map((recipient) => recipient.bu)),
      courses: unique(evaluations.map((evaluation) => evaluation.topicName)),
      years: unique(
        evaluations.map((evaluation) => evaluation.evaluationDate?.slice(0, 4)),
      ).reverse(),
    };
  }, [evaluations, recipients]);

  const filtered = useMemo(() => {
    const matchingRecipientIds = new Set(
      evaluations
        .filter((evaluation) => {
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
        })
        .map((evaluation) => evaluation.recipientId),
    );
    const hasEvaluationFilters =
      filterCourse !== "all" || filterYear !== "all" || filterResult !== "all";

    return recipients.filter((recipient) => {
      if (filterBuCode !== "all" && recipient.buCode !== filterBuCode)
        return false;
      if (filterDepartment !== "all" && recipient.bu !== filterDepartment)
        return false;
      if (filterStatus !== "all" && recipient.status !== filterStatus)
        return false;
      if (
        filterEmployeeId &&
        !recipient.employeeId
          .toLowerCase()
          .includes(filterEmployeeId.trim().toLowerCase())
      )
        return false;
      if (hasEvaluationFilters && !matchingRecipientIds.has(recipient.id))
        return false;
      return true;
    });
  }, [
    evaluations,
    filterBuCode,
    filterCourse,
    filterDepartment,
    filterEmployeeId,
    filterResult,
    filterStatus,
    filterYear,
    recipients,
  ]);

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
    setDialogOpen(true);
  }

  function openEdit(recipient: EvaluationRecipient) {
    setEditing(recipient);
    setForm({
      employeeId: recipient.employeeId,
      recipientName: recipient.recipientName,
      bu: recipient.bu,
      buCode: recipient.buCode ?? "",
      status: recipient.status,
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing?.id }),
      });
      if (response.ok) {
        setDialogOpen(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
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
            {t.recipientManagement}
          </h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.addRecipient}
        </Button>
      </div>

      <Card className="p-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <Input
            className="rounded-2xl"
            placeholder={t.employeeId}
            value={filterEmployeeId}
            onChange={(event) => setFilterEmployeeId(event.target.value)}
          />
          <FilterSelect
            value={filterBuCode}
            onChange={setFilterBuCode}
            label={`${t.all} BU`}
            options={filterOptions.buCodes}
          />
          <FilterSelect
            value={filterDepartment}
            onChange={setFilterDepartment}
            label={`${t.all} ${t.department}`}
            options={filterOptions.departments}
          />
          <FilterSelect
            value={filterCourse}
            onChange={setFilterCourse}
            label={`${t.all} ${t.course}`}
            options={filterOptions.courses}
          />
          <FilterSelect
            value={filterYear}
            onChange={setFilterYear}
            label={`${t.all} ${t.year}`}
            options={filterOptions.years}
          />
          <FilterSelect
            value={filterResult}
            onChange={setFilterResult}
            label={`${t.all} ${t.result}`}
            options={["Pass", "Fail"]}
            optionLabels={{ Pass: t.pass, Fail: t.fail }}
          />
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            label={`${t.all} ${t.status}`}
            options={["Active", "Inactive"]}
            optionLabels={{ Active: t.active, Inactive: t.inactive }}
          />
        </div>
        <Table className="min-w-[980px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-px whitespace-nowrap">
                {t.employeeId}
              </TableHead>
              <TableHead className="min-w-56">{t.recipient}</TableHead>
              <TableHead className="min-w-48">{t.department}</TableHead>
              <TableHead className="w-px whitespace-nowrap">BU</TableHead>
              <TableHead className="w-px whitespace-nowrap">
                {t.status}
              </TableHead>
              <TableHead className="w-[104px] min-w-[104px] whitespace-nowrap text-center">
                {t.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell className="whitespace-nowrap font-bold tabular-nums">
                  {recipient.employeeId}
                </TableCell>
                <TableCell>{recipient.recipientName}</TableCell>
                <TableCell>{recipient.bu}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {recipient.buCode ?? "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    tone={recipient.status === "Active" ? "success" : "danger"}
                  >
                    {recipient.status === "Active" ? t.active : t.inactive}
                  </Badge>
                </TableCell>
                <TableCell className="w-[104px] min-w-[104px]">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => openEdit(recipient)}
                      className="grid h-9 w-9 place-items-center rounded-xl text-primary transition hover:bg-blue-50 dark:hover:bg-blue-950/60"
                      title={t.edit}
                      aria-label={`${t.edit}: ${recipient.recipientName}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-slate-400"
                >
                  {t.noData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap">{t.rowsPerPage}</span>
            <select
              aria-label={t.rowsPerPage}
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="whitespace-nowrap">
              {filtered.length === 0
                ? "0"
                : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)}`}{" "}
              {t.of} {filtered.length}
            </span>
          </div>
          <nav aria-label="Pagination" className="flex items-center gap-1">
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
                  aria-label={`Page ${pageNumber}`}
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
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? t.edit : t.addRecipient}
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
              {t.recipient}
            </span>
            <Input
              value={form.recipientName}
              onChange={(event) =>
                setForm({ ...form, recipientName: event.target.value })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">
              {t.department}
            </span>
            <Input
              value={form.bu}
              onChange={(event) => setForm({ ...form, bu: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">BU</span>
            <select
              className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary"
              value={form.buCode}
              onChange={(event) =>
                setForm({
                  ...form,
                  buCode: event.target.value as RecipientForm["buCode"],
                })
              }
            >
              <option value="">BU</option>
              {businessUnitCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.status}</span>
            <select
              className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary"
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as RecipientForm["status"],
                })
              }
            >
              <option value="Active">{t.active}</option>
              <option value="Inactive">{t.inactive}</option>
            </select>
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
              disabled={
                saving ||
                !form.employeeId ||
                !form.recipientName ||
                !form.bu ||
                !form.buCode
              }
            >
              {saving ? t.submitting : t.save}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
