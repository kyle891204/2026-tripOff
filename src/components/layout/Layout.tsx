import { Outlet } from 'react-router'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

export default function Layout() {
  useScrollToTop()
  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
