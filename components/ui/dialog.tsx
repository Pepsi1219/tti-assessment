"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-3 touch-pan-y sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 my-3 max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-lg overflow-y-auto overscroll-contain rounded-[28px] border border-white/80 bg-white p-5 text-slate-950 shadow-2xl scrollbar-hide touch-pan-y sm:my-6 sm:max-h-[calc(100dvh-3rem)] sm:p-6 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
          className,
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
