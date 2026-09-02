import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, differenceInCalendarDays } from "date-fns"
import { calendarComponents } from "./CalendarGridComponents"

export type ReservationExtensionCalendarProps = {
  reservationFrom: Date
  reservationTo: Date
  extensionFrom: Date
  extensionTo: Date
  defaultMonth?: Date
  onSubmit?: (range: DateRange) => void
}

function stripTime(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function enumerate(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const cur = stripTime(from)
  const end = stripTime(to)
  while (cur <= end) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export function ReservationExtensionCalendar({
  reservationFrom,
  reservationTo,
  extensionFrom,
  extensionTo,
  defaultMonth,
  onSubmit,
}: ReservationExtensionCalendarProps) {
  const [month, setMonth] = useState<Date>(defaultMonth ?? reservationFrom)
  const [extensionRange, setExtensionRange] = useState<DateRange>({
    from: extensionFrom,
    to: extensionTo,
  })

  const reservationDays = useMemo(() => enumerate(reservationFrom, reservationTo), [reservationFrom, reservationTo])
  const reservationStart = useMemo(() => [stripTime(reservationFrom)], [reservationFrom])
  const reservationEnd = useMemo(() => [stripTime(reservationTo)], [reservationTo])
  const reservationMiddle = useMemo(() => {
    const all = enumerate(reservationFrom, reservationTo)
    return all.slice(1, -1)
  }, [reservationFrom, reservationTo])

  const extensionDays = useMemo(() => {
    if (!extensionRange.from) return []
    const to = extensionRange.to ?? extensionRange.from
    return enumerate(extensionRange.from, to)
  }, [extensionRange])

  const extensionStart = useMemo(() => (extensionRange.from ? [stripTime(extensionRange.from)] : []), [extensionRange.from])
  const extensionEnd = useMemo(() => {
    const to = extensionRange.to ?? extensionRange.from
    return to ? [stripTime(to)] : []
  }, [extensionRange])
  const extensionMiddle = useMemo(() => {
    if (!extensionRange.from) return []
    const to = extensionRange.to ?? extensionRange.from
    if (!to) return []
    const all = enumerate(extensionRange.from, to)
    if (all.length <= 2) return []
    return all.slice(1, -1)
  }, [extensionRange])

  const disabledDays = useMemo(() => {
    const days: Date[] = []
    const end = stripTime(reservationFrom)
    end.setDate(end.getDate() - 1)
    const start = new Date(reservationFrom)
    start.setFullYear(start.getFullYear() - 10)
    const cur = stripTime(start)
    while (cur <= end) {
      days.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    return days
  }, [reservationFrom])

  const selectedCount = useMemo(() => {
    if (!extensionRange.from) return 0
    const to = extensionRange.to ?? extensionRange.from
    return differenceInCalendarDays(stripTime(to), stripTime(extensionRange.from)) + 1
  }, [extensionRange])

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return
    setExtensionRange(range)
  }

  const canGoPrev = useMemo(() => {
    const prev = new Date(month.getFullYear(), month.getMonth() - 1, 1)
    const start = stripTime(reservationFrom)
    start.setDate(1)
    return prev >= start
  }, [month, reservationFrom])

  return (
    <div className="flex w-full flex-col gap-3 rounded-[15.75px] border border-[#CAD5E2] bg-white p-4 font-sans antialiased [font-synthesis:none]">
      <div className="text-sm font-semibold leading-[142.857%] text-[#09090B]">Extension date</div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-[6.75px]">
            <span className="size-2 shrink-0 rounded-[6.75px] bg-slate-400" />
            <span className="text-xs leading-[18px] text-[#62748E]">Reservation</span>
          </div>
          <div className="flex items-center gap-[6.75px]">
            <span className="size-2 shrink-0 rounded-[6.75px] bg-[var(--color-primary)]" />
            <span className="text-xs leading-[18px] text-[#62748E]">Extension</span>
          </div>
        </div>

        <div className="flex items-center gap-[4.5px]">
          <button
            type="button"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            disabled={!canGoPrev}
            className="flex size-9 shrink-0 items-center justify-center rounded-[11.25px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[120px] text-center text-sm font-medium leading-none text-[#09090B]"> {format(month, "MMMM yyyy")} </span>
          <button
            type="button"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="flex size-9 shrink-0 items-center justify-center rounded-[11.25px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .rdp-root .rdp-day_button { width: 100% !important; height: 40.5px !important; border-radius: 8px !important; font-size: 16px !important; line-height: 100% !important; font-weight: 400 !important; color: #314158 !important; background: transparent !important; }
        .rdp-root .rdp-day { padding: 0 !important; }
        /* hover – only unselected dates (Paper: hover state tanggal 16-30 = slate-100) */
        .rdp-root .rdp-day:not(.rdp-disabled):not(.rdp-reservation):not(.rdp-extension) .rdp-day_button:hover { background: #F1F5F9 !important; background: var(--color-slate-100) !important; color: #314158 !important; }
        /* reservation bar – #F1F5F9 distinctive selected state */
        .rdp-root .rdp-reservation { background: #F1F5F9 !important; }
        .rdp-root .rdp-reservation .rdp-day_button { color: #64748B !important; font-weight: 500 !important; background: transparent !important; }
        .rdp-root .rdp-reservation_start { border-radius: 8px 0 0 8px !important; }
        .rdp-root .rdp-reservation_end { border-radius: 0 8px 8px 0 !important; }
        .rdp-root .rdp-reservation_start.rdp-reservation_end { border-radius: 8px !important; }
        .rdp-root .rdp-reservation_middle { border-radius: 0 !important; }
        .rdp-root .rdp-reservation .rdp-day_button:hover,
        .rdp-root .rdp-reservation.rdp-disabled .rdp-day_button:hover { background: transparent !important; color: #64748B !important; }
        /* extension bar – #EDE9FE distinctive selected state (reflects extension duration) */
        .rdp-root .rdp-extension { background: #EDE9FE !important; }
        .rdp-root .rdp-extension .rdp-day_button { color: #7C3AED !important; font-weight: 500 !important; background: transparent !important; }
        .rdp-root .rdp-extension_start { border-radius: 8px 0 0 8px !important; }
        .rdp-root .rdp-extension_end { border-radius: 0 8px 8px 0 !important; }
        .rdp-root .rdp-extension_start.rdp-extension_end { border-radius: 8px !important; }
        .rdp-root .rdp-extension_middle { border-radius: 0 !important; }
        .rdp-root .rdp-extension .rdp-day_button:hover,
        .rdp-root .rdp-extension.rdp-disabled .rdp-day_button:hover { background: transparent !important; color: #7C3AED !important; }
        /* disabled – no hover state (Paper: tanggal disabled tidak ada hover) */
        .rdp-root .rdp-disabled .rdp-day_button { opacity: 1 !important; color: #CAD5E2 !important; color: rgb(202 213 226) !important; cursor: not-allowed !important; }
        .rdp-root .rdp-disabled .rdp-day_button:hover { background: transparent !important; color: rgb(202 213 226) !important; }
        /* selected dates – no hover state (Paper: tanggal yang sudah selected tidak ada hover) */
        .rdp-root .rdp-selected .rdp-day_button:hover { background: transparent !important; }
        .rdp-root .rdp-outside { opacity: 1 !important; }
        .rdp-root .rdp-outside .rdp-day_button { color: #CAD5E2 !important; }
        /* selected range overrides – keep custom reservation/extension colors, not default violet */
        .rdp-root .rdp-selected .rdp-day_button { background: transparent !important; }
        .rdp-root .rdp-range_start .rdp-day_button,
        .rdp-root .rdp-range_end .rdp-day_button,
        .rdp-root .rdp-range_middle .rdp-day_button { background: transparent !important; }
        /* today */
        .rdp-root .rdp-today .rdp-day_button { font-weight: 700 !important; color: #7C3AED !important; }
        .rdp-root .rdp-today.rdp-reservation .rdp-day_button,
        .rdp-root .rdp-today.rdp-extension .rdp-day_button { font-weight: 700 !important; }
      `}</style>

      <Calendar
        mode="range"
        month={month}
        onMonthChange={setMonth}
        selected={extensionRange}
        onSelect={handleSelect}
        disabled={disabledDays}
        modifiers={{
          reservation: reservationDays,
          reservation_start: reservationStart,
          reservation_end: reservationEnd,
          reservation_middle: reservationMiddle,
          extension: extensionDays,
          extension_start: extensionStart,
          extension_end: extensionEnd,
          extension_middle: extensionMiddle,
        }}
        modifiersClassNames={{
          reservation: "rdp-reservation",
          reservation_start: "rdp-reservation_start",
          reservation_end: "rdp-reservation_end",
          reservation_middle: "rdp-reservation_middle",
          extension: "rdp-extension",
          extension_start: "rdp-extension_start",
          extension_end: "rdp-extension_end",
          extension_middle: "rdp-extension_middle",
        }}
        modifiersStyles={{
          reservation: { backgroundColor: "#F1F5F9" },
          reservation_start: { backgroundColor: "#F1F5F9" },
          reservation_end: { backgroundColor: "#F1F5F9" },
          reservation_middle: { backgroundColor: "#F1F5F9" },
          extension: { backgroundColor: "#EDE9FE" },
          extension_start: { backgroundColor: "#EDE9FE" },
          extension_end: { backgroundColor: "#EDE9FE" },
          extension_middle: { backgroundColor: "#EDE9FE" },
        }}
        numberOfMonths={1}
        showOutsideDays={false}
        className="w-full"
        components={calendarComponents}
        classNames={{
          root: "rdp-root w-full",
          months: "rdp-months w-full",
          month: "rdp-month w-full",
          weekdays: "rdp-weekdays flex w-full pb-3",
          weekday: "rdp-weekday flex flex-1 shrink-0 items-center justify-center text-center text-xs font-medium leading-[142.857%] text-[#71717B]",
          week: "rdp-week flex w-full",
          weeks: "rdp-weeks flex w-full flex-col gap-1.5",
          day: "rdp-day flex flex-1 shrink-0 items-center justify-center p-0",
          day_button: "rdp-day_button h-[40.5px] w-full text-base rounded-lg",
        }}
        styles={{
          month_caption: { display: "none" },
          nav: { display: "none" },
          button_previous: { display: "none" },
          button_next: { display: "none" },
        }}
      />

      <div className="flex items-center justify-end gap-4 self-stretch pt-1">
        <div className="flex items-start gap-1">
          <span className="text-sm font-semibold leading-none text-[var(--color-primary)]">{selectedCount}</span>
          <span className="text-sm leading-none text-slate-500">extension day(s) selected</span>
        </div>
        <button
          type="button"
          onClick={() => onSubmit?.(extensionRange)}
          className="flex h-9 w-[170px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#8E51FF] px-3.5 text-sm font-semibold leading-none text-white outline outline-1 -outline-offset-1 outline-[#7F22FE] transition-colors hover:bg-[#7F22FE]"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
