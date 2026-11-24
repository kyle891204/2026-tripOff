import { useState } from 'react'
import { cn } from '@/lib/cn'
import InquiryPanel from '../parts/InquiryPanel'
import PlanIcon from '../parts/PlanIcon'
import QrCode from '../parts/QrCode'
import { SecureQr } from '../parts/Auth'
import Screen from '../parts/Screen'
import { IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { dateAt, sourceLabel, voucherOf } from '../mock'
import { allTrips, canLeaveTrip, editPlan, hasVoucher, moveSoloToTrip, moveTripPlanToSolo, setDemoState, tripPlans, useCurrentPlan, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './PlanDetailScreen.module.css'

/**
 * ⚠ 임시 화면 — 하이파이 없음 (로우파이 「07 바우처 상세」 역할).
 * 일정 정보 + 바우처. 모든 일정에서 바우처를 수정할 수 있고,
 * 여행사가 바우처 없이 일정만 보냈으면 여기서 직접 등록한다. 문제가 있으면 문의.
 * 「일정 수정」에서 여행 밖 일정을 여행에 넣거나, 내가 추가한 일정을 여행에서 뺄 수 있다.
 */
export default function PlanDetailScreen({ go, back, toast: initialToast }: ScreenProps) {
  const trip = useCurrentTrip()
  const activePlan = useCurrentPlan()
  const plan = activePlan ?? tripPlans(trip)[0] ?? trip.plans[0]
  const demo = useDemoState()
  const [toast, showToast] = useToast(initialToast)
  const [help, setHelp] = useState(false)
  // 일정 수정 (제목·시간·장소)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: '', time: '', location: '', tripId: '', date: '' })
  const planDate = dateAt(trip, plan.day)
  // 여행을 바꿀 수 있는 일정: 여행 밖 일정, 또는 여행에 내가 추가한 · 산 일정
  const movable = !plan.owner && (!!trip.solo || canLeaveTrip(plan.id, trip.id, demo))
  const trips = allTrips(demo)
  const nextTrip = trips.find((t) => t.id === draft.tripId)
  const nextDays = nextTrip ? nextTrip.days.map((_, i) => dateAt(nextTrip, i)) : []

  const startEdit = () => {
    setDraft({ title: plan.title, time: plan.time, location: plan.location ?? '', tripId: trip.solo ? '' : trip.id, date: planDate })
    setEditing(true)
  }
  const pickTrip = (tripId: string) => {
    const t = trips.find((x) => x.id === tripId)
    const days = t ? t.days.map((_, i) => dateAt(t, i)) : []
    // 이용일이 그 여행 기간 밖이면 여행 첫날로 맞추고 날짜를 고르게 함
    setDraft({ ...draft, tripId, date: !t || days.includes(planDate) ? planDate : days[0] })
  }
  const saveEdit = () => {
    editPlan(plan.id, { title: draft.title.trim() || plan.title, time: draft.time, location: draft.location.trim() || undefined })
    const from = trip.solo ? '' : trip.id
    let message = '일정을 수정했어요'
    if (movable && draft.tripId !== from) {
      if (from) moveTripPlanToSolo(plan.id, from)
      if (nextTrip) {
        moveSoloToTrip(plan.id, nextTrip.id, draft.date)
        message = `「${nextTrip.name}」 여행에 넣었어요`
      } else message = '여행에서 빼고 내 일정에 따로 보관했어요'
    }
    setEditing(false)
    showToast(message)
  }

  const agency = plan.source.kind === 'agency' ? plan.source.name : undefined
  const provider = plan.source.kind === 'self' ? plan.source.via : undefined
  const voucher = voucherOf(plan, trip)
  const has = hasVoucher(plan, demo)

  const startVoucher = (mode: 'register' | 'edit') => {
    setDemoState({ planId: plan.id, draft: undefined, voucherTarget: { planId: plan.id, mode } })
    go(mode === 'register' ? 'add-voucher' : 'review')
  }

  return (
    <Screen bg="var(--mist)" label="일정 상세">
      <button type="button" className={shared.back} aria-label="뒤로" onClick={back}>
        <IconBack />
      </button>

      {editing ? (
        <div className={styles.editBar}>
          <button type="button" className={styles.editCancel} onClick={() => setEditing(false)}>
            취소
          </button>
          <button type="button" className={styles.editSave} onClick={saveEdit}>
            저장
          </button>
        </div>
      ) : (
        <button type="button" className={cn(styles.editBtn, shared.tappable)} onClick={startEdit}>
          일정 수정
        </button>
      )}

      <div className={styles.flow}>
      <div className={styles.head}>
        <PlanIcon kind={plan.icon} agency={agency} />
        <p className={styles.source}>{sourceLabel(plan)}</p>
        {editing ? (
          <div className={styles.form}>
            <input
              className={styles.titleInput}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              aria-label="일정 제목"
              autoFocus
            />
            <div className={styles.formRow}>
              <label>
                <span>
                  {dateAt(trip, plan.day)}
                </span>
                <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} aria-label="시간" />
              </label>
              <label className={styles.grow}>
                <span>장소</span>
                <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="집결지·주소" aria-label="장소" />
              </label>
            </div>
            {movable && (
              <div className={styles.formRow}>
                <label className={styles.grow}>
                  <span>여행</span>
                  <select value={draft.tripId} onChange={(e) => pickTrip(e.target.value)} aria-label="넣을 여행">
                    <option value="">여행에 넣지 않음</option>
                    {trips.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.period}</option>)}
                  </select>
                </label>
                {nextTrip && !nextDays.includes(planDate) && (
                  <label>
                    <span>날짜</span>
                    <select value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} aria-label="여행 중 날짜">
                      {nextDays.map((d) => <option key={d} value={d}>{d.slice(5).replace('-', '.')}</option>)}
                    </select>
                  </label>
                )}
              </div>
            )}
            {movable && nextTrip && !nextDays.includes(planDate) && <p className={styles.moveNote}>이용일({planDate.slice(5).replace('-', '.')})이 여행 기간 밖이라 여행 중 날짜를 골라 주세요.</p>}
          </div>
        ) : (
          <>
            <h1 className={styles.title}>{plan.title}</h1>
            <p className={styles.when}>
              {voucher.date} · {plan.time}
              {plan.location && ` · ${plan.location}`}
            </p>
            <p className={cn(styles.tripLine, trip.solo && styles.tripLineSolo)}>
              {trip.solo ? '여행 외 일정' : `「${trip.name}」 여행`}
              {trip.solo && movable && ' · 일정 수정에서 여행에 넣을 수 있어요'}
            </p>
          </>
        )}
      </div>

      <section className={styles.card} aria-label="바우처">
        <div className={styles.cardHead}>
          <h2>바우처</h2>
          {has && demo.edited[plan.id] && <span className={styles.tag}>수정됨</span>}
          {has && demo.registered[plan.id] && <span className={styles.tag}>직접 등록</span>}
        </div>

        {has ? (
          <>
            <div className={styles.voucher}>
              <span className={styles.qr}>
                {voucher.qrValue ? <SecureQr size={84}><QrCode value={voucher.qrValue} size={84} /></SecureQr> : <span>QR 없음</span>}
              </span>
              <dl className={styles.fields}>
                <div>
                  <dt>예약번호</dt>
                  <dd>{voucher.code}</dd>
                </div>
                <div>
                  <dt>이용</dt>
                  <dd>
                    {voucher.date} {voucher.time}
                  </dd>
                </div>
                <div>
                  <dt>인원</dt>
                  <dd>내 티켓 · {voucher.people}</dd>
                </div>
              </dl>
            </div>
            <div className={styles.actions}>
              <button type="button" className={cn(styles.primary, shared.tappable)} onClick={() => { setDemoState({ planId: plan.id }); go(voucher.qrValue ? 'ticket' : 'voucher-original') }}>
                {voucher.qrValue ? 'QR 크게 보기' : '원본 보기'}
              </button>
              <button type="button" className={cn(styles.secondary, shared.tappable)} onClick={() => startVoucher('edit')}>
                바우처 수정
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.missing}>
              <strong>{agency}에서 아직 바우처를 보내지 않았어요</strong>
              <span>예약 확정 메일이나 캡처가 있다면 직접 등록할 수 있어요</span>
            </div>
            <div className={styles.actions}>
              <button type="button" className={cn(styles.primary, shared.tappable)} onClick={() => startVoucher('register')}>
                바우처 직접 등록
              </button>
            </div>
          </>
        )}
      </section>
      </div>

      <button type="button" className={cn(styles.help, shared.tappable)} onClick={() => setHelp(true)}>
        바우처에 문제가 있나요? <strong>문의하기</strong>
      </button>

      {help && (
        <>
          <button type="button" className={styles.dim} aria-label="닫기" onClick={() => setHelp(false)} />
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="문의하기">
            <span className={styles.handle} aria-hidden />
            <h2 className={styles.sheetTitle}>문의하기</h2>
            <InquiryPanel
              agency={agency}
              provider={provider}
              subject={`「${plan.title}」 바우처`}
              onDone={(m) => {
                setHelp(false)
                showToast(m)
              }}
            />
          </div>
        </>
      )}

      {toast}
    </Screen>
  )
}
