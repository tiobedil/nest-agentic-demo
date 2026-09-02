import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { calendarComponents } from "./CalendarGridComponents"

export type ReservationExtensionCalendarProps = {
  reservationFrom: Date
  reservationTo: Date
  extensionFrom: Date
  extensionTo: Date
  defaultMonth?: Date
}

export function ReservationExtensionCalendar({
  reservationFrom,
  reservationTo,
  extensionFrom,
  extensionTo,
  defaultMonth,
}: ReservationExtensionCalendarProps) {
  const [month, setMonth] = useState<Date>(defaultMonth ?? reservationFrom)
  const [extensionRange, setExtensionRange] = useState<DateRange>({
    from: extensionFrom,
    to: extensionTo,
  })

  const reservationModifier = useMemo(() => {
    const days: Date[] = []
    const current = new Date(reservationFrom)
    current.setHours(0, 0, 0, 0)
    const end = new Date(reservationTo)
    end.setHours(23, 59, 59, 999)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [reservationFrom, reservationTo])

  const extensionModifier = useMemo(() => {
    const days: Date[] = []
    const current = new Date(extensionFrom)
    current.setHours(0, 0, 0, 0)
    const end = new Date(extensionTo)
    end.setHours(23, 59, 59, 999)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [extensionFrom, extensionTo])

  const disabledModifier = useMemo(() => {
    const days: Date[] = []
    const end = new Date(extensionFrom)
    end.setHours(0, 0, 0, 0)
    end.setDate(end.getDate() - 1)
    const start = new Date(extensionFrom)
    start.setFullYear(start.getFullYear() - 10)
    const current = new Date(start)
    while (current < end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [extensionFrom])

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return
    setExtensionRange(range)
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-300 bg-white p-4 font-sans text-sm text-slate-700">
      <span className="text-[13px] font-semibold text-foreground">Extension date</span>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[12px] leading-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-slate-200" />
            <span className="text-slate-500">Reservation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-violet-100" />
            <span className="text-slate-500">Extension</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="min-w-[120px] text-center text-[13px] font-semibold text-foreground"
            style={{ fontFamily: "var(--sans)", letterSpacing: "0.18px" }}
          >
            {format(month, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .rdp-root .rdp-day_button { width: 100% !important; }
        .rdp-root .rdp-range_start .rdp-day_button { border-radius: 4px 0 0 4px !important; }
        .rdp-root .rdp-range_end .rdp-day_button { border-radius: 0 4px 4px 0 !important; }
        .rdp-root .rdp-range_start.rdp-range_end .rdp-day_button { border-radius: 4px !important; }
        .rdp-root .rdp-selected .rdp-day_button { background-color: #a78bfa !important; color: white !important; }
        .rdp-root .rdp-extension .rdp-day_button { background-color: #ede9fe !important; color: #7c3aed !important; }
        .rdp-root .rdp-extension.rdp-selected .rdp-day_button { background-color: #a78bfa !important; color: white !important; }
        .rdp-root .rdp-weeks { row-gap: 6px !important; }
        .rdp-root .rdp-disabled .rdp-day_button:hover { background-color: #f1f5f9 !important; }
      `}</style>

      <Calendar
        mode="range"
        month={month}
        onMonthChange={setMonth}
        selected={extensionRange}
        onSelect={handleSelect}
        modifiers={{
          reservation: reservationModifier,
          extension: extensionModifier,
          disabledBeforeExtension: disabledModifier,
        }}
        modifiersClassNames={{
          reservation: "rdp-reservation",
          extension: "rdp-extension",
          disabledBeforeExtension: "rdp-disabled",
        }}
        modifiersStyles={{
          reservation: { backgroundColor: "#f1f5f9", color: "#64748b", fontWeight: 500 },
          extension: { backgroundColor: "#ede9fe", color: "#7c3aed", fontWeight: 500 },
        }}
        numberOfMonths={1}
        showOutsideDays={false}
        className="w-full"
        components={calendarComponents}
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full",
          months_dropdown: "hidden",
          years_dropdown: "hidden",
          weekdays: "flex w-full",
          weekday:
            "flex flex-1 flex-shrink-0 items-center justify-center text-center text-[11px] font-medium text-muted-foreground",
          week: "flex w-full",
          day: "flex flex-1 flex-shrink-0 items-center justify-center p-0",
          day_button:
            "h-9 w-full text-sm rounded-[min(var(--radius-md),12px)] hover:bg-violet-200 hover:text-violet-900 rdp-disabled:cursor-not-allowed rdp-outside:text-slate-300 rdp-today:font-bold rdp-today:text-violet-700",
        }}
        styles={{
          month_caption: { display: "none" },
          nav: { display: "none" },
          button_previous: { display: "none" },
          button_next: { display: "none" },
        }}
      />
    </div>
  )
}
