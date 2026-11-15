import { useState, type ChangeEvent } from 'react'
import { Card, Field, PartnerButton as Button, partnerStyles as p, useToast } from '@/features/partner'
import { PARTNER_COMPANY_NAME } from '@/data/partnerVouchers'
import { cn } from '@/lib/cn'
import s from './CompanySettingsPage.module.css'

/** 업체 설정 초기값 (시연용 목업). 실제로는 업체 정보 API에서 불러온다. */
const INITIAL = {
  name: PARTNER_COMPANY_NAME,
  bizNo: '123-45-67890',
  owner: '김현우',
  field: '국내여행 · 투어/액티비티',
  manager: '이수진',
  phone: '064-123-4567',
  email: 'partner@jejuroadtrip.kr',
  bank: '국민은행',
  account: '1234-56-7890123',
  holder: '제주로드트립',
}

const NOTIFICATIONS = [
  { key: 'booking', title: '새 예약 알림', desc: '예약이 확정되면 알림톡으로 알려드려요.' },
  { key: 'cancel', title: '취소 알림', desc: '고객이 예약을 취소하면 알려드려요.' },
  { key: 'settle', title: '정산 완료 알림', desc: '매월 정산금이 지급되면 알려드려요.' },
] as const

type NotiKey = (typeof NOTIFICATIONS)[number]['key']

export default function CompanySettingsPage() {
  const toast = useToast()
  const [form, setForm] = useState(INITIAL)
  const [noti, setNoti] = useState<Record<NotiKey, boolean>>({ booking: true, cancel: true, settle: false })

  const set = (key: keyof typeof INITIAL) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const save = () => toast.show('업체 정보를 저장했어요.')

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <h1>업체 설정</h1>
          <p className={p.desc}>고객 앱과 바우처, 정산에 쓰이는 업체 정보를 관리하세요.</p>
        </div>
        <div className={p.actions}>
          <Button variant="primary" onClick={save}>
            저장
          </Button>
        </div>
      </header>

      <div className={s.layout}>
        <div className={s.stack}>
          <Card title="업체 정보" description="고객 앱 상품 상세와 바우처에 표시됩니다.">
            <Field label="업체명" htmlFor="c-name">
              <input id="c-name" className={p.input} value={form.name} onChange={set('name')} />
            </Field>
            <div className={p.row}>
              <Field label="사업자등록번호" htmlFor="c-biz">
                <input id="c-biz" className={p.input} value={form.bizNo} onChange={set('bizNo')} />
              </Field>
              <Field label="대표자" htmlFor="c-owner">
                <input id="c-owner" className={p.input} value={form.owner} onChange={set('owner')} />
              </Field>
            </div>
            <Field label="업종" htmlFor="c-field">
              <input id="c-field" className={p.input} value={form.field} onChange={set('field')} />
            </Field>
          </Card>

          <Card title="담당자" description="예약·정산 관련 연락을 받을 담당자예요.">
            <div className={p.row}>
              <Field label="담당자명" htmlFor="c-manager">
                <input id="c-manager" className={p.input} value={form.manager} onChange={set('manager')} />
              </Field>
              <Field label="연락처" htmlFor="c-phone">
                <input id="c-phone" className={p.input} type="tel" value={form.phone} onChange={set('phone')} />
              </Field>
            </div>
            <Field label="이메일" htmlFor="c-email">
              <input id="c-email" className={p.input} type="email" value={form.email} onChange={set('email')} />
            </Field>
          </Card>

          <Card title="정산 계좌" description="매월 정산금이 입금되는 계좌예요.">
            <div className={p.row}>
              <Field label="은행" htmlFor="c-bank">
                <input id="c-bank" className={p.input} value={form.bank} onChange={set('bank')} />
              </Field>
              <Field label="예금주" htmlFor="c-holder">
                <input id="c-holder" className={p.input} value={form.holder} onChange={set('holder')} />
              </Field>
            </div>
            <Field label="계좌번호" htmlFor="c-account">
              <input id="c-account" className={p.input} value={form.account} onChange={set('account')} />
            </Field>
          </Card>

          <Card title="알림 설정">
            <div className={s.toggles}>
              {NOTIFICATIONS.map((n) => (
                <label key={n.key} className={s.toggle}>
                  <span className={s.toggleText}>
                    <strong>{n.title}</strong>
                    <span>{n.desc}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={noti[n.key]}
                    aria-label={n.title}
                    className={s.switch}
                    onClick={() => setNoti((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                  />
                </label>
              ))}
            </div>
          </Card>
        </div>

        <aside className={cn(p.card, s.side)} aria-label="업체 요약">
          <p className={s.sideTitle}>미리보기</p>
          <div className={s.profile}>
            <span className={s.logo}>{form.name.slice(0, 1) || '제'}</span>
            <span>
              <span className={s.profileName}>{form.name || '업체명'}</span>
              <span className={s.profileSub} style={{ display: 'block' }}>
                {form.field || '업종'}
              </span>
            </span>
          </div>
          <dl className={s.meta}>
            <div>
              <dt>대표자</dt>
              <dd>{form.owner || '-'}</dd>
            </div>
            <div>
              <dt>담당자</dt>
              <dd>{form.manager || '-'}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{form.phone || '-'}</dd>
            </div>
            <div>
              <dt>정산 계좌</dt>
              <dd>
                {form.bank} {form.account.slice(-4).padStart(form.account.length, '•')}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
      {toast.node}
    </main>
  )
}
