import assert from "node:assert/strict"
import test from "node:test"
import { detectUnifiedFlow } from "../src/lib/unified-flow.ts"

test("detects each trigger anywhere in a case-insensitive prompt", () => {
  assert.equal(detectUnifiedFlow("Please process Amar's EXTENSION request today."), "extension")
  assert.equal(detectUnifiedFlow("Help me organise an InSpEcTiOn for Lana Tower."), "inspection")
  assert.equal(detectUnifiedFlow(`${"A long request. ".repeat(1000)}extension${" More details.".repeat(1000)}`), "extension")
  assert.equal(detectUnifiedFlow("extensions"), "extension")
  assert.equal(detectUnifiedFlow("inspections"), "inspection")
})

test("selects whichever trigger appears first, not a fixed priority", () => {
  assert.equal(detectUnifiedFlow("EXTENSION then inspection then extension"), "extension")
  assert.equal(detectUnifiedFlow("Inspection followed by EXTENSION"), "inspection")
  assert.equal(detectUnifiedFlow("inspectionextension"), "inspection")
  assert.equal(detectUnifiedFlow("extensioninspection"), "extension")
  assert.equal(detectUnifiedFlow("First plan an\ninspection, then an extension."), "inspection")
})

test("does not start either flow without a complete trigger", () => {
  for (const prompt of ["", "  ", "Help me with Amar", "extend", "inspect", "extensio", "inspectio"]) {
    assert.equal(detectUnifiedFlow(prompt), null)
  }
})
