import { useState, type ChangeEvent } from 'react'
import { Card, Field, PartnerButton as Button, partnerStyles as p, useCompany, useToast } from '@/features/partner'
import type { CompanyProfile } from '@/data/partnerCompany'
import { cn } from '@/lib/cn'
import s from './CompanySettingsPage.module.css'

const NOTIFICATIONS = [
  { key: 'booking', title: '새 예약 알림', desc: '예약이 확정되면 알림톡으로 알려드려요.' },
  { key: 'cancel', title: '취소 알림', desc: '고객이 예약을 취소하면 알려드려요.' },
  { key: 'settle', title: '정산 완료 알림', desc: '매월 정산금이 지급되면 알려드려요.' },
] as const

type NotiKey = (typeof NOTIFICATIONS)[number]['key']

export default function CompanySettingsPage() {
  const toast = useToast()
  const { company, setCompany } = useCompany()
  // 저장된 값을 초안으로 복제해 편집하고, '저장'을 눌러야 공용 저장소에 반영된다.
  const [form, setForm] = useState<CompanyProfile>(company)

  const set = (key: keyof CompanyProfile) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const toggle = (key: NotiKey) =>
    setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: !prev.notifications[key] } }))

  const dirty = JSON.stringify(form) !== JSON.stringify(company)

  const save = () => {
    setCompany(form)
    toast.show('업체 정보를 저장했어요.')
  }

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <h1>업체 설정</h1>
          <p className={p.desc}>고객 앱과 바우처, 정산에 쓰이는 업체 정보를 관리하세요. 저장하면 사이드바와 대시보드, 바우처 미리보기에 바로 반영됩니다.</p>
        </div>
        <div className={p.actions}>
          <Button variant="secondary" disabled={!dirty} onClick={() => setForm(company)}>
            되돌리기
          </Button>
          <Button variant="primary" disabled={!dirty} onClick={save}>
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
                    aria-checked={form.notifications[n.key]}
                    aria-label={n.title}
                    className={s.switch}
                    onClick={() => toggle(n.key)}
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
