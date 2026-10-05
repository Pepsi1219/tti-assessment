"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/context";

function parseDate(value: string | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : null;
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarDateInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string | undefined) => void;
  label: string;
}) {
  const { t, locale } = useI18n();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseDate(value);
  const [open, setOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [position, setPosition] = useState({ top: 0, left: 12 });

  useEffect(() => {
    if (!open) return;

    const selectedDay = calendarRef.current?.querySelector<HTMLButtonElement>(
      'button[aria-pressed="true"]',
    );
    (selectedDay ?? calendarRef.current?.querySelector<HTMLButtonElement>("button"))?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || calendarRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const bounds = trigger.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - 24);
      const height = 340;
      const left = Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12));
      const top = bounds.bottom + height + 8 > window.innerHeight && bounds.top > height
        ? bounds.top - height - 8
        : bounds.bottom + 8;
      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(selectedDate)
    : "";
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2023, 0, 1 + index),
    ),
  );
  const firstDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  ).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) =>
    new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      index - firstDay + 1,
    ),
  );
  const todayValue = toDateValue(new Date());

  function openCalendar() {
    const current = selectedDate ?? new Date();
    setCalendarMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    setOpen(true);
  }

  function shiftMonth(amount: number) {
    setCalendarMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  function selectDate(date: Date) {
    onChange(toDateValue(date));
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => open ? setOpen(false) : openCalendar()}
        className="mt-4 flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
      >
        <span className={dateLabel ? "font-medium text-slate-900" : "text-slate-400"}>
          {dateLabel || t.date}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      </button>
      {open && createPortal(
        <div
          ref={calendarRef}
          id={id}
          role="dialog"
          aria-label={label}
          onKeyDownCapture={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            triggerRef.current?.focus();
          }}
          className="fixed z-[60] w-72 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-[0_16px_48px_rgba(15,23,42,0.2)]"
          style={position}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label={t.previous}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold">{monthLabel}</p>
            <button
              type="button"
              aria-label={t.next}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center">
            {weekdays.map((weekday, index) => (
              <span key={`${index}-${weekday}`} className="grid h-9 place-items-center text-xs font-semibold text-slate-500">
                {weekday}
              </span>
            ))}
            {calendarDays.map((date) => {
              const dateValue = toDateValue(date);
              const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
              const isSelected = dateValue === value;
              return (
                <button
                  key={dateValue}
                  type="button"
                  aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date)}
                  aria-pressed={isSelected}
                  onClick={() => selectDate(date)}
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-lg text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "bg-primary font-bold text-white"
                      : dateValue === todayValue
                        ? "border border-primary font-semibold text-primary hover:bg-primary/10"
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-end border-t border-slate-100 pt-2">
            <button
              type="button"
              disabled={!value}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {t.clearDate}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}