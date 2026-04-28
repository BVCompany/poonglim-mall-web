import * as React from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react"
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
          const cls = "h-4 w-4 shrink-0"
          switch (props.orientation) {
            case "left":
              return <ChevronLeft className={cls} />
            case "right":
              return <ChevronRight className={cls} />
            case "down":
              return <ChevronDown className={cls} />
            case "up":
              return <ChevronUp className={cls} />
            default:
              return <ChevronRight className={cls} />
          }
        },
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

