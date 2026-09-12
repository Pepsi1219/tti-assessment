"use client";

import { Edit2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import type { BusinessUnitCode, EvaluationRecipient } from "@/lib/types";

const businessUnitCodes: BusinessUnitCode[] = ["G1", "G2", "G3", "G4", "EA", "TRM"];
type RecipientForm = { employeeId: string; recipientName: string; bu: string; buCode: BusinessUnitCode | ""; status: "Active" | "Inactive" };
const emptyForm: RecipientForm = { employeeId: "", recipientName: "", bu: "", buCode: "", status: "Active" };

export default function RecipientManagementPage() {
  const { t } = useI18n();
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EvaluationRecipient | null>(null);
  const [form, setForm] = useState<RecipientForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/recipients");
    if (response.ok) setRecipients(await response.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = recipients.filter((recipient) =>
    [recipient.employeeId, recipient.recipientName, recipient.bu, recipient.buCode, recipient.status]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

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
      status: recipient.status
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing?.id })
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
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{t.recipientManagement}</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />{t.addRecipient}</Button>
      </div>

      <Card className="p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>{t.employeeId}</TableHead><TableHead>{t.recipient}</TableHead><TableHead>{t.department}</TableHead><TableHead>BU</TableHead><TableHead>{t.status}</TableHead><TableHead className="text-right">{t.actions}</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell className="font-bold">{recipient.employeeId}</TableCell>
                <TableCell>{recipient.recipientName}</TableCell>
                <TableCell>{recipient.bu}</TableCell>
                <TableCell>{recipient.buCode ?? "-"}</TableCell>
                <TableCell><Badge tone={recipient.status === "Active" ? "success" : "danger"}>{recipient.status === "Active" ? t.active : t.inactive}</Badge></TableCell>
                <TableCell className="text-right"><button onClick={() => openEdit(recipient)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-blue-50"><Edit2 className="h-4 w-4 text-primary" /></button></TableCell>
              </TableRow>
            ))}
            {!filtered.length && <TableRow><TableCell colSpan={6} className="py-8 text-center text-slate-400">{t.noData}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? t.edit : t.addRecipient}>
        <div className="space-y-4">
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.employeeId}</span><Input value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} /></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.recipient}</span><Input value={form.recipientName} onChange={(event) => setForm({ ...form, recipientName: event.target.value })} /></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.department}</span><Input value={form.bu} onChange={(event) => setForm({ ...form, bu: event.target.value })} /></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">BU</span><select className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary" value={form.buCode} onChange={(event) => setForm({ ...form, buCode: event.target.value as RecipientForm["buCode"] })}><option value="">BU</option>{businessUnitCodes.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
          <label className="block space-y-1"><span className="text-sm font-bold text-slate-700">{t.status}</span><select className="touch-target w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as RecipientForm["status"] })}><option value="Active">{t.active}</option><option value="Inactive">{t.inactive}</option></select></label>
          <div className="flex justify-end gap-3 pt-2"><Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => setDialogOpen(false)}>{t.cancel}</Button><Button onClick={save} disabled={saving || !form.employeeId || !form.recipientName || !form.bu || !form.buCode}>{saving ? t.submitting : t.save}</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
