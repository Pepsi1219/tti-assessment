"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/types";

const localeLabels: Record<Locale, string> = {
  th: "ไทย",
  en: "English",
  lo: "ລາວ",
  vi: "Tiếng Việt"
};

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 shadow-sm">
      <Languages className="h-4 w-4 text-slate-500" />
      <select
        className="bg-transparent text-sm font-semibold outline-none"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {Object.entries(localeLabels).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
  );
}
