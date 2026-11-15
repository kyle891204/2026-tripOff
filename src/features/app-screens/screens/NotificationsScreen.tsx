import { useState } from 'react'
import { notifyUpcomingDemo, openDemoNotification, useDemoNotifications } from '@/data/demoNotifications'
import Screen from '../parts/Screen'
import { IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import type { ScreenProps } from '../types'
import ui from './ExtraDemoScreens.module.css'
import styles from './NotificationsScreen.module.css'

export default function NotificationsScreen({ go, back, toast }: ScreenProps) {
  const rows = useDemoNotifications()
  const [hint, setHint] = useState('')
  return <Screen bg="var(--mist)" label="알림함">
    <button type="button" aria-label="뒤로" className={shared.back} onClick={back}><IconBack /></button>
    <div className={ui.body}>
      <h1 className={ui.title}>알림</h1>
      <p className={ui.sub}>바우처 발송·변경과 입장 알림을 확인해요.</p>
      <div className={ui.buttons}>
        <button type="button" onClick={() => setHint(notifyUpcomingDemo() ? '시연용 입장 알림을 표시했어요.' : '저장된 입장권이 없어요.')}>입장 알림 시연</button>
      </div>
      {(hint || toast) && <p role="status" className={styles.hint}>{hint || toast}</p>}
      {rows.length ? <ul className={styles.list}>
        {rows.map(row => <li key={row.id}><button type="button" className={styles.row} onClick={() => openDemoNotification(row, go)}>
          <strong>{!row.read && <span className={styles.unread}>새 알림 · </span>}{row.title}</strong>
          <span>{row.body}</span>
          <small>{new Date(row.createdAt).toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })}</small>
        </button></li>)}
      </ul> : <div className={ui.card}><p>아직 받은 알림이 없어요.</p></div>}
    </div>
  </Screen>
}
