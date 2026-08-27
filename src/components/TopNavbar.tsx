import { Bell } from "lucide-react"

const NAV_ITEMS = [
  { label: "Properties", dropdown: true },
  { label: "Reservations", dropdown: true },
  { label: "Inbox", active: true },
  { label: "Contacts", dropdown: true },
  { label: "Smart Locks" },
  { label: "Tasks" },
  { label: "Housekeeping", dropdown: true },
  { label: "Accounting", dropdown: true },
  { label: "Staff" },
  { label: "Payments" },
] as const

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="ml-1 opacity-60">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Logo() {
  return (
    <svg width="34" height="36" viewBox="0 0 28 36" className="shrink-0 text-slate-800">
      <path d="M27.145 5.038L21.886 2.379C20.849 1.361 19.504 0.716 18.061 0.545C16.618 0.375 15.16 0.689 13.915 1.437C13.194 1.87 12.567 2.444 12.071 3.124C11.576 3.804 11.223 4.576 11.032 5.396C10.841 6.202 10.814 7.039 10.953 7.856C11.091 8.673 11.392 9.453 11.837 10.152C12.191 10.715 12.632 11.217 13.144 11.641C13.038 11.651 12.934 11.665 12.833 11.679C12.196 11.774 11.575 11.958 10.989 12.224L0.373 16.952C0.274 16.996 0.188 17.064 0.123 17.151C0.058 17.238 0.016 17.341 0.003 17.448C-0.007 17.555 0.009 17.661 0.05 17.76C0.091 17.858 0.154 17.946 0.236 18.014L5.972 22.934L2.386 34.661C2.356 34.758 2.349 34.86 2.366 34.96C2.383 35.06 2.423 35.155 2.483 35.236C2.543 35.318 2.621 35.384 2.712 35.43C2.802 35.476 2.902 35.5 3.003 35.5C3.114 35.5 3.222 35.472 3.319 35.419L17.727 27.404C17.727 27.442 17.727 27.482 17.716 27.52C17.692 27.839 17.733 28.159 17.834 28.461C17.935 28.764 18.096 29.044 18.306 29.284C18.627 29.654 19.049 29.922 19.521 30.053C19.993 30.185 20.493 30.174 20.959 30.023C21.424 29.872 21.835 29.587 22.14 29.204C22.445 28.82 22.63 28.356 22.673 27.868C22.696 27.549 22.656 27.23 22.555 26.927C22.453 26.625 22.294 26.346 22.084 26.105C21.716 25.681 21.215 25.395 20.663 25.293C21.832 23.991 22.527 22.332 22.635 20.586C22.712 19.214 22.456 17.844 21.889 16.592C21.323 15.34 20.462 14.243 19.381 13.396C19.193 13.245 18.998 13.103 18.793 12.969C19.462 12.813 20.102 12.552 20.69 12.194C21.732 11.563 22.57 10.643 23.103 9.546L27.304 6.316L27.346 6.28C27.435 6.192 27.502 6.084 27.54 5.964C27.579 5.845 27.587 5.718 27.566 5.594C27.545 5.475 27.496 5.362 27.423 5.266C27.35 5.169 27.255 5.091 27.145 5.038ZM1.673 17.68L11.468 13.313C11.954 13.092 12.468 12.939 12.995 12.859C14.196 12.694 16.528 12.651 18.63 14.327C19.562 15.054 20.305 15.995 20.794 17.071C21.284 18.146 21.506 19.325 21.442 20.505C21.379 21.573 21.055 22.608 20.5 23.522C19.944 24.435 19.172 25.198 18.253 25.744L18.186 25.782C16.977 26.5 15.577 26.827 14.176 26.718C12.831 26.615 11.488 26.044 10.294 25.063L1.673 17.68ZM6.963 23.788L9.528 25.988C10.921 27.125 12.496 27.79 14.085 27.912L14.332 27.927L3.926 33.718L6.963 23.788ZM20.069 11.17C18.887 11.89 17.471 12.12 16.122 11.811C14.773 11.502 13.597 10.678 12.846 9.515C12.486 8.95 12.243 8.319 12.131 7.659C12.019 6.998 12.041 6.322 12.195 5.671C12.35 5.006 12.637 4.379 13.04 3.828C13.442 3.276 13.95 2.811 14.535 2.46C15.717 1.741 17.134 1.512 18.482 1.821C19.831 2.13 21.006 2.953 21.758 4.115C22.119 4.679 22.362 5.31 22.474 5.971C22.586 6.631 22.564 7.307 22.41 7.959C22.255 8.624 21.967 9.25 21.565 9.801C21.163 10.353 20.654 10.817 20.069 11.168V11.17ZM23.247 4.408L26.011 5.805L23.695 7.59C23.828 6.508 23.674 5.41 23.247 4.406V4.408Z" fill="currentColor" />
    </svg>
  )
}

export function TopNavbar({
  notificationCount = 99,
  avatarUrl,
}: {
  notificationCount?: number
  avatarUrl?: string
}) {
  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[#2E303A26] bg-background px-8">
      <div className="flex items-center">
        <Logo />
        <nav className="ml-[24px] hidden items-center gap-[24px] lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center rounded-md px-2 py-1 text-[14px] transition-colors ${
                "active" in item && item.active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-slate-800 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {item.label}
              {"dropdown" in item && item.dropdown && <ChevronDown />}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Notifications">
          <Bell className="size-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium leading-none text-primary-foreground">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
        <div className="ml-2 size-8 overflow-hidden rounded-full bg-muted">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="User avatar" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-medium text-muted-foreground">U</div>
          )}
        </div>
      </div>
    </header>
  )
}
