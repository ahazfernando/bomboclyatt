"use client";

import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const DATE_RANGE_PRESETS = [
  { label: "Last week", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 60 days", days: 60 },
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]["label"];

export function getPresetRange(days: number): DateRange {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, days - 1));
  return { from, to };
}

export function matchesPreset(range: DateRange | undefined, days: number): boolean {
  if (!range?.from || !range?.to) return false;
  const preset = getPresetRange(days);
  return isSameDay(range.from, preset.from!) && isSameDay(range.to, preset.to!);
}

type DateRangePickerProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
};

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const label =
    value?.from && value?.to
      ? `${format(value.from, "d MMM, yyyy")} – ${format(value.to, "d MMM, yyyy")}`
      : value?.from
        ? format(value.from, "d MMM, yyyy")
        : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group h-11 justify-start gap-2 rounded-full bg-background px-4 text-sm font-medium text-foreground shadow-card",
            "hover:bg-maple hover:text-tuft",
            !value?.from && "text-muted-foreground hover:text-tuft",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-tuft/90" />
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-hover:text-tuft/90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-wrap gap-2 border-b border-border p-3">
          {DATE_RANGE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(getPresetRange(preset.days))}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                matchesPreset(value, preset.days)
                  ? "bg-maple text-tuft"
                  : "bg-secondary/60 text-foreground hover:bg-maple hover:text-tuft"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}

type DateRangePresetFiltersProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
};

export function DateRangePresetFilters({ value, onChange, className }: DateRangePresetFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {DATE_RANGE_PRESETS.map((preset) => {
        const active = matchesPreset(value, preset.days);
        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(getPresetRange(preset.days))}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-maple text-tuft shadow-glow"
                : "bg-background text-foreground shadow-card hover:bg-maple hover:text-tuft"
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

export function isWithinDateRange(dateStr: string, range: DateRange | undefined): boolean {
  if (!range?.from) return true;
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return true;

  const from = new Date(range.from);
  from.setHours(0, 0, 0, 0);

  const to = new Date(range.to ?? range.from);
  to.setHours(23, 59, 59, 999);

  return date >= from && date <= to;
}
