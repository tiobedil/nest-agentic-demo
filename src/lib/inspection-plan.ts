export type RouteState = "original" | "exception" | "optimised"
export type RouteStop = { unit: string; floor: 2 | 6; time: string; amar?: boolean }

const originalStops: RouteStop[] = [
  { time: "4:00 PM", unit: "602", floor: 6 }, { time: "4:15 PM", unit: "603", floor: 6 },
  { time: "4:30 PM", unit: "605", floor: 6, amar: true }, { time: "4:45 PM", unit: "604", floor: 6 },
  { time: "5:00 PM", unit: "202", floor: 2 }, { time: "5:15 PM", unit: "203", floor: 2 },
  { time: "5:30 PM", unit: "204", floor: 2 }, { time: "5:45 PM", unit: "205", floor: 2 },
]
const exceptionStops: RouteStop[] = [
  { time: "4:00 PM", unit: "602", floor: 6 }, { time: "4:15 PM", unit: "603", floor: 6 },
  { time: "4:30 PM", unit: "205", floor: 2 }, { time: "4:45 PM", unit: "604", floor: 6 },
  { time: "5:00 PM", unit: "202", floor: 2 }, { time: "5:15 PM", unit: "203", floor: 2 },
  { time: "5:30 PM", unit: "204", floor: 2 }, { time: "5:45 PM", unit: "605", floor: 6, amar: true },
]
const optimisedStops: RouteStop[] = [
  { time: "4:00 PM", unit: "202", floor: 2 }, { time: "4:15 PM", unit: "203", floor: 2 },
  { time: "4:30 PM", unit: "204", floor: 2 }, { time: "4:45 PM", unit: "205", floor: 2 },
  { time: "5:00 PM", unit: "602", floor: 6 }, { time: "5:15 PM", unit: "603", floor: 6 },
  { time: "5:30 PM", unit: "604", floor: 6 }, { time: "5:45 PM", unit: "605", floor: 6, amar: true },
]
export const routeFor: Record<RouteState, RouteStop[]> = { original: originalStops, exception: exceptionStops, optimised: optimisedStops }

export const instruction = "Schedule the annual in-unit fire-safety inspections for all apartments in Lana Tower next Tuesday."

export function buildingSchedule(state: RouteState) {
  const routeUnits = new Set(routeFor.original.map(stop => stop.unit))
  const remaining = Array.from({ length: 116 }, (_, index) => {
    const floor = Math.floor(index / 20) + 1
    return { unit: String(floor * 100 + index % 20 + 1), floor }
  }).filter(stop => !routeUnits.has(stop.unit))
  let cursor = 0
  return [20, 20, 20, 20, 18, 18].map((count, index) => {
    const earlyCount = index === 3 ? count - 8 : count
    const stops = remaining.slice(cursor, cursor + earlyCount).map((stop, slot) => {
      const minutes = 9 * 60 + slot * 15
      const hour = Math.floor(minutes / 60)
      return { ...stop, time: `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}` }
    })
    cursor += earlyCount
    return { technician: index + 1, stops: index === 3 ? [...stops, ...routeFor[state]] : stops }
  })
}
