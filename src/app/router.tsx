import { createBrowserRouter } from 'react-router'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/Home/HomePage'
import DemoPage from '@/pages/Demo/DemoPage'
import NotFoundPage from '@/pages/NotFound/NotFoundPage'
import ScreenOnlyPage from '@/pages/ScreenOnly/ScreenOnlyPage'
import { ROUTES } from '@/lib/routes'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.demo, element: <DemoPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // 사이트 레이아웃 없이 앱 화면만
  { path: ROUTES.screen, element: <ScreenOnlyPage /> },
])
