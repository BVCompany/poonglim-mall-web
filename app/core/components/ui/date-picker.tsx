/**
 * Date Picker Component
 *
 * 캘린더 UI — Radix Popover(Portal)로 열어 Dialog 등 overflow:hidden 안에서도 잘리지 않게 함.
 */

import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";
import { Button, buttonVariants } from "~/core/components/ui/button";
import { Calendar } from "~/core/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/core/components/ui/popover";

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  /** 트리거 버튼 스타일 (기본 outline) */
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  defaultMonth?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "연도. 월. 일.",
  className,
  triggerVariant = "outline",
  disabled = false,
  minDate,
  maxDate,
  defaultMonth,
  disablePast = false,
  disableFuture = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    defaultMonth || value || new Date(),
  );

  React.useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setCurrentMonth(value);
    }
  }, [value]);

  const startOfDay = (dt: Date) => {
    const x = new Date(dt);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };

  const isDayDisabled = React.useCallback(
    (d: Date) => {
      const t = startOfDay(d);

      if (disablePast) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (t < today.getTime()) return true;
      }

      if (disableFuture) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (t > today.getTime()) return true;
      }

      if (minDate && t < startOfDay(minDate)) return true;
      if (maxDate && t > startOfDay(maxDate)) return true;

      return false;
    },
    [disablePast, disableFuture, minDate, maxDate],
  );

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onChange(date);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onChange(undefined);
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onChange(today);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          type="button"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-gray-500",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selectedDate ? (
            format(selectedDate, "yyyy. MM. dd.", { locale: ko })
          ) : (
            <span>{placeholder}</span>
          )}
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
            onSelect={handleSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={isDayDisabled}
            initialFocus
          />
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
            onClick={handleToday}
            disabled={disabled}
            className="text-sm font-medium text-[#02633E] hover:underline disabled:opacity-50"
          >
            오늘
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
