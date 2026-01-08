/**
 * Date Picker Component
 * 
 * A reusable date picker component with calendar UI.
 * Supports initial values, min/max dates, and can be used for both create and edit modes.
 */

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import "~/styles/calendar.css"

import { cn } from "~/core/lib/utils"
import { Button } from "~/core/components/ui/button"
import { Calendar } from "~/core/components/ui/calendar"

export interface DatePickerProps {
  /** Current selected date */
  value?: Date
  /** Callback when date changes */
  onChange: (date: Date | undefined) => void
  /** Placeholder text when no date is selected */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Initial month to display (useful when editing existing data) */
  defaultMonth?: Date
  /** Disable dates in the past */
  disablePast?: boolean
  /** Disable dates in the future */
  disableFuture?: boolean
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "연도. 월. 일.", 
  className,
  minDate,
  maxDate,
  defaultMonth,
  disablePast = false,
  disableFuture = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    defaultMonth || value || new Date()
  )

  // Sync with external value changes
  React.useEffect(() => {
    setSelectedDate(value)
    if (value) {
      setCurrentMonth(value)
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onChange(date)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    onChange(undefined)
    setIsOpen(false)
  }

  const handleToday = () => {
    const today = new Date()
    setSelectedDate(today)
    onChange(today)
    setIsOpen(false)
  }

  // Calculate disabled dates
  const disabledMatcher = React.useMemo(() => {
    const matchers: any[] = []
    
    if (disablePast) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      matchers.push({ before: yesterday })
    }
    
    if (disableFuture) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      matchers.push({ after: tomorrow })
    }
    
    if (minDate) {
      matchers.push({ before: minDate })
    }
    
    if (maxDate) {
      matchers.push({ after: maxDate })
    }
    
    return matchers.length > 0 ? matchers : undefined
  }, [disablePast, disableFuture, minDate, maxDate])

  return (
    <div className="relative">
      <Button
        variant={"outline"}
        type="button"
        className={cn(
          "w-full justify-start text-left font-normal",
          !selectedDate && "text-gray-500",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? (
          format(selectedDate, "yyyy. MM. dd.", { locale: ko })
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent' }}
          />
          
          {/* Calendar Popover */}
          <div className="absolute left-0 z-[101] mt-2 rounded-md border bg-white shadow-lg w-[280px]">
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={disabledMatcher}
                initialFocus
              />
            </div>
            
            {/* Footer buttons */}
            <div className="flex justify-between border-t px-3 py-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                오늘
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

