import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "danger" | "warning" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700"
  };
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
