"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StandardSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type StandardSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: StandardSelectOption[];
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
};

/** Shared select styling, matching the evaluator dropdown on the login page. */
export function StandardSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  placeholder,
  disabled = false,
  className,
  contentClassName,
}: StandardSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "h-11 border-slate-200 bg-slate-50 px-4 text-sm shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        className={cn(
          "border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl",
          contentClassName,
        )}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="py-3 text-[15px]"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
