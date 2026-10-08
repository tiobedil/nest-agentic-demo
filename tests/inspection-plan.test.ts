import assert from "node:assert/strict"
import test from "node:test"
import { buildingSchedule, routeFor } from "../src/lib/inspection-plan.ts"
import type { RouteState } from "../src/lib/inspection-plan.ts"

test("the three route states match the scenario exactly", () => {
  assert.deepEqual(routeFor.original.map(stop => stop.unit), ["602", "603", "605", "604", "202", "203", "204", "205"])
  assert.deepEqual(routeFor.exception.map(stop => stop.unit), ["602", "603", "205", "604", "202", "203", "204", "605"])
  assert.deepEqual(routeFor.optimised.map(stop => stop.unit), ["202", "203", "204", "205", "602", "603", "604", "605"])
  assert.deepEqual(routeFor.original.map(stop => stop.floor), [6, 6, 6, 6, 2, 2, 2, 2])
  assert.deepEqual(routeFor.exception.map(stop => stop.floor), [6, 6, 2, 6, 2, 2, 2, 6])
  assert.deepEqual(routeFor.optimised.map(stop => stop.floor), [2, 2, 2, 2, 6, 6, 6, 6])
})

test("approving Amar changes only his visit and Unit 205", () => {
  const moved = routeFor.original.filter(stop => routeFor.exception.find(next => next.unit === stop.unit)?.time !== stop.time)
  assert.deepEqual(moved.map(stop => stop.unit), ["605", "205"])
  assert.equal(routeFor.exception.find(stop => stop.unit === "205")?.time, "4:30 PM")
})

test("Amar stays pinned at 5:45 PM during optimisation", () => {
  for (const state of ["exception", "optimised"] as const) {
    assert.deepEqual(routeFor[state].find(stop => stop.amar), { unit: "605", floor: 6, time: "5:45 PM", amar: true })
  }
  assert.equal(routeFor.original.find(stop => stop.amar)?.time, "4:30 PM")
})

test("all schedule states cover exactly 116 unique apartments across six conflict-free routes", () => {
  for (const state of Object.keys(routeFor) as RouteState[]) {
    const routes = buildingSchedule(state)
    assert.equal(routes.length, 6)
    const stops = routes.flatMap(route => route.stops)
    assert.equal(stops.length, 116)
    assert.equal(new Set(stops.map(stop => stop.unit)).size, 116)
    for (const route of routes) assert.equal(new Set(route.stops.map(stop => stop.time)).size, route.stops.length)
    assert.deepEqual(routes[3].stops.slice(-8), routeFor[state])
    assert.equal(stops.filter(stop => stop.unit === "605").length, 1)
  }
})
