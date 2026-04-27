/**
 * 날짜(캘린더) + 시각 — `datetime-local` 문자열(yyyy-MM-ddTHH:mm)과 동기화.
 * Dialog 안에서도 DatePicker와 동일하게 Popover modal 사용.
 */

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";
import {
  mergeDatetimeLocal,
  splitDatetimeLocal,
  toDatetimeLocalValue,
} from "~/core/lib/datetime-local";
import { Button } from "~/core/components/ui/button";
import { Label } from "~/core/components/ui/label";
import { Calendar } from "~/core/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/core/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

const PAD2 = (n: number) => String(n).padStart(2, "0");
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

function parseHourMinute(hm: string): { hour: number; minute: number } {
  const [a, b] = hm.split(":");
  const h = parseInt(a ?? "", 10);
  const m = parseInt(b ?? "", 10);
  const hour = Number.isFinite(h) && h >= 0 && h <= 23 ? h : 12;
  const minute = Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0;
  return { hour, minute };
}

export interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "연도. 월. 일. 시:분",
  className,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    const sp = splitDatetimeLocal(value);
    if (!sp) return undefined;
    const d = new Date(`${sp.date}T12:00:00`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  const timeHm = splitDatetimeLocal(value)?.time ?? "12:00";
  const { hour, minute } = parseHourMinute(timeHm);

  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    () => selectedDate ?? new Date(),
  );

  React.useEffect(() => {
    if (selectedDate) setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const displayLabel = React.useMemo(() => {
    const sp = splitDatetimeLocal(value);
    if (!sp) return null;
    const d = new Date(mergeDatetimeLocal(sp.date, sp.time));
    if (Number.isNaN(d.getTime())) return null;
    return format(d, "yyyy. MM. dd. HH:mm", { locale: ko });
  }, [value]);

  const fallbackParts = React.useCallback(() => {
    const now = new Date();
    return {
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
    };
  }, []);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const sp = splitDatetimeLocal(value) ?? fallbackParts();
    onChange(mergeDatetimeLocal(format(date, "yyyy-MM-dd"), sp.time));
  };

  const handleTimeChange = (hm: string) => {
    const sp = splitDatetimeLocal(value) ?? fallbackParts();
    onChange(mergeDatetimeLocal(sp.date, hm));
  };

  const setHour = (h: number) => handleTimeChange(`${PAD2(h)}:${PAD2(minute)}`);
  const setMinute = (m: number) => handleTimeChange(`${PAD2(hour)}:${PAD2(m)}`);

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleNow = () => {
    onChange(toDatetimeLocalValue(new Date()));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayLabel && "text-gray-500",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayLabel ? <span>{displayLabel}</span> : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="pointer-events-auto z-[200] w-auto overflow-hidden p-0"
        align="start"
        sideOffset={6}
        collisionPadding={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="p-3"
          style={
            {
              "--rdp-accent-color": "#02633E",
              "--rdp-accent-background-color": "rgba(2, 99, 62, 0.12)",
            } as React.CSSProperties
          }
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            initialFocus
          />
        </div>
        <div className="space-y-2 border-t px-3 py-3">
          <Label className="text-xs font-medium text-gray-700">시각 (24시간제)</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(hour)}
              onValueChange={(v) => setHour(Number(v))}
              disabled={disabled}
            >
              <SelectTrigger
                size="sm"
                className="h-9 min-w-[5.5rem] flex-1 rounded-lg border-gray-200 bg-white font-mono text-sm sm:flex-none"
                aria-label="시"
              >
                <SelectValue placeholder="시" />
              </SelectTrigger>
              <SelectContent className="z-[250] max-h-60">
                {HOUR_OPTIONS.map((h) => (
                  <SelectItem key={h} value={String(h)} className="font-mono">
                    {PAD2(h)}시
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-400" aria-hidden>
              :
            </span>
            <Select
              value={String(minute)}
              onValueChange={(v) => setMinute(Number(v))}
              disabled={disabled}
            >
              <SelectTrigger
                size="sm"
                className="h-9 min-w-[5.5rem] flex-1 rounded-lg border-gray-200 bg-white font-mono text-sm sm:flex-none"
                aria-label="분"
              >
                <SelectValue placeholder="분" />
              </SelectTrigger>
              <SelectContent className="z-[250] max-h-60">
                {MINUTE_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)} className="font-mono">
                    {PAD2(m)}분
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] leading-snug text-gray-500">
            목록에서 시·분을 고릅니다(0–23시, 0–59분). 저장 값은 이 기기 로컬 시각 기준입니다.
          </p>
        </div>
        <div className="flex justify-between border-t px-3 py-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-sm font-medium text-[#02633E] hover:underline disabled:opacity-50"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={handleNow}
            disabled={disabled}
            className="text-sm font-medium text-[#02633E] hover:underline disabled:opacity-50"
          >
            지금
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
