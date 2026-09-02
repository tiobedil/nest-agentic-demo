import type { CalendarWeek } from "react-day-picker"
import type { HTMLAttributes, ReactNode } from "react"

function Weekday({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      {...props}
      role="columnheader"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 0,
        textAlign: "center",
        ...props.style,
      }}
    >
      {children}
    </div>
  )
}

function Weekdays({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      {...props}
      role="rowgroup"
      style={{
        display: "flex",
        width: "100%",
        paddingBottom: "12px",
        ...props.style,
      }}
    >
      {children}
    </div>
  )
}

function Day({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      {...props}
      role="gridcell"
      style={{
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...props.style,
      }}
    >
      {children}
    </div>
  )
}

function Week({
  children,
  ...props
}: { week: CalendarWeek } & HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
  }) {
  return (
    <div
      {...props}
      style={{ display: "flex", width: "100%", ...props.style }}
    >
      {children}
    </div>
  )
}

function Weeks({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexDirection: "column", width: "100%", gap: "6px", ...props.style }}
    >
      {children}
    </div>
  )
}

function MonthGrid({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexDirection: "column", width: "100%", ...props.style }}
    >
      {children}
    </div>
  )
}

export const calendarComponents = {
  MonthGrid,
  Weeks,
  Week,
  Day,
  Weekday,
  Weekdays,
}
