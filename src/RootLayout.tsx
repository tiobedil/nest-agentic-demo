import { Agentation } from "agentation"
import { Outlet } from "react-router-dom"

export function RootLayout() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <Agentation />}
    </>
  )
}
