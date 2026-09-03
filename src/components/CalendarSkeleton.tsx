export function CalendarSkeleton() {
  return (
    <div
      aria-hidden
      className="flex w-full flex-col gap-3 rounded-[15.75px] border border-[#CAD5E2] bg-white p-4 font-sans antialiased [font-synthesis:none]"
    >
      <div className="text-sm font-semibold leading-[142.857%] text-[#09090B]">
        <div className="h-5 w-[110px] animate-pulse rounded bg-slate-200" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[18px]">
          <div className="flex h-[18px] items-center gap-[6.75px]">
            <span className="size-2 shrink-0 animate-pulse rounded-[6.75px] bg-slate-200" />
            <div className="h-3 w-[68px] animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex h-[18px] items-center gap-[6.75px]">
            <span className="size-2 shrink-0 animate-pulse rounded-[6.75px] bg-slate-200" />
            <div className="h-3 w-[62px] animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="flex items-center gap-[4.5px]">
          <div className="size-9 shrink-0 animate-pulse rounded-[11.25px] bg-slate-200" />
          <div className="flex min-w-[120px] items-center justify-center">
            <div className="h-[14px] w-[92px] animate-pulse rounded bg-slate-200" />
          </div>
          <div className="size-9 shrink-0 animate-pulse rounded-[11.25px] bg-slate-200" />
        </div>
      </div>

      <div className="flex w-full flex-col">
        <div className="flex w-full pb-3">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} className="flex h-[17px] flex-1 shrink-0 items-center justify-center text-center">
              <div className="h-3 w-5 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col gap-1.5">
          {[0, 1, 2, 3, 4].map(row => (
            <div key={row} className="flex w-full">
              {Array.from({ length: 7 }).map((_, col) => {
                const outside = row === 0 && col < 5
                if (outside) {
                  return <div key={col} className="flex flex-1 shrink-0 items-center justify-center p-0" />
                }
                return (
                  <div key={col} className="flex flex-1 shrink-0 items-center justify-center p-0">
                    <div className="h-[40.5px] w-full animate-pulse rounded-lg bg-slate-200" />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 self-stretch pt-1">
        <div className="flex h-9 items-center gap-1">
          <div className="h-[14px] w-4 animate-pulse rounded bg-slate-200" />
          <div className="h-[14px] w-[148px] animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-9 w-[170px] shrink-0 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}
