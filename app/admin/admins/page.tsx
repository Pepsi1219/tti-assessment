"use client";

import { Edit2, Plus, Search, Trash2 } from "lucide-react";
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
import type { AdminPageKey, User } from "@/lib/types";

type AdminForm = {
  employeeId: string;
  name: string;
  email: string;
  role: "Admin" | "Developer";
  status: "Active" | "Inactive";
};

const emptyForm: AdminForm = {
  employeeId: "",
  name: "",
  email: "",
  role: "Admin",
  status: "Active",
};

export default function AdminManagementPage() {
  const { t } = useI18n();
  const [admins, setAdmins] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [adminPages, setAdminPages] = useState<AdminPageKey[]>([
    "evaluators",
    "recipients",
    "assessmentVersions",
    "evaluationSummaries",
  ]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionsSaved, setPermissionsSaved] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [savedAdminPages, setSavedAdminPages] = useState<AdminPageKey[]>([
    "evaluators",
    "recipients",
    "assessmentVersions",
    "evaluationSummaries",
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admins");
    if (response.ok) setAdmins(await response.json());
    else setError(t.error);
    setLoading(false);
  }, [t.error]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/admin-permissions")
      .then((response) => response.ok ? response.json() : null)
      .then((body: { pages?: AdminPageKey[] } | null) => {
        if (body?.pages) {
          setAdminPages(body.pages);
          setSavedAdminPages(body.pages);
        }
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return admins.filter((admin) => {
      if (status !== "all" && (admin.status ?? "Active") !== status)
        return false;
      if (!normalizedQuery) return true;
      return [admin.employeeId, admin.name, admin.email]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [admins, query, status]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(admin: User) {
    setEditing(admin);
    setForm({
      employeeId: admin.employeeId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status ?? "Active",
    });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admins", {
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

  async function savePermissions() {
    setSavingPermissions(true);
    setPermissionsSaved(false);
    setError("");
    try {
      const response = await fetch("/api/admin-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: adminPages }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? t.error);
        return;
      }
      const body = await response.json();
      setAdminPages(body.pages);
      setSavedAdminPages(body.pages);
      setPermissionsSaved(true);
      window.dispatchEvent(new Event("admin-permissions-updated"));
    } catch {
      setError(t.error);
    } finally {
      setSavingPermissions(false);
    }
  }

  const permissionsChanged =
    adminPages.length !== savedAdminPages.length ||
    adminPages.some((page) => !savedAdminPages.includes(page));

  function toggleAdminPage(page: AdminPageKey) {
    setPermissionsSaved(false);
    setAdminPages((current) =>
      current.includes(page)
        ? current.filter((item) => item !== page)
        : [...current, page],
    );
  }

  async function remove(admin: User) {
    if (!window.confirm(`${t.confirmDelete} ${admin.name}`)) return;
    setError("");
    const response = await fetch(
      `/api/admins?id=${encodeURIComponent(admin.id)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? t.error);
      return;
    }
    await load();
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {t.admin}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">
            {t.adminManagement}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
            onClick={() => {
              setPermissionsSaved(false);
              setPermissionsDialogOpen(true);
            }}
          >
            Admin Permission
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t.addAdmin}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <Dialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        title="สิทธิ์การเข้าถึงหน้าของ role Admin"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            เลือกหน้าที่บัญชี role Admin สามารถเปิดและมองเห็นเมนูได้
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["dashboard", t.dashboard],
              ["admins", t.admin],
              ["evaluators", t.evaluator],
              ["recipients", t.recipients],
              ["topics", t.evaluationTopics],
              ["assessmentVersions", t.assessmentVersions],
              ["evaluations", t.evaluationsLog],
              ["evaluationSummaries", t.evaluationSummaries],
              ["system", t.system],
            ] as [AdminPageKey, string][]).map(([page, label]) => (
              <label
                key={page}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-700"
              >
                <input
                  type="checkbox"
                  checked={adminPages.includes(page)}
                  onChange={() => toggleAdminPage(page)}
                  className="h-4 w-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            {permissionsSaved && (
              <span
                role="status"
                aria-live="polite"
                className="mr-auto text-sm font-bold text-emerald-600"
              >
                {t.success}
              </span>
            )}
            <Button
              className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300"
              onClick={() => setPermissionsDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={savePermissions}
              disabled={savingPermissions || !permissionsChanged}
            >
              {savingPermissions ? t.submitting : t.save}
            </Button>
          </div>
        </div>
      </Dialog>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              className="rounded-2xl pl-11"
              placeholder={t.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <StandardSelect
            value={status}
            onValueChange={setStatus}
            ariaLabel={t.status}
            className="w-full max-w-[180px]"
            options={[
              { value: "all", label: t.status },
              { value: "Active", label: t.active },
              { value: "Inactive", label: t.inactive },
            ]}
          />
        </div>
        <Table className="min-w-[980px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>{t.employeeId}</TableHead>
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.email}</TableHead>
              <TableHead>{t.administratorType}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="w-[120px] text-center">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((admin) => {
              const active = admin.status !== "Inactive";
              return (
                <TableRow key={admin.id}>
                  <TableCell className="font-bold tabular-nums">{admin.employeeId}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge tone={admin.role === "Developer" ? "warning" : "neutral"}>
                      {admin.role === "Developer" ? t.developer : t.admin}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge tone={active ? "success" : "danger"}>
                      {active ? t.active : t.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(admin)}
                        className="grid h-9 w-9 place-items-center rounded-xl text-primary transition hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        title={t.edit}
                        aria-label={`${t.edit}: ${admin.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(admin)}
                        className="grid h-9 w-9 place-items-center rounded-xl text-danger transition hover:bg-red-50 dark:hover:bg-red-950/60"
                        title={t.delete}
                        aria-label={`${t.delete}: ${admin.name}`}
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
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  {t.noData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? t.edit : t.addAdmin}
      >
        <div className="space-y-4">
          <Field label={t.employeeId} value={form.employeeId} onChange={(employeeId) => setForm({ ...form, employeeId })} />
          <Field label={t.name} value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <Field label={t.email} type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.administratorType}</span>
            <StandardSelect
              value={form.role}
              onValueChange={(role) => setForm({ ...form, role: role as AdminForm["role"] })}
              ariaLabel={t.administratorType}
              options={[
                { value: "Admin", label: t.admin },
                { value: "Developer", label: t.developer },
              ]}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-slate-700">{t.status}</span>
            <StandardSelect
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value as AdminForm["status"] })}
              ariaLabel={t.status}
              options={[
                { value: "Active", label: t.active },
                { value: "Inactive", label: t.inactive },
              ]}
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={save} disabled={saving || !form.employeeId || !form.name || !form.email}>
              {saving ? t.submitting : t.save}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
