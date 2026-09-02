export function CalendarSkeleton() {
  return (
    <div
      aria-hidden
      className="flex w-full flex-col gap-3 rounded-xl border border-slate-300 bg-white p-4 font-sans text-sm text-slate-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[12px] leading-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-slate-200" />
            <span className="text-slate-500">Reservation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-violet-100" />
            <span className="text-slate-500">Extension</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-8 animate-pulse rounded-lg bg-slate-200" />
          <div className="size-8 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: "6px" }}>
        <div className="flex w-full" style={{ paddingBottom: "12px" }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} className="flex flex-1 shrink-0 items-center justify-center">
              <div className="h-3 w-4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {[0, 1, 2, 3, 4, 5].map(row => (
          <div key={row} className="flex w-full">
            {Array.from({ length: 7 }).map((_, col) => {
              const outside = row === 0 ? col < 5 : row === 5 ? col > 1 : false
              if (outside) {
                return <div key={col} className="flex flex-1 shrink-0 items-center justify-center" />
              }
              return (
                <div key={col} className="flex flex-1 shrink-0 items-center justify-center p-0">
                  <div className="size-9 animate-pulse rounded-[min(var(--radius-md),12px)] bg-slate-200" />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
