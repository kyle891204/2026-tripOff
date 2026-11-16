/**
 * 마이페이지 하위 화면: 구매 내역 · 구매 상세(결제 취소 · 환불 요청) · 지난 여행 · 즐겨찾기 · 푸시 알림 설정
 */
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { won } from '@/features/partner/calc'
import { pushDemoNotification } from '@/data/demoNotifications'
import Avatar from '../parts/Avatar'
import { ScreenLayer } from '../parts/Auth'
import auth from '../parts/Auth.module.css'
import { IconChevronRight } from '../parts/icons'
import { useToast } from '../parts/useToast'
import { useShopProducts } from '../shopCatalog'
import {
  DEFAULT_PUSH, ORDER_STATUS_LABEL, allOrders, orderNo, canCancel, cancelOrder, orderStatus, pastTrips, requestRefund,
  setDemoState, toggleFavorite, tripPlans, useCurrentTrip, useDemoState, type OrderStatus, type PushSettings,
} from '../store'
import type { ScreenProps } from '../types'
import { Page } from './ExtraDemoScreens'
import { ShopPhoto } from './ShopScreens'
import styles from './MyPageScreens.module.css'

const shortDate = (iso: string) => iso.slice(5).replace('-', '.')
const STATUS_TONE: Record<OrderStatus, string> = { paid: styles.stPaid, used: styles.stUsed, cancelled: styles.stCancelled, 'refund-requested': styles.stRefund }

/* ------------------------------ 구매 내역 ------------------------------ */

export function OrdersScreen({ go, back, toast: initial }: ScreenProps) {
  const demo = useDemoState()
  const orders = allOrders(demo)
  const [toast] = useToast(initial)
  return (
    <Page back={back} title="구매 내역" subtitle="여행 발견에서 결제한 상품이에요">
      {orders.length ? (
        <ul className={styles.list}>
          {orders.map((o) => {
            const st = orderStatus(o, demo)
            return (
              <li key={o.id}>
                <button type="button" className={styles.orderRow} onClick={() => { setDemoState({ orderId: o.id }); go('order-detail') }}>
                  <span className={styles.orderTop}>
                    <span className={cn(styles.status, STATUS_TONE[st])}>{ORDER_STATUS_LABEL[st]}</span>
                    <small>{o.paidAt ? `${shortDate(o.paidAt.slice(0, 10))} 결제` : ''}</small>
                  </span>
                  <strong className={cn(st === 'cancelled' && styles.struck)}>{o.title}</strong>
                  <span className={styles.orderMeta}>{o.seller} · 이용 {shortDate(o.date)} {o.time} · {o.count}명</span>
                  <span className={styles.orderBottom}>
                    <b>{won(o.price * o.count)}</b>
                    <span>상세보기 <IconChevronRight /></span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className={styles.empty}><strong>구매한 상품이 없어요</strong><p>여행 발견에서 투어 · 액티비티를 담아 보세요.</p></div>
      )}
      {toast}
    </Page>
  )
}

const REASONS = ['일정이 바뀌었어요', '현지 사정으로 이용하지 못했어요', '상품 정보와 달랐어요', '기타']

export function OrderDetailScreen({ go, back }: ScreenProps) {
  const demo = useDemoState()
  const order = allOrders(demo).find((o) => o.id === demo.orderId)
  const [sheet, setSheet] = useState<'cancel' | 'refund'>()
  const [reason, setReason] = useState(REASONS[0])
  const [detail, setDetail] = useState('')
  const [toast, showToast] = useToast()

  if (!order) return <Page back={back} title="구매 상세" subtitle="구매 내역에서 상품을 골라 주세요"><button type="button" className={styles.primary} onClick={() => go('orders')}>구매 내역으로</button></Page>

  const st = orderStatus(order, demo)
  const change = demo.orderChanges?.[order.id]
  const total = order.price * order.count
  const planId = order.planId ?? 'shop-' + order.id

  return (
    <Page back={back} title="구매 상세" subtitle={`주문번호 ${orderNo(order)}`}>
      <div className={styles.card}>
        <span className={cn(styles.status, STATUS_TONE[st])}>{ORDER_STATUS_LABEL[st]}</span>
        <h2 className={styles.detailTitle}>{order.title}</h2>
        <p className={styles.seller}>{order.seller}</p>
        <dl className={styles.dl}>
          <div><dt>이용일</dt><dd>{order.date} {order.time}</dd></div>
          <div><dt>인원</dt><dd>성인 {order.count}명</dd></div>
          <div><dt>예약번호</dt><dd>{orderNo(order)}</dd></div>
          <div><dt>결제일</dt><dd>{order.paidAt?.replace('T', ' ').slice(0, 16) ?? '-'}</dd></div>
        </dl>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardLabel}>결제 정보</h3>
        <dl className={styles.dl}>
          <div><dt>상품 금액</dt><dd>{won(order.price)} × {order.count}</dd></div>
          <div><dt>결제 수단</dt><dd>시연용 카드 (****-1234)</dd></div>
          <div className={styles.totalRow}><dt>총 결제 금액</dt><dd>{won(total)}</dd></div>
        </dl>
      </div>

      {change && (
        <div className={cn(styles.card, styles.changeCard)}>
          <h3 className={styles.cardLabel}>{change.status === 'cancelled' ? '결제 취소 완료' : '환불 요청 접수'}</h3>
          <p>{change.status === 'cancelled'
            ? `${won(total)}이 결제 수단으로 돌아가요 (3~5 영업일). 여행 일정에서도 빠졌어요.`
            : `사유: ${change.reason}. ${order.seller}에서 확인한 뒤 결과를 알림으로 보내 드려요.`}</p>
        </div>
      )}

      <div className={styles.actions}>
        {st !== 'cancelled' && (
          <button type="button" className={styles.secondary} onClick={() => { setDemoState({ tripId: order.tripId, planId, voucherTarget: undefined, draft: undefined }); go('plan') }}>
            일정 · 바우처 보기
          </button>
        )}
        {canCancel(order, demo) && <button type="button" className={styles.danger} onClick={() => setSheet('cancel')}>결제 취소</button>}
        {(st === 'paid' || st === 'used') && !canCancel(order, demo) && <button type="button" className={styles.danger} onClick={() => setSheet('refund')}>환불 요청</button>}
      </div>
      {st === 'paid' && canCancel(order, demo) && <p className={styles.notice}>이용일 전날까지는 바로 전액 취소돼요. 이후에는 여행사에 환불을 요청해요.</p>}

      {sheet && (
        <ScreenLayer>
          <button type="button" className={auth.dim} aria-label="닫기" onClick={() => setSheet(undefined)} />
          <div className={cn(auth.sheet, styles.sheet)} role="dialog" aria-modal="true" aria-label={sheet === 'cancel' ? '결제 취소' : '환불 요청'}>
            <span className={auth.handle} aria-hidden />
            <h2 className={auth.title}>{sheet === 'cancel' ? '결제를 취소할까요?' : '환불을 요청할까요?'}</h2>
            <p className={auth.desc}>{sheet === 'cancel'
              ? `${won(total)} 전액이 환불되고, 여행 일정과 바우처도 함께 빠져요.`
              : `${order.seller}에서 확인 후 처리돼요. 사유를 골라 주세요.`}</p>
            {sheet === 'refund' && (
              <div className={styles.reasons} role="radiogroup" aria-label="환불 사유">
                {REASONS.map((r) => (
                  <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)}>{r}</button>
                ))}
                <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="자세한 내용 (선택)" maxLength={200} aria-label="자세한 내용" />
              </div>
            )}
            <div className={styles.sheetButtons}>
              <button type="button" className={styles.secondary} onClick={() => setSheet(undefined)}>닫기</button>
              <button type="button" className={styles.dangerSolid} onClick={() => {
                if (sheet === 'cancel') { cancelOrder(order); showToast('결제를 취소했어요') }
                else { requestRefund(order, detail.trim() ? `${reason} — ${detail.trim()}` : reason); showToast('환불을 요청했어요') }
                setSheet(undefined)
              }}>{sheet === 'cancel' ? '결제 취소' : '환불 요청'}</button>
            </div>
          </div>
        </ScreenLayer>
      )}
      {toast}
    </Page>
  )
}

/* ------------------------------ 지난 여행 ------------------------------ */

export function PastTripsScreen({ go, back }: ScreenProps) {
  const demo = useDemoState()
  const trips = pastTrips(demo)
  return (
    <Page back={back} title="지난 여행" subtitle="다녀온 여행의 일정과 바우처를 다시 볼 수 있어요">
      {trips.length ? (
        <ul className={styles.list}>
          {trips.map((t) => (
            <li key={t.id}>
              <button type="button" className={cn(styles.tripCard, t.tone === 'teal' && styles.tripTeal)} onClick={() => { setDemoState({ tripId: t.id, dayIndex: 0 }); go('timeline') }}>
                <span className={styles.tripTop}>
                  <strong>{t.name}</strong>
                  <span>{t.period}</span>
                </span>
                <span className={styles.tripBottom}>
                  <span className={styles.avatars}>{t.members.map((m) => <Avatar key={m.name} label={m.label} name={m.name} tone={m.tone} size={24} fontSize={11} ring={{ width: 2, color: t.tone === 'teal' ? 'var(--trip-teal)' : 'var(--deep)' }} />)}</span>
                  <span>일정 {tripPlans(t, demo).length}개 <IconChevronRight /></span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}><strong>아직 다녀온 여행이 없어요</strong></div>
      )}
    </Page>
  )
}

/* ------------------------------ 즐겨찾기 ------------------------------ */

export function FavoritesScreen({ go, back }: ScreenProps) {
  const demo = useDemoState()
  const products = useShopProducts()
  const favs = (demo.favorites ?? []).map((id) => products.find((p) => p.id === id)).filter((p) => !!p)
  return (
    <Page back={back} title="즐겨찾기" subtitle="여행 발견에서 하트를 누른 상품이에요">
      {favs.length ? (
        <ul className={styles.list}>
          {favs.map((p) => {
            const prices = p.options.map((o) => Number(o.adult)).filter((n) => n > 0)
            return (
              <li key={p.id} className={styles.favRow}>
                <button type="button" className={styles.favMain} onClick={() => { setDemoState({ shopProductId: p.id, shopBooking: undefined }); go('shop-product') }}>
                  <ShopPhoto src={p.image} alt="" className={styles.favPhoto} />
                  <span className={styles.favText}>
                    <small>{p.seller} · {p.destination}</small>
                    <strong>{p.name}</strong>
                    <b>{prices.length ? won(Math.min(...prices)) + '부터' : '매진'}</b>
                  </span>
                </button>
                <button type="button" className={styles.heart} aria-label={`${p.name} 즐겨찾기 해제`} aria-pressed onClick={() => toggleFavorite(p.id)}>
                  <HeartIcon on />
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          <strong>즐겨찾기한 상품이 없어요</strong>
          <p>여행 발견에서 마음에 드는 상품의 하트를 눌러 보세요.</p>
          <button type="button" className={styles.primary} onClick={() => { setDemoState({ shopCountry: undefined, shopDestination: undefined }); go('shop') }}>여행 발견 둘러보기</button>
        </div>
      )}
    </Page>
  )
}

export function HeartIcon({ on }: { on?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden>
      <path d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.2-7.5 10.2Z" />
    </svg>
  )
}

/* ------------------------------ 푸시 알림 설정 ------------------------------ */

const PUSH_ROWS: { key: Exclude<keyof PushSettings, 'enabled'>; label: string; desc: string }[] = [
  { key: 'voucher', label: '바우처 · 일정 변경', desc: '여행사가 일정이나 바우처를 바꾸면 알려요' },
  { key: 'entry', label: '입장 · 출발 알림', desc: '일정 30분 전에 QR과 집결지를 알려요' },
  { key: 'companion', label: '동행 소식', desc: '동행 초대 수락, 정산 요청을 알려요' },
  { key: 'marketing', label: '혜택 · 이벤트', desc: '여행 발견 특가와 쿠폰 소식 (선택)' },
]

type Permission = NotificationPermission | 'unsupported'
const permissionNow = (): Permission => ('Notification' in window ? Notification.permission : 'unsupported')

export function PushSettingsScreen({ back }: ScreenProps) {
  const demo = useDemoState()
  const push = demo.push ?? DEFAULT_PUSH
  const trip = useCurrentTrip()
  const [permission, setPermission] = useState<Permission>(permissionNow)
  const [toast, showToast] = useToast()

  const set = (patch: Partial<PushSettings>) => setDemoState({ push: { ...push, ...patch } })
  const turnOn = async () => {
    // 기기 알림 권한도 함께 요청 (거절해도 앱 안 알림함은 계속 받음)
    if (permission === 'default') setPermission(await Notification.requestPermission())
    set({ enabled: true })
  }
  const test = async () => {
    let now = permission
    if (now === 'default') { now = await Notification.requestPermission(); setPermission(now) }
    pushDemoNotification({ title: '테스트 알림', body: '푸시 알림이 이렇게 도착해요.', tripId: trip.id, planId: tripPlans(trip, demo)[0]?.id ?? '' })
    if (now === 'granted') new Notification('TripOff', { body: '푸시 알림이 이렇게 도착해요.' })
    showToast(now === 'granted' ? '기기 알림과 알림함에 보냈어요' : '알림함에 보냈어요')
  }

  const deviceNote = {
    granted: '이 기기의 알림이 허용돼 있어요.',
    default: '이 기기의 알림 권한은 아직 묻지 않았어요. 테스트 알림을 보내면 허용 여부를 물어봐요.',
    denied: '이 기기에서 알림이 차단돼 있어요. 브라우저 · 기기 설정에서 허용해 주세요. 앱 안 알림함으로는 계속 받아요.',
    unsupported: '이 브라우저는 기기 알림을 지원하지 않아 앱 안 알림함으로만 받아요.',
  }[permission]

  return (
    <Page back={back} title="푸시 알림 설정" subtitle="받고 싶은 알림만 골라요">
      <div className={styles.card}>
        <SwitchRow label="푸시 알림 받기" desc={deviceNote} on={push.enabled} onChange={() => (push.enabled ? set({ enabled: false }) : void turnOn())} />
      </div>
      <h3 className={styles.groupLabel}>알림 종류</h3>
      <div className={cn(styles.card, !push.enabled && styles.off)}>
        {PUSH_ROWS.map((r) => (
          <SwitchRow key={r.key} label={r.label} desc={r.desc} on={push.enabled && push[r.key]} disabled={!push.enabled} onChange={() => set({ [r.key]: !push[r.key] })} />
        ))}
      </div>
      <button type="button" className={styles.secondary} disabled={!push.enabled} onClick={() => void test()}>테스트 알림 보내기</button>
      {toast}
    </Page>
  )
}

function SwitchRow({ label, desc, on, disabled, onChange }: { label: string; desc: string; on: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} className={styles.switchRow} onClick={onChange}>
      <span className={styles.switchText}><strong>{label}</strong><span>{desc}</span></span>
      <span className={cn(styles.switch, on && styles.switchOn)} aria-hidden />
    </button>
  )
}

