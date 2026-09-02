import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import { Playground } from "./Playground"
import { PageTest } from "./PageTest"
import { RootLayout } from "./RootLayout"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/playground", element: <Playground /> },
      { path: "/page-test", element: <PageTest /> },
    ],
  },
])