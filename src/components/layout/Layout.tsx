import { Outlet, useMatch } from 'react-router'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/lib/routes'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

export default function Layout() {
  useScrollToTop()
  const isDemo = !!useMatch(ROUTES.demo)
  return (
    <div className={cn(styles.root, isDemo && styles.demo)}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
