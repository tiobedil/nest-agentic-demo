import * as React from "react"

import { cn } from "@/lib/utils"

function getInitials(name: string, max = 2) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const letters = parts.length > 1
    ? [parts[0][0], parts[parts.length - 1][0]]
    : [parts[0]?.[0] ?? ""]
  return letters
    .map(ch => ch.toUpperCase())
    .join("")
    .slice(0, max)
}

export type ReservationSummaryProps = React.ComponentProps<"div"> & {
  name: string
  email?: string
  phone?: string
  reservationId: string
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
  property: string
  guests?: number | string
  showTitle?: boolean
  title?: string
}

export type SelectableReservationCardProps = Omit<React.ComponentProps<"button">, "children"> & {
  name: string
  reservationId: string
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
  property: string
  guests?: number | string
  selected?: boolean
  onSelect?: () => void
}

export function SelectableReservationCard({
  className,
  name,
  reservationId,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
  property,
  guests = 2,
  selected = false,
  onSelect,
  ...props
}: SelectableReservationCardProps) {
  const initials = getInitials(name)
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-slot="selectable-reservation-card"
      data-selected={selected}
      className={cn(
        "relative flex w-[300px] shrink-0 snap-start flex-col gap-4 rounded-xl border bg-white p-4 text-left font-sans text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        selected ? "border-violet-600 bg-violet-50/40 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30",
        "border",
        className
      )}
      {...props}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center text-violet-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </span>
      )}
      <div className="flex w-full items-start gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-400 text-[18px] font-medium leading-7 text-white" aria-hidden>
            {initials}
          </div>
          <div className="flex min-w-0 flex-col gap-[2px] pr-6">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold leading-5 text-slate-700">{name}</p>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium leading-4 text-slate-500">{reservationId}</p>
          </div>
        </div>
      </div>

      <div className={cn("flex w-full flex-row gap-2 rounded-lg p-2 text-[14px] leading-5", selected ? "bg-violet-100/70" : "bg-slate-50")}>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="w-full text-[12px] font-normal leading-4 text-slate-500">Guest</p>
          <p className="w-full text-[14px] font-medium leading-5 text-slate-700">{guests}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="w-full text-[12px] font-normal leading-4 text-slate-500">Property</p>
          <p className="w-full truncate text-[14px] font-medium leading-5 text-slate-700">{property}</p>
        </div>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="flex w-full items-start gap-4 font-medium leading-5">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="whitespace-nowrap text-[12px] leading-4 text-slate-500">Check-In</p>
          <p className="text-[13px] leading-5 text-slate-700">{checkInDate}, {checkInTime}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="whitespace-nowrap text-[12px] leading-4 text-slate-500">Check-Out</p>
          <p className="text-[13px] leading-5 text-slate-700">{checkOutDate}, {checkOutTime}</p>
        </div>
      </div>
    </button>
  )
}

export function ReservationSummary({
  className,
  name,
  email,
  phone,
  reservationId,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
  property,
  guests = 2,
  showTitle = false,
  title = "Reservation 1",
  ...props
}: ReservationSummaryProps) {
  const initials = getInitials(name)

  return (
    <div
      data-slot="reservation-summary"
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl border border-slate-300 bg-white p-4 font-sans text-sm text-slate-700",
        className
      )}
      {...props}
    >
      {showTitle && (
        <p className="text-[14px] font-semibold leading-5 text-slate-700">
          {title}
        </p>
      )}

      <div className="flex w-full items-start gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-400 text-[18px] font-medium leading-7 text-white"
            aria-hidden
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-col gap-[2px]">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold leading-5 text-slate-700">
              {name}
            </p>
            {email && (
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium leading-4 text-slate-500">
                {email}
              </p>
            )}
            {phone && (
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium leading-4 text-slate-500">
                {phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_0_0] flex-row gap-4 rounded-lg bg-slate-50 p-2 text-[14px] leading-5">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <p className="w-full text-[12px] font-normal leading-4 text-slate-500">
              Guest
            </p>
            <p className="w-full text-[14px] font-medium leading-5 text-slate-700">
              {guests}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <p className="w-full text-[12px] font-normal leading-4 text-slate-500">
              Reservation ID
            </p>
            <p className="w-full text-[14px] font-medium leading-5 text-slate-700">
              {reservationId}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-300" />

      <div className="flex w-full items-start gap-4 font-medium leading-5">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="whitespace-nowrap text-[12px] leading-4 text-slate-500">
            Check-In Date
          </p>
          <div className="flex min-w-full w-min flex-col text-[14px] leading-5 text-slate-700">
            <p className="leading-5">{checkInDate},</p>
            <p className="leading-5">{checkInTime}</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="whitespace-nowrap text-[12px] leading-4 text-slate-500">
            Check-Out Date
          </p>
          <div className="flex min-w-full w-min flex-col text-[14px] leading-5 text-slate-700">
            <p className="leading-5">{checkOutDate},</p>
            <p className="leading-5">{checkOutTime}</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="whitespace-nowrap text-[12px] leading-4 text-slate-500">
            Property
          </p>
          <p className="w-full text-[14px] leading-5 text-slate-700">{property}</p>
        </div>
      </div>
    </div>
  )
}