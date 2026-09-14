"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/types";

const localeOptions: Record<Locale, { code: string; label: string }> = {
  th: { code: "TH", label: "Thai" },
  en: { code: "EN", label: "English" },
  lo: { code: "LO", label: "Lao" },
  vi: { code: "VI", label: "Vietnamese" },
};

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(value as Locale)}
    >
      <SelectTrigger
        aria-label="Language"
        title={localeOptions[locale].label}
        className="h-9 w-16 rounded-xl border-slate-200 bg-white px-2.5 py-0 text-[11px] font-black tracking-[0.12em] text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-slate-400"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-16 rounded-xl border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        {Object.entries(localeOptions).map(([key, language]) => (
          <SelectItem
            key={key}
            value={key}
            className="rounded-lg py-2 pl-2.5 pr-7 text-xs font-black tracking-[0.1em] text-slate-700 data-[state=checked]:bg-blue-50 data-[state=checked]:text-primary dark:text-slate-100 dark:data-[state=checked]:bg-blue-950/60"
            aria-label={language.label}
          >
            {language.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
