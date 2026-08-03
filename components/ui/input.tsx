import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("touch-target w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary", props.className)} />;
}
