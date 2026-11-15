import { Link, NavLink, Outlet } from 'react-router'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'
import { ProductStoreContext, useProductStoreValue } from './productStore'
import { VoucherStoreContext, useVoucherStoreValue } from './voucherStore'
import { CompanyStoreContext, useCompanyStoreValue } from './companyStore'
import styles from './PartnerLayout.module.css'

const MENU: Array<{ label: string; to?: string }> = [
  { label: '대시보드', to: ROUTES.partnerDashboard },
  { label: '상품 등록·관리', to: ROUTES.partnerProducts },
  { label: '바우처 관리', to: ROUTES.partnerVouchers },
  { label: '예약 현황', to: ROUTES.partnerReservations },
  { label: '정산', to: ROUTES.partnerSettlement },
  { label: '업체 설정', to: ROUTES.partnerSettings },
]

/** 파트너센터(여행사 관리자) 전용 레이아웃. 사이트 Header/Footer 없이 사이드바만 쓴다. */
export default function PartnerLayout() {
  useScrollToTop()
  const productStore = useProductStoreValue()
  const voucherStore = useVoucherStoreValue()
  const companyStore = useCompanyStoreValue()
  return (
    <ProductStoreContext value={productStore}>
      <VoucherStoreContext value={voucherStore}>
        <CompanyStoreContext value={companyStore}>
          <div className={styles.root}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarInner}>
                <div className={styles.brand}>
                  <p className={styles.logo}>
                    TripOff <span>Partners</span>
                  </p>
                  <p className={styles.company}>{companyStore.company.name} 관리자</p>
                </div>
                <nav aria-label="파트너센터 메뉴">
                  <ul className={styles.menu}>
                    {MENU.map(({ label, to }) => (
                      <li key={label}>
                        {to ? (
                          <NavLink to={to} className={({ isActive }) => cn(styles.navItem, isActive && styles.active)}>
                            {label}
                          </NavLink>
                        ) : (
                          <span className={cn(styles.navItem, styles.disabled)} title="시연 범위 밖 메뉴">
                            {label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
                <Link to={ROUTES.demo} className={styles.back}>
                  ← 사용자 앱 시연으로
                </Link>
              </div>
            </aside>
            <Outlet />
          </div>
        </CompanyStoreContext>
      </VoucherStoreContext>
    </ProductStoreContext>
  )
}
