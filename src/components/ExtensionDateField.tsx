import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function DayPickerChevron({
  orientation,
}: {
  orientation?: "left" | "right" | "up" | "down"
  size?: number
  disabled?: boolean
}) {
  if (orientation === "left") return <ChevronLeft size={16} className="text-slate-400" />
  if (orientation === "right") return <ChevronRight size={16} className="text-slate-400" />
  return <ChevronDown size={16} className="text-slate-400" />
}

export type ExtensionDateFieldProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  className?: string
}

export function ExtensionDateField({
  value,
  onChange,
  label = "Extension date",
  placeholder = "Select date",
  disabled,
  minDate,
  className,
}: ExtensionDateFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(() => value ?? minDate ?? new Date())
  React.useEffect(() => {
    if (value) setMonth(value)
    else if (minDate) setMonth(minDate)
  }, [value, minDate])

  const prevDisabled = React.useMemo(() => {
    if (disabled) return true
    if (!minDate) return false
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const minMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    return monthStart <= minMonthStart
  }, [month, minDate, disabled])

  return (
    <div className={cn("flex w-full flex-col gap-2 font-sans", className)}>
      <p className="text-sm font-medium leading-5 text-slate-700">{label}</p>
      <Popover open={open} onOpenChange={v => { if (!disabled) setOpen(v) }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-xl bg-slate-50 pb-[8px] pl-[8px] pr-[16px] pt-[8px] text-left text-base text-[16px] font-normal text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50",
              disabled && "hover:bg-slate-50"
            )}
          >
            <span className="flex items-center gap-3 text-base text-[16px] font-normal text-slate-500">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-base text-[16px] font-normal text-slate-500 shadow-sm">
                <CalendarIcon size={16} />
              </span>
              <span className="text-base text-[16px] font-normal leading-5 text-slate-500">
                {value ? format(value, "PPP") : placeholder}
              </span>
            </span>
            <ChevronDown size={16} className={cn("shrink-0 text-slate-500 transition-transform", open && !disabled && "rotate-180", disabled && "opacity-40")} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[308px] p-4" align="start" sideOffset={8}>
          <div className="flex h-8 w-full items-center justify-between">
            <button
              type="button"
              disabled={prevDisabled}
              onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              )}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} className="text-slate-400" />
            </button>
            <span className="text-sm font-medium leading-none text-slate-700">{format(month, "MMMM yyyy")}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
              )}
              aria-label="Next month"
            >
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={value}
            disabled={minDate ? { before: minDate } : undefined}
            onSelect={d => {
              onChange?.(d)
              if (d) setOpen(false)
            }}
            components={{ Chevron: DayPickerChevron }}
            classNames={{
              root: "rdp-root w-full",
              months: "rdp-months flex w-full flex-col",
              month: "rdp-month flex w-full flex-col gap-3",
              month_caption: "rdp-month_caption hidden",
              caption_label: "hidden",
              nav: "rdp-nav hidden",
              button_previous: "hidden",
              button_next: "hidden",
              month_grid: "rdp-month_grid w-full border-collapse",
              weekdays: "rdp-weekdays flex w-full",
              weekday: "rdp-weekday flex-1 py-1.5 text-center text-xs font-medium text-slate-500",
              weeks: "rdp-weeks flex w-full flex-col gap-1",
              week: "rdp-week flex w-full",
              day: "rdp-day flex flex-1 items-center justify-center p-0 text-sm",
              day_button: "rdp-day_button size-8 rounded-lg text-sm font-normal text-slate-700 hover:bg-slate-100",
              selected: "rdp-selected",
              today: "rdp-today font-semibold",
              outside: "rdp-outside opacity-40",
              disabled: "rdp-disabled opacity-40",
              hidden: "rdp-hidden invisible",
            }}
            styles={{
              root: { width: "100%" },
              months: { width: "100%" },
              month: { width: "100%" },
              month_caption: { display: "none" },
              nav: { display: "none" },
              caption_label: { display: "none" },
              button_previous: { display: "none" },
              button_next: { display: "none" },
              weekday: { fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 500, color: "rgb(100 116 139)" },
              day_button: { fontFamily: "var(--sans)", fontWeight: 400, width: "32px", height: "32px" },
            }}
            modifiersClassNames={{
              selected: "rdp-selected",
            }}
            modifiersStyles={{
              selected: { backgroundColor: "transparent" },
            }}
          />
          <style>{`
            .rdp-root .rdp-day:not(.rdp-disabled):not(.rdp-selected) .rdp-day_button:hover { background: #f1f5f9 !important; }
            .rdp-root .rdp-selected .rdp-day_button { background: #ddd6fe !important; color: #8b5cf6 !important; }
            .rdp-root .rdp-selected .rdp-day_button:hover { background: #ddd6fe !important; color: #8b5cf6 !important; }
          `}</style>
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => {
                onChange?.(undefined)
                setOpen(false)
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <p className="text-xs leading-4 text-slate-500">Choose the new check-out date for the extension</p>
    </div>
  )
}
