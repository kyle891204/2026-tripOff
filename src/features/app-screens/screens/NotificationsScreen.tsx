import { openDemoNotification, useDemoNotifications } from '@/data/demoNotifications'
import { Page } from './ExtraDemoScreens'
import { IconChevronRight } from '../parts/icons'
import { DEFAULT_PUSH, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './NotificationsScreen.module.css'

export default function NotificationsScreen({ go, back, toast }: ScreenProps) {
  const rows = useDemoNotifications()
  const unread = rows.filter(row => !row.read).length
  const push = useDemoState().push ?? DEFAULT_PUSH
  return <Page back={back} title="알림함" subtitle="여행에 필요한 소식을 한곳에서 확인해요.">
    <div className={styles.summary}><span>받은 알림</span><strong>{rows.length}<small>개</small></strong><span className={styles.count}>읽지 않음 {unread}</span></div>
    <button type="button" className={styles.pushLink} onClick={() => go('push-settings')}>
      <span><strong>푸시 알림 설정</strong><small>{(push.enabled ? '켜짐' : '꺼짐')} · 받을 알림 고르기</small></span>
      <IconChevronRight />
    </button>
    {toast && <p role="status" className={styles.hint}>{toast}</p>}
    {rows.length ? <ul className={styles.list}>
      {rows.map(row => <li key={row.id}><button type="button" className={`${styles.row} ${!row.read ? styles.fresh : ''}`} onClick={() => openDemoNotification(row, go)}>
        <span className={styles.icon} aria-hidden>♧</span><span className={styles.content}><strong>{row.title}{!row.read && <i className={styles.dot} aria-label="읽지 않음" />}</strong><span>{row.body}</span><small>{new Date(row.createdAt).toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })}</small></span>
      </button></li>)}
    </ul> : <div className={styles.empty}><div className={styles.emptyIcon} aria-hidden><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg></div><h2>아직 도착한 소식이 없어요</h2><p>바우처와 여행 일정에 새 소식이 생기면<br />이곳에서 확인할 수 있어요.</p></div>}
  </Page>
}
