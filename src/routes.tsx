import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import { Playground } from "./Playground"
import { Playground2 } from "./Playground2"
import { PgAgent1 } from "./PgAgent1"
import { PgAgent2 } from "./PgAgent2"
import { PageTest } from "./PageTest"
import { RootLayout } from "./RootLayout"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/playground", element: <Playground /> },
      { path: "/playground2", element: <Playground2 /> },
      { path: "/pgagent1", element: <PgAgent1 /> },
      { path: "/pgagent2", element: <PgAgent2 /> },
      { path: "/page-test", element: <PageTest /> },
    ],
  },
])