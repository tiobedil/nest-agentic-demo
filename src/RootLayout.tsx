import { Agentation } from "agentation"
import { Outlet } from "react-router-dom"
import { TopNavbar } from "@/components/TopNavbar"

export function RootLayout() {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopNavbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}
