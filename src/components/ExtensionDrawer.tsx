import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Plus, X, Calendar, ChevronDown, Check, CreditCard, Bitcoin, Landmark, Settings2 } from "lucide-react"
import { ReservationSummary } from "@/components/ReservationSummary"
import { format, differenceInCalendarDays } from "date-fns"

type ExtensionDrawerProps = {
  open: boolean
  onClose: () => void
  reservationFrom: Date
  reservationTo: Date
  extensionFrom: Date
  extensionTo: Date
  onConfirm?: () => void
}

function Switch({ active, onToggle }: { active: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!active)}
      className={`relative h-[14px] w-[37px] shrink-0 rounded-full p-0 transition-colors ${active ? "bg-[#8e51ff]" : "bg-[#cad5e2]"}`}
      aria-pressed={active}
    >
      <span
        className={`absolute top-1/2 size-[20px] -translate-y-1/2 rounded-full bg-white shadow-sm transition-all ${active ? "right-0 translate-x-[-2px]" : "left-0 translate-x-[2px]"}`}
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
      />
    </button>
  )
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? "border-[#7f22fe] bg-white" : "border-[#cad5e2] bg-white"}`}
    >
      {active && <span className="size-3 rounded-full bg-[#7f22fe]" />}
    </span>
  )
}

export function ExtensionDrawer({ open, onClose, reservationFrom, reservationTo, extensionFrom, extensionTo, onConfirm }: ExtensionDrawerProps) {
  const [rate, setRate] = useState<"new" | "original">("new")
  const [discount, setDiscount] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      const t = setTimeout(() => { document.body.style.overflow = "" }, 300)
      return () => clearTimeout(t)
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!mounted) return null

  const nights = (() => {
    if (!extensionFrom || !extensionTo) return 0
    return differenceInCalendarDays(extensionTo, extensionFrom) + 1
  })()

  const newRate = 160
  const originalRate = 125
  const selectedRate = rate === "new" ? newRate : originalRate
  const rent = nights * selectedRate
  const bookingFee = 50
  const serviceFee = 5
  const tourismFee = 10
  const subTotal = rent + bookingFee + serviceFee + tourismFee
  const vat = Math.round(subTotal * 0.05 * 100) / 100
  const total = Math.round((subTotal + vat) * 100) / 100

  const checkoutLabel = extensionTo ? format(extensionTo, "MM/dd/yyyy") : ""

  return createPortal(
    <div className={`fixed inset-0 z-50 font-sans antialiased [font-synthesis:none] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity duration-300 ${open ? "ease-out opacity-100" : "ease-in opacity-0"}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-[650px] max-w-[92vw] flex-col bg-white shadow-xl transition-transform duration-300 will-change-transform ${open ? "ease-out translate-x-0" : "ease-in translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Create Extension"
      >
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#cad5e2] bg-white p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Plus className="size-5 shrink-0 text-[#314158]" />
            <span className="truncate text-[20px] font-semibold leading-7 text-[#314158]">Create Extension</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="flex size-6 shrink-0 items-center justify-center rounded text-[#314158] transition-colors hover:bg-slate-100"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
          <ReservationSummary
            name="Amar Sundaram"
            email="amar.sundaram@example.com"
            phone="+226-795-552-31"
            reservationId="D-15202023"
            checkInDate={format(reservationFrom, "MMMM do, yyyy")}
            checkInTime="12:00 PM"
            checkOutDate={format(reservationTo, "MMMM do, yyyy")}
            checkOutTime="14:00 PM"
            property="DXB-LANA-SA-101"
            guests={2}
            className="rounded-xl border-[#cad5e2]"
          />

          <div className="h-px w-full shrink-0 bg-[#cad5e2]" />

          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center pb-1.5">
              <span className="flex items-center gap-0.5 text-sm font-normal leading-5 text-[#314158]">
                New Check-out Date <span className="text-[#fb2c36]">*</span>
              </span>
            </div>
            <div className="flex h-10 w-full items-center justify-between rounded-lg border border-[#90a1b9] bg-white px-2">
              <span className="flex-1 px-1 py-0.5 text-sm font-normal leading-5 text-[#314158]">{checkoutLabel}</span>
              <span className="flex items-center rounded p-1">
                <Calendar className="size-4 text-[#314158]" />
              </span>
            </div>
          </div>

          <div className="h-px w-full shrink-0 bg-[#cad5e2]" />

          <div className="flex w-full flex-col gap-4">
            <button
              type="button"
              onClick={() => setRate("new")}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${rate === "new" ? "border-[#7f22fe] bg-[#f5f3ff]" : "border-[#cad5e2] bg-[#f8fafc]"}`}
            >
              <Radio active={rate === "new"} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-base font-medium leading-6 text-[#314158]">Apply New Rates</span>
                <span className="text-sm font-normal leading-5 text-[#62748e]">Uses the current calendar rates for the extension nights</span>
                <span className="text-sm font-normal leading-5 text-[#62748e]">{nights} nights × AED {newRate.toFixed(2)}</span>
              </div>
              <span className="shrink-0 text-base font-semibold leading-6 text-[#314158]">AED {(nights * newRate).toFixed(2)}</span>
            </button>

            <button
              type="button"
              onClick={() => setRate("original")}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${rate === "original" ? "border-[#7f22fe] bg-[#f5f3ff]" : "border-[#cad5e2] bg-[#f8fafc]"}`}
            >
              <Radio active={rate === "original"} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-base font-medium leading-6 text-[#314158]">Keep Original Rate</span>
                <span className="text-sm font-normal leading-5 text-[#62748e]">Extend stay at the same nightly rate as the original reservation</span>
                <span className="text-sm font-normal leading-5 text-[#62748e]">{nights} nights × AED {originalRate.toFixed(2)}</span>
              </div>
              <span className="shrink-0 text-base font-semibold leading-6 text-[#314158]">AED {(nights * originalRate).toFixed(2)}</span>
            </button>
          </div>

          <div className="flex w-full flex-col overflow-clip rounded-xl border border-[#cad5e2] bg-white">
            <div className="flex h-[52px] items-center rounded-xl border border-[#cad5e2] bg-[#f8fafc] px-4 py-1.5">
              <span className="text-base font-semibold leading-6 text-[#314158]">Payment Breakdown</span>
            </div>

            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-4 rounded-xl border border-[#cad5e2] bg-[#f8fafc] p-4">
                <div className="flex h-5 items-center justify-between">
                  <span className="text-sm font-normal leading-5 text-[#62748e]">Apply Discount</span>
                  <Switch active={discount} onToggle={setDiscount} />
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-[#cad5e2] bg-[#f8fafc] p-2">
                <div className="flex h-10 items-center px-2">
                  <span className="text-sm font-semibold leading-5 text-[#314158]">Reservation Invoice</span>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-[#cad5e2] bg-white px-2 py-3">
                  <div className="flex h-5 items-center justify-between text-sm">
                    <span className="font-normal leading-5 text-[#62748e]">Rent ({nights} nights × AED {selectedRate.toFixed(2)})</span>
                    <span className="flex items-center gap-1 font-medium leading-5 text-[#314158]">AED {rent.toFixed(2)}</span>
                  </div>
                  <div className="flex h-5 items-center justify-between text-sm">
                    <span className="font-normal leading-5 text-[#62748e]">Booking fee</span>
                    <span className="flex items-center gap-1 font-medium leading-5 text-[#314158]">AED {bookingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex h-5 items-center justify-between text-sm">
                    <span className="font-normal leading-5 text-[#62748e]">Service fee</span>
                    <span className="flex items-center gap-1 font-medium leading-5 text-[#314158]">AED {serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex h-5 items-center justify-between text-sm">
                    <span className="font-normal leading-5 text-[#62748e]">Tourism fee</span>
                    <span className="flex items-center gap-1 font-medium leading-5 text-[#314158]">AED {tourismFee.toFixed(2)}</span>
                  </div>

                  <div className="h-px w-full bg-[#cad5e2]" />

                  <div className="flex h-5 items-center justify-between text-sm">
                    <span className="font-normal leading-5 text-[#62748e]">Sub Total</span>
                    <span className="flex items-center gap-1 font-medium leading-5 text-[#314158]">AED {subTotal.toFixed(2)}</span>
                  </div>

                  <div className="h-px w-full bg-[#cad5e2]" />

                  <div className="flex h-5 items-center justify-between text-sm">
                    <span className="font-normal leading-5 text-[#62748e]">VAT (5%)</span>
                    <span className="flex items-center gap-1 font-medium leading-5 text-[#314158]">AED {vat.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex h-9 items-center rounded-lg bg-[#ede9fe] px-2">
                  <div className="flex w-full items-center justify-between text-sm font-semibold leading-5 text-[#4d179a]">
                    <span>Total Payment Due</span>
                    <span className="flex items-center gap-1">AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-[#cad5e2] bg-[#f8fafc] p-2">
                <div className="flex h-10 flex-col justify-center px-2">
                  <span className="text-sm font-semibold leading-5 text-[#314158]">Damage Protection</span>
                </div>
                <div className="flex items-start gap-4 rounded-lg border border-[#cad5e2] bg-white p-4">
                  <div className="flex w-[261px] flex-col gap-1">
                    <span className="flex items-center gap-0.5 pb-1.5 text-sm font-normal leading-5 text-[#314158]">
                      Policy <span className="text-[#fb2c36]">*</span>
                    </span>
                    <div className="flex h-10 items-center justify-between rounded-lg border border-[#90a1b9] bg-white px-2">
                      <span className="flex-1 px-1 py-0.5 text-sm font-normal leading-5 text-[#314158]">Not Required</span>
                      <span className="flex items-center rounded p-1">
                        <ChevronDown className="size-4 text-[#314158]" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold leading-6 text-[#314158]">Accepted Payment Method</span>
              <span className="text-sm font-medium leading-5 text-[#314158]">Online Payment</span>
            </div>

            <div className="flex w-full gap-4">
              <div className="flex flex-1 items-center gap-4">
                <span className="flex size-6 items-center justify-center">
                  <Check className="size-6 text-[#314158]" />
                </span>
                <span className="flex items-center gap-2">
                  <CreditCard className="size-5 text-[#314158]" />
                  <span className="text-sm font-medium leading-5 text-[#314158]">Credit Card</span>
                </span>
              </div>
              <div className="flex flex-1 items-center gap-4">
                <span className="flex size-6 items-center justify-center">
                  <Check className="size-6 text-[#314158]" />
                </span>
                <span className="flex items-center gap-2">
                  <Bitcoin className="size-5 text-[#314158]" />
                  <span className="text-sm font-medium leading-5 text-[#314158]">Cryptocurrency</span>
                </span>
              </div>
            </div>

            <div className="flex h-6 items-center gap-2">
              <X className="size-6 text-[#90a1b9]" />
              <span className="flex items-center gap-2">
                <Landmark className="size-5 text-[#90a1b9]" />
                <span className="text-sm font-medium leading-5 text-[#90a1b9]">Bank Transfer</span>
              </span>
            </div>

            <button
              type="button"
              className="flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-[#cad5e2] bg-white px-3.5 text-base font-semibold leading-6 text-[#314158] transition-colors hover:bg-slate-50"
            >
              <Settings2 className="size-5" />
              Edit payment method
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-4 border-t border-[#cad5e2] bg-white p-4">
          <div className="flex w-full items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-[#cad5e2] bg-white px-3.5 text-base font-semibold leading-6 text-[#314158] transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onConfirm?.(); onClose() }}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-[#7f22fe] bg-[#8e51ff] px-3.5 text-base font-semibold leading-6 text-white transition-colors hover:bg-[#7f22fe]"
            >
              Create Extension
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
