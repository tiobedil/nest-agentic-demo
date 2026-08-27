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
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
<path d="M27.1454 4.66802L21.8855 1.93262C20.8489 0.885269 19.5037 0.22186 18.061 0.046558C16.6183 -0.128744 15.1599 0.193989 13.9147 0.964081C13.1936 1.40926 12.5667 1.9991 12.0714 2.69856C11.5762 3.39802 11.2226 4.19281 11.0318 5.03569C10.8411 5.86509 10.8141 6.72545 10.9525 7.56578C11.0908 8.40611 11.3917 9.2093 11.8373 9.92775C12.1911 10.5065 12.6322 11.0237 13.144 11.4597C13.0381 11.4699 12.9339 11.4835 12.833 11.4989C12.196 11.5965 11.5753 11.785 10.9888 12.0589L0.373161 16.922C0.273915 16.9671 0.187663 17.0378 0.122754 17.1273C0.0578454 17.2167 0.0164784 17.3219 0.00265775 17.4326C-0.00688073 17.5418 0.00934088 17.6518 0.0499447 17.7531C0.0905486 17.8545 0.154333 17.9442 0.235876 18.0148L5.97207 23.0754L2.38612 35.137C2.35607 35.2365 2.34916 35.342 2.36595 35.4448C2.38275 35.5476 2.42277 35.6449 2.4828 35.7289C2.54283 35.8128 2.62118 35.8811 2.71155 35.9282C2.80192 35.9753 2.90178 35.9999 3.00308 36C3.1135 35.9998 3.2221 35.9711 3.319 35.9166L17.7273 27.6729C17.7273 27.7121 17.7273 27.7529 17.7157 27.7921C17.6925 28.1197 17.7327 28.4488 17.8341 28.7603C17.9354 29.0718 18.0959 29.3595 18.3062 29.6066C18.6269 29.9874 19.0495 30.2625 19.5212 30.3976C19.9928 30.5327 20.4928 30.5219 20.9585 30.3665C21.4242 30.2111 21.8352 29.918 22.1401 29.5237C22.445 29.1294 22.6303 28.6515 22.6729 28.1496C22.6958 27.8224 22.6556 27.4937 22.5546 27.1826C22.4535 26.8714 22.2936 26.584 22.084 26.3367C21.7159 25.9008 21.215 25.6062 20.6632 25.501C21.8319 24.1621 22.5266 22.4562 22.6348 20.66C22.7116 19.2487 22.4559 17.8391 21.8894 16.5514C21.3229 15.2637 20.4625 14.1359 19.3813 13.264C19.1928 13.1091 18.9976 12.9627 18.7925 12.8249C19.462 12.6647 20.1024 12.3958 20.6897 12.0282C21.7323 11.3786 22.5703 10.4329 23.1029 9.30475L27.3042 5.9821L27.3455 5.94465C27.4351 5.85445 27.5019 5.74312 27.5403 5.62033C27.5786 5.49753 27.5873 5.36697 27.5655 5.23995C27.5447 5.11713 27.4957 5.00118 27.4226 4.90172C27.3496 4.80226 27.2545 4.72215 27.1454 4.66802V4.66802ZM1.67323 17.671L11.4684 13.1789C11.9539 12.9514 12.4677 12.7944 12.9951 12.7125C14.1959 12.5423 16.5281 12.498 18.6304 14.2223C19.5622 14.9697 20.3046 15.9378 20.7942 17.0443C21.2838 18.1507 21.5062 19.3626 21.4423 20.5766C21.3791 21.6746 21.0554 22.74 20.4995 23.6795C19.9435 24.619 19.1723 25.404 18.2533 25.9657L18.1855 26.0048C16.9772 26.7429 15.5769 27.0788 14.1761 26.9665C12.8314 26.861 11.4883 26.2738 10.2941 25.2644L1.67323 17.671ZM6.96284 23.9537L9.52825 26.2159C10.9209 27.3853 12.4956 28.0695 14.0851 28.1955L14.3316 28.2108L3.92603 34.1668L6.96284 23.9537ZM20.0694 10.9746C18.8873 11.7153 17.4708 11.952 16.1217 11.634C14.7726 11.3161 13.5973 10.4688 12.8462 9.27241C12.4864 8.69158 12.2433 8.0424 12.1313 7.36324C12.0194 6.68408 12.0409 5.98871 12.1946 5.31825C12.3502 4.63469 12.6375 3.99023 13.0395 3.42301C13.4416 2.85579 13.9501 2.37735 14.535 2.01603C15.7175 1.27657 17.1335 1.04071 18.4823 1.35855C19.831 1.67639 21.0062 2.52289 21.7582 3.7182C22.1188 4.29868 22.3624 4.94787 22.4743 5.62716C22.5863 6.30645 22.5644 7.00197 22.4099 7.67236C22.2546 8.35583 21.9673 9.00019 21.5653 9.56718C21.1632 10.1342 20.6545 10.6122 20.0694 10.9729V10.9746ZM23.2468 4.01949L26.0107 5.45612L23.6951 7.29278C23.8282 6.17954 23.6736 5.04986 23.2468 4.01779V4.01949ZM20.2861 26.6874C20.4571 26.698 20.6244 26.7437 20.7781 26.8217C20.9317 26.8998 21.0687 27.0086 21.1809 27.1419C21.2879 27.2671 21.3694 27.4131 21.4208 27.5712C21.4722 27.7294 21.4925 27.8965 21.4803 28.0627C21.4684 28.2308 21.4241 28.3947 21.35 28.5449C21.2759 28.6951 21.1734 28.8287 21.0486 28.9377C20.7853 29.1659 20.4459 29.2795 20.1025 29.2544C19.759 29.2293 19.4387 29.0674 19.2093 28.8032C19.1024 28.6778 19.0207 28.5319 18.969 28.3738C18.9174 28.2157 18.8967 28.0487 18.9083 27.8823C18.9385 27.5541 19.0874 27.2496 19.3254 27.0289C19.5633 26.8083 19.8732 26.6876 20.1935 26.6908C20.2242 26.6874 20.2552 26.6857 20.2861 26.6857V26.6874Z" fill="#314158"/>
</svg>
  )
}

export function TopNavbar({
  notificationCount = 67,
  avatarUrl = "/avatars/user.png",
}: {
  notificationCount?: number
  avatarUrl?: string
}) {
  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[#2E303A26] bg-background px-8">
      <div className="flex items-center">
        <Logo />
        <nav className="ml-[24px] hidden items-center gap-[4px] lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center rounded-md px-3 py-[6px] text-[14px] transition-colors ${
                "active" in item && item.active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-slate-800 hover:bg-gray-100 hover:text-slate-800"
              }`}
            >
              {item.label}
              {"dropdown" in item && item.dropdown && <ChevronDown />}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground" aria-label="Notifications">
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
