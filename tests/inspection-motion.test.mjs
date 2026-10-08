import assert from "node:assert/strict"
import { test } from "node:test"
import { parseCssDuration } from "../src/lib/inspection-motion.ts"

test("preserves route duration when production CSS converts milliseconds to seconds", () => {
  assert.equal(parseCssDuration("1200ms"), 1200)
  assert.equal(parseCssDuration("1.2s"), 1200)
  assert.equal(parseCssDuration(" 1.2s "), 1200)
  assert.equal(parseCssDuration(".5s"), 500)
})

test("handles zero and invalid durations without starting motion", () => {
  assert.equal(parseCssDuration("0ms"), 0)
  assert.equal(parseCssDuration("0s"), 0)
  assert.equal(parseCssDuration(""), 0)
  assert.equal(parseCssDuration("1200"), 0)
  assert.equal(parseCssDuration("-1s"), 0)
})
