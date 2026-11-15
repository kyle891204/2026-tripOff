import { Link, NavLink } from 'react-router'
import { SITE } from '@/data/site'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'
import Container from '@/components/ui/Container'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link to={ROUTES.home} className={styles.logo}>
          {SITE.name}
        </Link>
        <nav className={styles.nav}>
          {SITE.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => cn(styles.link, isActive && styles.active)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </header>
  )
}
