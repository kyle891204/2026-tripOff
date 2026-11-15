import { createBrowserRouter, Navigate } from 'react-router'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/Home/HomePage'
import DemoPage from '@/pages/Demo/DemoPage'
import NotFoundPage from '@/pages/NotFound/NotFoundPage'
import ScreenOnlyPage from '@/pages/ScreenOnly/ScreenOnlyPage'
import { PartnerLayout } from '@/features/partner'
import ProductListPage from '@/pages/Partner/ProductListPage'
import ProductRegisterPage from '@/pages/Partner/ProductRegisterPage'
import VoucherManagementPage from '@/pages/Partner/VoucherManagementPage'
import { ROUTES } from '@/lib/routes'

export const router = createBrowserRouter([
  {
    // 파트너센터: 사이트 Header/Footer 없이 전용 사이드바 레이아웃
    element: <PartnerLayout />,
    children: [
      { path: ROUTES.partnerProducts, element: <ProductListPage /> },
      { path: ROUTES.partnerProductNew, element: <ProductRegisterPage /> },
      { path: ROUTES.partnerVouchers, element: <VoucherManagementPage /> },
    ],
  },
  { path: ROUTES.partner, element: <Navigate to={ROUTES.partnerProducts} replace /> },
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
