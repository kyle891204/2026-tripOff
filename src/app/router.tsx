import { createBrowserRouter } from 'react-router'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/Home/HomePage'
import DemoPage from '@/pages/Demo/DemoPage'
import NotFoundPage from '@/pages/NotFound/NotFoundPage'
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
])
