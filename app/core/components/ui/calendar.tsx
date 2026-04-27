import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { ko } from "date-fns/locale"
import "react-day-picker/style.css"
import "~/styles/calendar.css"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={classNames}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

