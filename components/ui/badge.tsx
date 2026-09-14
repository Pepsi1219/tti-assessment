import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning";
}) {
  const tones = {
    neutral:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    success:
      "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  };
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
