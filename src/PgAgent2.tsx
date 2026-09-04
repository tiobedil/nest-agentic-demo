import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { PromptBar } from "@/components/chat/PromptBar"
import { Processing } from "@/components/chat/Processing"
import { StreamingText } from "@/components/chat/StreamingText"
import { SelectableReservationCard, ReservationSummary } from "@/components/ReservationSummary"
import { ExtensionDateField } from "@/components/ExtensionDateField"
import { Check, CreditCard, Bitcoin, Landmark, X, Settings2, Loader2, Link as LinkIcon, Copy, CheckCircle2, Info } from "lucide-react"
import { addDays, differenceInCalendarDays, format } from "date-fns"
import { cn } from "@/lib/utils"

type Turn = { id: string; user: string; done: boolean; streamed: boolean; loaded: boolean; selectedId: string | null; extensionDate: Date | null; invoiceGenerating: boolean; invoiceLoaded: boolean; paymentSent: boolean; payLink: string | null }

const CHECKOUT_DATES: Record<string, Date> = {
  "D-15202023": new Date(2024, 10, 15),
  "D-15202024": new Date(2024, 10, 22),
  "D-15202025": new Date(2024, 11, 5),
}

const STREAMING_REPLY = "Found three active reservations for Amar. Select the one you'd like to continue with the extension request."

const RESERVATIONS = [
  {
    id: "D-15202023",
    guests: 2,
    property: "DXB-LANA-SA-101",
    checkInDate: "November 10th, 2024",
    checkInTime: "12:00 PM",
    checkOutDate: "November 15th, 2024",
    checkOutTime: "14:00 PM",
  },
  {
    id: "D-15202024",
    guests: 3,
    property: "DXB-MARINA-PH-202",
    checkInDate: "November 18th, 2024",
    checkInTime: "10:00 AM",
    checkOutDate: "November 22nd, 2024",
    checkOutTime: "11:00 AM",
  },
  {
    id: "D-15202025",
    guests: 1,
    property: "DXB-DOWNTOWN-BL-303",
    checkInDate: "December 1st, 2024",
    checkInTime: "03:00 PM",
    checkOutDate: "December 5th, 2024",
    checkOutTime: "12:00 PM",
  },
] as const

function FadeScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const update = () => {
    const el = ref.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }
  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])
  useEffect(() => {
    update()
  })
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory" style={{ gap: "12px" }}>
        {children}
      </div>
      {showLeft && <div className="pointer-events-none absolute bottom-2 left-0 top-1 w-6 bg-gradient-to-r from-white to-transparent" />}
      {showRight && <div className="pointer-events-none absolute bottom-2 right-0 top-1 w-6 bg-gradient-to-l from-white to-transparent" />}
    </div>
  )
}

const SelectableSkeleton = () => (
  <FadeScrollRow>
    {[0, 1, 2].map(i => (
      <div key={i} className="flex w-[300px] shrink-0 snap-start flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-px bg-slate-200" />
        <div className="flex gap-4">
          {[0, 1].map(j => (
            <div key={j} className="flex flex-1 flex-col gap-2">
              <div className="h-2 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </FadeScrollRow>
)

function ConfirmationModal({ open, onClose, extensionDate, originalCheckout, selectedId, step, onSend, payLink, onCopyLink }: { open: boolean; onClose: () => void; extensionDate: Date; originalCheckout: Date; selectedId: string; step: "form" | "sending" | "sent"; onSend: () => void; payLink: string; onCopyLink: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])
  if (!mounted) return null
  const reservation = RESERVATIONS.find(r => r.id === selectedId)
  const nights = Math.max(1, differenceInCalendarDays(extensionDate, originalCheckout))
  const holdExpiry = addDays(extensionDate, 1)
  const rentPerNight = 160
  const rent = nights * rentPerNight
  const bookingFee = 50
  const serviceFee = 5
  const tourismFee = 10
  const subTotal = rent + bookingFee + serviceFee + tourismFee
  const vat = Math.round(subTotal * 0.05 * 100) / 100
  const total = Math.round((subTotal + vat) * 100) / 100
  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 font-sans antialiased [font-synthesis:none] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-[rgba(0,0,0,0.3)] ${open ? "animate-in fade-in-0 duration-200" : "animate-out fade-out-0 duration-150"}`} onClick={onClose} aria-hidden />
      <div
        className={cn(
          "relative flex w-[600px] max-w-[92vw] flex-col overflow-hidden rounded-[8px] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-2px_rgba(0,0,0,0.05)]",
          open ? "animate-in fade-in-0 zoom-in-95 duration-200" : "animate-out fade-out-0 zoom-out-95 duration-150",
          step === "form" ? "max-h-[90vh] overflow-y-auto" : "h-[484px]"
        )}
      >
        {step === "form" && (
          <>
            <div className="flex shrink-0 items-start gap-[10px] px-[20px] pb-[16px] pt-[20px]">
              <p className="flex-1 text-[18px] font-semibold leading-[28px] text-[#1e293b]">Everything Looks Good?</p>
              <button type="button" onClick={onClose} aria-label="Close" className="flex size-[24px] shrink-0 items-center justify-center text-[#314158] hover:bg-slate-100 rounded">
                <X className="size-[24px]" />
              </button>
            </div>
            <div className="flex flex-col gap-[16px] px-[20px] pb-[16px] overflow-y-auto">
              <p className="text-[14px] font-normal leading-[20px] text-[#314158]">Please review the details below to ensure everything is accurate before sending a booking registration.</p>
              {reservation && (
                <ReservationSummary
                  name="Amar Sundaram"
                  email="amar.sundaram@example.com"
                  phone="+226-795-552-31"
                  reservationId={reservation.id}
                  checkInDate={reservation.checkInDate}
                  checkInTime={reservation.checkInTime}
                  checkOutDate={reservation.checkOutDate}
                  checkOutTime={reservation.checkOutTime}
                  property={reservation.property}
                  guests={reservation.guests}
                  className="rounded-xl border-[#cad5e2]"
                />
              )}
              <div className="h-px w-full bg-[#cad5e2]" />
              <div className="flex w-full flex-col gap-[8px] rounded-[12px] border border-[#cad5e2] bg-[#f8fafc] p-[8px]">
                <div className="flex h-[40px] w-full items-center px-[8px]">
                  <p className="flex-1 text-[14px] font-semibold leading-[20px] text-[#314158]">Extension Invoice</p>
                </div>
                <div className="flex w-full flex-col gap-[12px] rounded-[8px] border border-[#cad5e2] bg-white px-[8px] py-[12px]">
                  <div className="flex w-full items-center justify-between text-[14px]">
                    <span className="text-[#62748e]">Rent ({nights} nights × AED {rentPerNight.toFixed(2)})</span>
                    <span className="font-medium text-[#314158]">AED {rent.toFixed(2)}</span>
                  </div>
                  <div className="flex w-full items-center justify-between text-[14px]">
                    <span className="text-[#62748e]">Booking fee</span>
                    <span className="font-medium text-[#314158]">AED {bookingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex w-full items-center justify-between text-[14px]">
                    <span className="text-[#62748e]">Service fee</span>
                    <span className="font-medium text-[#314158]">AED {serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex w-full items-center justify-between text-[14px]">
                    <span className="text-[#62748e]">Tourism fee</span>
                    <span className="font-medium text-[#314158]">AED {tourismFee.toFixed(2)}</span>
                  </div>
                  <div className="h-px w-full bg-[#cad5e2]" />
                  <div className="flex w-full items-center justify-between text-[14px]">
                    <span className="text-[#62748e]">Sub Total</span>
                    <span className="font-medium text-[#314158]">AED {subTotal.toFixed(2)}</span>
                  </div>
                  <div className="h-px w-full bg-[#cad5e2]" />
                  <div className="flex w-full items-center justify-between text-[14px]">
                    <span className="text-[#62748e]">VAT (5%)</span>
                    <span className="font-medium text-[#314158]">AED {vat.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex h-[36px] w-full items-center rounded-[8px] bg-[#ede9fe] px-[8px]">
                  <div className="flex w-full items-center justify-between text-[14px] font-semibold leading-[20px] text-[#4d179a]">
                    <span>Total Payment Due</span>
                    <span>AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="h-px w-full bg-[#cad5e2]" />
              <div className="flex w-full flex-col gap-[4px]">
                <div className="flex items-center gap-[6px] pb-[6px]">
                  <span className="flex items-center gap-[2px] text-[14px] leading-[20px]">
                    <span className="text-[#314158]">Hold Expiry</span>
                    <span className="text-[#fb2c36]">*</span>
                  </span>
                  <span className="flex size-[16px] items-center justify-center text-[#62748e]">
                    <Info className="size-[16px]" />
                  </span>
                </div>
                <div className="flex h-[40px] w-full items-center justify-between rounded-[8px] border border-[#90a1b9] bg-white px-[8px]">
                  <span className="flex-1 px-[4px] text-[14px] text-[#314158]">{format(holdExpiry, "MMMM do, yyyy")}</span>
                  <span className="flex size-[24px] items-center justify-center rounded-[4px] p-[4px]">
                    <Settings2 className="size-[16px] text-[#314158] rotate-0 hidden" />
                    <span className="flex size-[16px] items-center justify-center text-[#314158]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="#314158" strokeWidth="1.2"/><path d="M5 2V4M11 2V4M2.5 6.5H13.5" stroke="#314158" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-[8px] border-t border-[#cad5e2] px-[20px] pb-[20px] pt-[16px]">
              <button type="button" onClick={onClose} className="flex h-[40px] items-center justify-center rounded-[8px] border border-[#cad5e2] bg-white px-[14px] text-[16px] font-semibold leading-[24px] text-[#314158] hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={onSend} className="flex h-[40px] items-center justify-center rounded-[8px] border border-[#7f22fe] bg-[#8e51ff] px-[14px] text-[16px] font-semibold leading-[24px] text-white hover:bg-[#7f22fe]">Send Payment Link</button>
            </div>
          </>
        )}
        {step === "sending" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-[24px] px-[20px] py-[64px]">
            <Loader2 className="size-[64px] animate-spin text-[#8e51ff]" />
            <div className="flex flex-col items-center gap-[8px] text-center">
              <p className="text-[20px] font-semibold leading-[28px] text-[#314158]">Sending Email...</p>
              <p className="text-[14px] leading-[20px] text-[#62748e]">One moment please.</p>
            </div>
          </div>
        )}
        {step === "sent" && (
          <>
            <div className="flex justify-end px-[20px] pt-[20px]">
              <button type="button" onClick={onClose} aria-label="Close" className="flex size-[24px] items-center justify-center text-[#314158] hover:bg-slate-100 rounded">
                <X className="size-[24px]" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-[24px] px-[20px] py-[64px]">
              <CheckCircle2 className="size-[64px] text-[#00c950]" />
              <div className="flex flex-col items-center gap-[8px] text-center max-w-[400px]">
                <p className="text-[20px] font-semibold leading-[28px] text-[#314158]">Payment Email Sent</p>
                <p className="text-[14px] leading-[20px] text-[#62748e]">Use the link below to share the payment link through any other channel.</p>
              </div>
            </div>
            <div className="flex flex-col gap-[4px] px-[20px]">
              <div className="flex h-[40px] w-full items-center gap-[4px] rounded-[8px] border border-[#90a1b9] bg-white px-[8px]">
                <span className="flex size-[24px] shrink-0 items-center justify-center rounded-[4px] p-[4px] text-[#314158]">
                  <LinkIcon className="size-[16px]" />
                </span>
                <span className="flex-1 truncate px-[4px] text-[14px] leading-[20px] text-[#314158]">{payLink}</span>
                <button type="button" onClick={onCopyLink} aria-label="Copy link" className="flex size-[24px] shrink-0 items-center justify-center rounded-[4px] p-[4px] text-[#314158] hover:bg-slate-100">
                  <Copy className="size-[16px]" />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-[8px] px-[20px] pt-[16px]">
              <button type="button" onClick={onClose} className="flex h-[40px] items-center justify-center rounded-[8px] border border-[#cad5e2] bg-white px-[14px] text-[16px] font-semibold leading-[24px] text-[#314158] hover:bg-slate-50">Close</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

function ExtensionInvoiceCard({ extensionDate, originalCheckout, onCreate, paymentSent, payLink, onCopyLink }: { extensionDate: Date; originalCheckout: Date; onCreate: () => void; paymentSent?: boolean; payLink?: string; onCopyLink?: () => void }) {
  const [rate, setRate] = useState<"new" | "original">("new")
  const nights = Math.max(1, differenceInCalendarDays(extensionDate, originalCheckout))
  const newRate = 160
  const originalRate = 125
  const rentPerNight = rate === "new" ? newRate : originalRate
  const rent = nights * rentPerNight
  const bookingFee = 50
  const serviceFee = 5
  const tourismFee = 10
  const subTotal = rent + bookingFee + serviceFee + tourismFee
  const vat = Math.round(subTotal * 0.05 * 100) / 100
  const total = Math.round((subTotal + vat) * 100) / 100
  return (
    <div className="flex w-full flex-col gap-[24px] rounded-[16px] border border-[#cad5e2] bg-white p-[16px] font-sans">
      <div className="flex w-full flex-col gap-[12px]">
        <button
          type="button"
          disabled={paymentSent}
          onClick={() => setRate("new")}
          className={cn(
            "flex w-full items-center gap-[16px] rounded-[12px] border p-[16px] text-left transition-colors",
            rate === "new" ? "border-[#7f22fe] bg-[#f5f3ff]" : "border-[#cad5e2] bg-[#f8fafc]",
            paymentSent && "pointer-events-none opacity-60"
          )}
        >
          <span
            className={cn(
              "flex size-[24px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              rate === "new" ? "border-[#7f22fe] bg-white" : "border-[#cad5e2] bg-white"
            )}
          >
            {rate === "new" && <span className="size-[12px] rounded-full bg-[#7f22fe]" />}
          </span>
          <div className="flex flex-[1_0_0] flex-col gap-[4px] min-w-0">
            <p className="text-[14px] font-medium leading-[20px] text-[#314158]">Apply New Rates</p>
            <p className="text-[12px] font-normal leading-[16px] text-[#62748e]">Uses the current calendar rates for the extension nights</p>
            <p className="text-[12px] font-normal leading-[16px] text-[#62748e]">{nights} nights × AED {newRate.toFixed(2)}</p>
          </div>
          <p className="shrink-0 text-[14px] font-semibold leading-[20px] text-[#314158]">AED {(nights * newRate).toFixed(2)}</p>
        </button>
        <button
          type="button"
          disabled={paymentSent}
          onClick={() => setRate("original")}
          className={cn(
            "flex w-full items-center gap-[16px] rounded-[12px] border p-[16px] text-left transition-colors",
            rate === "original" ? "border-[#7f22fe] bg-[#f5f3ff]" : "border-[#cad5e2] bg-[#f8fafc]",
            paymentSent && "pointer-events-none opacity-60"
          )}
        >
          <span
            className={cn(
              "flex size-[24px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              rate === "original" ? "border-[#7f22fe] bg-white" : "border-[#cad5e2] bg-white"
            )}
          >
            {rate === "original" && <span className="size-[12px] rounded-full bg-[#7f22fe]" />}
          </span>
          <div className="flex flex-[1_0_0] flex-col gap-[4px] min-w-0">
            <p className="text-[14px] font-medium leading-[20px] text-[#314158]">Keep Original Rate</p>
            <p className="text-[12px] font-normal leading-[16px] text-[#62748e]">Extend stay at the same nightly rate as the original reservation</p>
            <p className="text-[12px] font-normal leading-[16px] text-[#62748e]">{nights} nights × AED {originalRate.toFixed(2)}</p>
          </div>
          <p className="shrink-0 text-[14px] font-semibold leading-[20px] text-[#314158]">AED {(nights * originalRate).toFixed(2)}</p>
        </button>
      </div>
      <div className="h-px w-full shrink-0 bg-[#cad5e2]" />
      <div className="flex w-full flex-col gap-[8px] rounded-[12px] border border-[#cad5e2] bg-[#f8fafc] p-[8px]">
        <div className="flex h-[40px] w-full items-center justify-center pl-[8px]">
          <p className="flex flex-[1_0_0] flex-col justify-center text-[14px] font-semibold leading-[20px] text-[#314158]">Extension Invoice</p>
        </div>
        <div className="flex w-full flex-col overflow-clip rounded-[8px] border border-[#cad5e2] bg-white">
          <div className="flex w-full flex-col gap-[12px] px-[8px] py-[12px]">
            <div className="flex w-full items-center gap-[16px] text-[14px]">
              <div className="flex flex-[1_0_0] flex-col justify-center text-[#62748e]">
                <p className="font-normal leading-[20px]">Rent ({nights} nights × AED {rentPerNight.toFixed(2)})</p>
              </div>
              <div className="flex shrink-0 items-center gap-[4px] font-medium text-[#314158] whitespace-nowrap">
                <p className="leading-[20px]">AED</p>
                <p className="leading-[20px]">{rent.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-[16px] text-[14px]">
              <div className="flex flex-[1_0_0] flex-col justify-center text-[#62748e]">
                <p className="font-normal leading-[20px]">Booking fee</p>
              </div>
              <div className="flex shrink-0 items-center gap-[4px] font-medium text-[#314158] whitespace-nowrap">
                <p className="leading-[20px]">AED</p>
                <p className="leading-[20px]">{bookingFee.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-[16px] text-[14px]">
              <div className="flex flex-[1_0_0] flex-col justify-center text-[#62748e]">
                <p className="font-normal leading-[20px]">Service fee</p>
              </div>
              <div className="flex shrink-0 items-center gap-[4px] font-medium text-[#314158] whitespace-nowrap">
                <p className="leading-[20px]">AED</p>
                <p className="leading-[20px]">{serviceFee.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-[16px] text-[14px]">
              <div className="flex flex-[1_0_0] flex-col justify-center text-[#62748e]">
                <p className="font-normal leading-[20px]">Tourism fee</p>
              </div>
              <div className="flex shrink-0 items-center gap-[4px] font-medium text-[#314158] whitespace-nowrap">
                <p className="leading-[20px]">AED</p>
                <p className="leading-[20px]">{tourismFee.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-px w-full shrink-0 bg-[#cad5e2]" />
            <div className="flex w-full items-center gap-[16px] text-[14px]">
              <div className="flex flex-[1_0_0] flex-col justify-center text-[#62748e]">
                <p className="font-normal leading-[20px]">Sub Total</p>
              </div>
              <div className="flex shrink-0 items-center gap-[4px] font-medium text-[#314158] whitespace-nowrap">
                <p className="leading-[20px]">AED</p>
                <p className="leading-[20px]">{subTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-px w-full shrink-0 bg-[#cad5e2]" />
            <div className="flex w-full items-center gap-[16px] text-[14px]">
              <div className="flex flex-[1_0_0] flex-col justify-center text-[#62748e]">
                <p className="font-normal leading-[20px]">VAT (5%)</p>
              </div>
              <div className="flex shrink-0 items-center gap-[4px] font-medium text-[#314158] whitespace-nowrap">
                <p className="leading-[20px]">AED</p>
                <p className="leading-[20px]">{vat.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[36px] w-full items-center rounded-[8px] bg-[#ede9fe] p-[8px]">
          <div className="flex w-full items-center gap-[16px] text-[14px] font-semibold leading-[20px] text-[#4d179a]">
            <p className="flex flex-[1_0_0] flex-col justify-center">Total Payment Due</p>
            <div className="flex shrink-0 items-center gap-[4px] whitespace-nowrap">
              <p className="leading-[20px]">AED</p>
              <p className="leading-[20px]">{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px w-full shrink-0 bg-[#cad5e2]" />
      <div className="flex w-full flex-col gap-[16px]">
        <div className="flex flex-col gap-[2px]">
          <p className="text-[16px] font-bold leading-[24px] text-[#314158]">Accepted Payment Method</p>
          <p className="text-[14px] font-medium leading-[20px] text-[#314158]">Online Payment</p>
        </div>
        <div className="flex w-full gap-[16px]">
          <div className="flex flex-1 items-center gap-[16px]">
            <span className="flex size-[24px] shrink-0 items-center justify-center">
              <Check className="size-[20px] text-[#8e51ff]" />
            </span>
            <span className="flex items-center gap-[8px]">
              <CreditCard className="size-[20px] shrink-0 text-[#314158]" />
              <span className="text-[14px] font-medium leading-[20px] text-[#314158]">Credit Card</span>
            </span>
          </div>
          <div className="flex flex-1 items-center gap-[16px]">
            <span className="flex size-[24px] shrink-0 items-center justify-center">
              <Check className="size-[20px] text-[#8e51ff]" />
            </span>
            <span className="flex items-center gap-[8px]">
              <Bitcoin className="size-[20px] shrink-0 text-[#314158]" />
              <span className="text-[14px] font-medium leading-[20px] text-[#314158]">Cryptocurrency</span>
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-[16px]">
          <span className="flex size-[24px] shrink-0 items-center justify-center">
            <X className="size-[20px] text-[#90a1b9]" />
          </span>
          <span className="flex items-center gap-[8px]">
            <Landmark className="size-[20px] shrink-0 text-[#90a1b9]" />
            <span className="text-[14px] font-medium leading-[20px] text-[#90a1b9]">Bank Transfer</span>
          </span>
        </div>
        {!paymentSent && (
          <button
            type="button"
            className="flex h-[40px] w-fit items-center justify-center gap-[8px] rounded-[8px] border border-[#cad5e2] bg-white px-[14px] text-[16px] font-semibold leading-[24px] text-[#314158] transition-colors hover:bg-[#f8fafc]"
          >
            <Settings2 className="size-[20px]" />
            Edit payment method
          </button>
        )}
      </div>
      <div className="h-px w-full shrink-0 bg-[#cad5e2]" />
      {paymentSent ? (
        <div className="flex w-full flex-col gap-[16px] rounded-[12px] border border-[#b9f8cf] bg-[#f0fdf4] p-[16px]">
          <div className="flex w-full items-center gap-[16px]">
            <span className="flex size-[24px] shrink-0 items-center justify-center">
              <CheckCircle2 className="size-[24px] text-[#00c950]" />
            </span>
            <div className="flex flex-1 flex-col gap-[4px]">
              <p className="text-[14px] font-medium leading-[20px] text-[#314158]">Payment Email Sent</p>
              <p className="text-[12px] font-normal leading-[16px] text-[#62748e]">Use the link below to share the payment link through any other channel.</p>
            </div>
          </div>
          <div className="flex h-[40px] w-full items-center gap-[4px] rounded-[8px] border border-[#90a1b9] bg-white px-[8px]">
            <span className="flex size-[24px] shrink-0 items-center justify-center rounded-[4px] p-[4px] text-[#314158]">
              <LinkIcon className="size-[16px]" />
            </span>
            <span className="flex-1 truncate px-[4px] text-[14px] leading-[20px] text-[#314158]">{payLink ?? "/pay/7823947234"}</span>
            <button type="button" onClick={onCopyLink} aria-label="Copy link" className="flex size-[24px] shrink-0 items-center justify-center rounded-[4px] p-[4px] text-[#314158] hover:bg-slate-100">
              <Copy className="size-[16px]" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="flex h-[40px] w-full items-center justify-center gap-[8px] rounded-[8px] border border-[#7f22fe] bg-[#8e51ff] px-[14px] text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-[#7f22fe]"
        >
          Create Extension
        </button>
      )}
    </div>
  )
}

export function PgAgent2() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [confirmModal, setConfirmModal] = useState<null | { turnId: string; extensionDate: Date; originalCheckout: Date; selectedId: string; step: "form" | "sending" | "sent"; payLink: string }>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasChat = turns.length > 0
  const isThinking = turns.some(t => !t.loaded || t.invoiceGenerating)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [turns])

  const openConfirm = (t: Turn) => {
    if (!t.extensionDate || !t.selectedId) return
    const orig = CHECKOUT_DATES[t.selectedId]
    if (!orig) return
    setConfirmModal({ turnId: t.id, extensionDate: t.extensionDate, originalCheckout: orig, selectedId: t.selectedId, step: "form", payLink: "/pay/7823947234" })
    setConfirmOpen(true)
  }
  const closeConfirm = () => {
    setConfirmOpen(false)
    setTimeout(() => setConfirmModal(null), 200)
  }
  const sendPaymentLink = () => {
    if (!confirmModal) return
    setConfirmModal(m => (m ? { ...m, step: "sending" } : null))
    setTimeout(() => {
      setConfirmModal(m => (m ? { ...m, step: "sent" } : null))
      setTurns(ms => ms.map(t => (t.id === confirmModal.turnId ? { ...t, paymentSent: true, payLink: confirmModal.payLink } : t)))
    }, 3000)
  }
  const copyLink = () => {
    if (confirmModal?.payLink) navigator.clipboard.writeText(window.location.origin + confirmModal.payLink)
  }
  const copyInvoiceLink = (link: string) => {
    navigator.clipboard.writeText(window.location.origin + link)
  }

  const send = (t: string) => {
    setTurns(m => [...m, { id: Date.now().toString(), user: t, done: false, streamed: false, loaded: false, selectedId: null, extensionDate: null, invoiceGenerating: false, invoiceLoaded: false, paymentSent: false, payLink: null }])
  }

  const onProcessingDone = (id: string) => {
    setTurns(m => m.map(t => (t.id === id ? { ...t, done: true } : t)))
  }

  const onStreamDone = (id: string) => {
    setTurns(m => m.map(t => (t.id === id ? { ...t, streamed: true } : t)))
    setTimeout(() => {
      setTurns(m => m.map(t => (t.id === id ? { ...t, loaded: true } : t)))
    }, 700)
  }

  const selectReservation = (turnId: string, reservationId: string) => {
    setTurns(m => m.map(t => (t.id === turnId ? { ...t, selectedId: reservationId, extensionDate: null, invoiceGenerating: false, invoiceLoaded: false, paymentSent: false, payLink: null } : t)))
  }

  const setExtensionDate = (turnId: string, date: Date | undefined) => {
    if (!date) {
      setTurns(m => m.map(t => (t.id === turnId ? { ...t, extensionDate: null, invoiceGenerating: false, invoiceLoaded: false, paymentSent: false, payLink: null } : t)))
      return
    }
    setTurns(m => m.map(t => (t.id === turnId ? { ...t, extensionDate: date, invoiceGenerating: true, invoiceLoaded: false, paymentSent: false, payLink: null } : t)))
  }

  const onInvoiceDone = (id: string) => {
    setTurns(m => m.map(t => (t.id === id ? { ...t, invoiceGenerating: false, invoiceLoaded: true } : t)))
  }

  const getMinDate = (selectedId: string | null) => {
    if (!selectedId) return undefined
    const checkout = CHECKOUT_DATES[selectedId]
    if (!checkout) return undefined
    return addDays(checkout, 1)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto bg-white">
        {!hasChat ? (
          <div className="flex h-full items-start justify-center bg-white p-6 pt-[240px]">
            <div className="flex w-full max-w-2xl flex-col items-center gap-8">
              <div className="space-y-4 text-center">
                <h2 className="text-[36px] font-semibold leading-none tracking-tight text-foreground/80">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
              </div>
              <PromptBar onSend={send} isThinking={isThinking} />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
            {turns.map(t => (
              <div key={t.id} className="flex flex-col gap-8">
                <div className="self-end max-w-[78%] rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{t.user}</div>
                <div className="flex flex-col gap-[12px]">
                  <Processing done={t.done} onDone={() => onProcessingDone(t.id)} title="Finding reservation based on the query" doneTitle="Found for 1 second" hideSteps stages={[1500]} />
                  {t.done && (
                    <div className="flex flex-col gap-[12px]">
                      <StreamingText text={STREAMING_REPLY} speed={18} onDone={() => onStreamDone(t.id)} />
                      {t.streamed && !t.loaded && <SelectableSkeleton />}
                      {t.loaded && (
                        <div className="flex flex-col gap-4">
                          <div className={cn((t.invoiceGenerating || t.invoiceLoaded) && "pointer-events-none opacity-60")}>
                            <FadeScrollRow>
                              {RESERVATIONS.map(r => (
                                <SelectableReservationCard
                                  key={r.id}
                                  name="Amar Sundaram"
                                  email="amar.sundaram@example.com"
                                  phone="+226-795-552-31"
                                  reservationId={r.id}
                                  checkInDate={r.checkInDate}
                                  checkInTime={r.checkInTime}
                                  checkOutDate={r.checkOutDate}
                                  checkOutTime={r.checkOutTime}
                                  property={r.property}
                                  guests={r.guests}
                                  selected={t.selectedId === r.id}
                                  onSelect={() => !(t.invoiceGenerating || t.invoiceLoaded) && selectReservation(t.id, r.id)}
                                  disabled={t.invoiceGenerating || t.invoiceLoaded}
                                  className={cn((t.invoiceGenerating || t.invoiceLoaded) && "opacity-60")}
                                />
                              ))}
                            </FadeScrollRow>
                          </div>
                          <div className={cn((t.invoiceGenerating || t.invoiceLoaded) && "pointer-events-none opacity-60")}>
                            <ExtensionDateField
                              value={t.extensionDate ?? undefined}
                              onChange={d => setExtensionDate(t.id, d)}
                              label="New check-out date"
                              placeholder={t.selectedId ? "Select new check-out date" : "Select a reservation first"}
                              disabled={!t.selectedId || t.invoiceGenerating || t.invoiceLoaded}
                              minDate={getMinDate(t.selectedId)}
                            />
                          </div>
                          {t.extensionDate && (
                            <div className="pt-[20px]">
                              <Processing
                                done={t.invoiceLoaded}
                                onDone={() => onInvoiceDone(t.id)}
                                title="Generating invoice"
                                doneTitle="Generated for 2 seconds"
                                hideSteps
                                stages={[2000]}
                              />
                            </div>
                          )}
                          {t.invoiceLoaded && t.extensionDate && t.selectedId && CHECKOUT_DATES[t.selectedId] && (
                            <ExtensionInvoiceCard
                              extensionDate={t.extensionDate}
                              originalCheckout={CHECKOUT_DATES[t.selectedId]!}
                              onCreate={() => openConfirm(t)}
                              paymentSent={t.paymentSent}
                              payLink={t.payLink ?? "/pay/7823947234"}
                              onCopyLink={() => copyInvoiceLink(t.payLink ?? "/pay/7823947234")}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {hasChat && (
        <div className="flex shrink-0 justify-center px-4 pb-6">
          <PromptBar onSend={send} isThinking={isThinking} />
        </div>
      )}
      {confirmModal && (
        <ConfirmationModal
          open={confirmOpen}
          onClose={closeConfirm}
          extensionDate={confirmModal.extensionDate}
          originalCheckout={confirmModal.originalCheckout}
          selectedId={confirmModal.selectedId}
          step={confirmModal.step}
          onSend={sendPaymentLink}
          payLink={confirmModal.payLink}
          onCopyLink={copyLink}
        />
      )}
    </div>
  )
}
