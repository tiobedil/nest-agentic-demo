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