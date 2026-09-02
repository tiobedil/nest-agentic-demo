import { DayPicker } from "react-day-picker"
import type { DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  modifiersClassNames,
  modifiersStyles,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("font-sans", className)}
      classNames={{
        root: "rdp-root",
        months: "rdp-months flex flex-col sm:flex-row gap-4",
        month: "rdp-month flex flex-col gap-3",
        month_caption: "rdp-month_caption flex justify-center pt-1 px-1 pb-2",
        caption_label: "rdp-caption_label text-sm font-medium text-[color:var(--foreground)]",
        nav: "rdp-nav flex items-center gap-1 absolute right-1 top-1",
        button_previous: "rdp-button_previous",
        button_next: "rdp-button_next",
        month_grid: "rdp-month_grid border-collapse",
        weekdays: "rdp-weekdays",
        weekday: "rdp-weekday text-[12px] font-medium text-muted-foreground py-1 text-center",
        weeks: "rdp-weeks",
        week: "rdp-week flex flex-row",
        day: "rdp-day text-sm",
        day_button: "rdp-day_button h-9 w-9 text-sm rounded-[min(var(--radius-md),12px)]",
        range_start: "rdp-range_start",
        range_end: "rdp-range_end",
        range_middle: "rdp-range_middle",
        selected: "rdp-selected",
        today: "rdp-today font-bold",
        outside: "rdp-outside opacity-40",
        disabled: "rdp-disabled opacity-40",
        hidden: "rdp-hidden invisible",
        footer: "rdp-footer pt-3 flex justify-center",
        ...classNames,
      }}
      styles={{
        root: { width: "100%" },
        months: { width: "100%" },
        month: { width: "100%" },
        caption_label: { fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500, color: "var(--foreground)", letterSpacing: "0.18px" },
        weekdays: { paddingBottom: "4px" },
        weekday: { fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.18px" },
        day_button: { fontFamily: "var(--sans)", fontWeight: 500, transition: "background-color 0.15s, color 0.15s", width: "36px", height: "36px" },
        nav: { top: "2px", right: "4px" },
        button_previous: { padding: "4px", borderRadius: "8px", color: "var(--muted-foreground)" },
        button_next: { padding: "4px", borderRadius: "8px", color: "var(--muted-foreground)" },
        ...props.styles,
      }}
      modifiersClassNames={modifiersClassNames}
      modifiersStyles={modifiersStyles}
      {...props}
    />
  )
}

export { Calendar }
