import { useEffect, useState } from 'react'
import { DEMO_AGENCY_TRIP_ID, DEMO_DELIVERY_ID, getDemoDeliveries } from '@/data/demoDelivery'
import Screen from '../parts/Screen'
import QrCode from '../parts/QrCode'
import { IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { ME, NEXT_ENTRY, voucherOf } from '../mock'
import { setDemoState, useCurrentPlan, useCurrentTrip } from '../store'
import { detectImageQr, fileRecord } from '../voucherFiles'
import type { ScreenProps } from '../types'
import styles from './ExtraDemoScreens.module.css'

function Page({ back, title, subtitle, children }: {
  back: () => void; title: string; subtitle: string; children: React.ReactNode
}) {
  return <Screen bg="var(--mist)" label={title}>
    <button type="button" aria-label="뒤로" className={shared.back} onClick={back}><IconBack /></button>
    <div className={styles.body}><h1 className={styles.title}>{title}</h1><p className={styles.sub}>{subtitle}</p>{children}</div>
  </Screen>
}

export function VoucherImportScreen({ go, back }: ScreenProps) {
  const trip = useCurrentTrip()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const select = async (file: File) => {
    if (file.size > 10 * 1024 * 1024 || !['application/pdf','image/png','image/jpeg','image/webp'].includes(file.type)) {
      setError('10MB 이하의 PDF, JPG, PNG, WebP 파일을 선택해 주세요.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const id = crypto.randomUUID()
      const qrValue = await detectImageQr(file)
      await fileRecord(id, file)
      setDemoState({ draft: { kind: 'file', original: { id, name: file.name }, qrValue } })
      go('review')
    } catch { setError('파일을 기기에 저장할 수 없어요. 다시 선택해 주세요.') }
    finally { setBusy(false) }
  }
  return <Page back={back} title="원본 파일 선택" subtitle="PDF 또는 사진을 기기에 저장해 바우처에 첨부해요.">
    <div className={styles.card}>
      <label htmlFor="voucher-file">바우처 파일</label>
      <input id="voucher-file" className={styles.file} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={busy} onChange={e => {
        const file = e.currentTarget.files?.[0]
        e.currentTarget.value = ''
        if (file) void select(file)
      }} />
      {busy && <p role="status">파일을 저장하고 있어요…</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    <div className={styles.card}>
      <h2>샘플로 시연하기</h2><p>{trip.sample.file}</p>
      <p className={styles.sub}>샘플은 추출 결과와 QR이 미리 준비돼 있어요.</p>
      <div className={styles.buttons}><button className={styles.primary} onClick={() => { setDemoState({ draft: { kind: 'sample' } }); go('review') }}>샘플 바우처 사용</button></div>
    </div>
  </Page>
}

export function VoucherOriginalScreen({ back }: ScreenProps) {
  const trip = useCurrentTrip()
  const plan = useCurrentPlan()
  const data = plan ? voucherOf(plan, trip) : { ...trip.sample, ...NEXT_ENTRY }
  const original = plan?.original
  const [preview, setPreview] = useState<{url: string; type: string}>()
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    if (!original) return
    let disposed = false
    let url: string | undefined
    void fileRecord(original.id).then(file => {
      if (disposed) return
      if (!file) { setUnavailable(true); return }
      url = URL.createObjectURL(file)
      setPreview({ url, type: file.type })
    }).catch(() => { if (!disposed) setUnavailable(true) })
    return () => { disposed = true; if (url) URL.revokeObjectURL(url) }
  }, [original])
  return <Page back={back} title="원본 바우처" subtitle={data.file}>
    {original ? <div className={styles.card}>
      {preview ? <>
        {preview.type.startsWith('image/') ? <img className={styles.preview} src={preview.url} alt="첨부한 바우처 원본" /> : <iframe className={styles.preview} src={preview.url} title="첨부한 PDF 원본" />}
        <div className={styles.buttons}><a href={preview.url} download={original.name}>원본 다운로드</a></div>
      </> : <p role="status">{unavailable ? '기기에 저장된 원본을 찾을 수 없어요.' : '기기에서 원본을 불러오는 중이에요.'}</p>}
    </div> : <div className={styles.card}>
      <p>시연용 샘플</p><h2>{data.title}</h2><p>{data.date} · {data.time}</p><p>예약번호 {data.code}</p>
      {data.qrValue && <QrCode value={data.qrValue} size={132} />}
    </div>}
  </Page>
}

export function ProfileScreen({ go, back }: ScreenProps) {
  return <Page back={back} title="내 프로필" subtitle="트립오프 시연 계정">
    <div className={styles.card}><h2>{ME.name}</h2><p>여행자 · 시연 모드</p></div>
    <div className={styles.buttons}><button onClick={() => go('premium')}>프리미엄 기간권 보기</button><button onClick={() => go('home')}>내 여행으로</button></div>
  </Page>
}

export function InviteScreen({ back }: ScreenProps) {
  const trip = useCurrentTrip()
  const [state, setState] = useState('')
  const link = new URL(`/j/${encodeURIComponent(trip.id)}`, location.origin).href
  return <Page back={back} title="동행 초대" subtitle={`「${trip.name}」 일정에 동행을 초대해요.`}>
    <div className={styles.card}><p>시연 링크 · 같은 브라우저의 여행을 열 수 있어요.</p><p>{link}</p></div>
    <div className={styles.buttons}>
      <button className={styles.primary} onClick={async () => { try { await navigator.clipboard.writeText(link); setState('링크를 복사했어요.') } catch { setState('복사가 차단됐어요. 위 주소를 직접 복사해 주세요.') } }}>초대 링크 복사</button>
      <a href={link} target="_blank" rel="noreferrer">초대 화면 미리 보기</a>
    </div><p role="status">{state}</p>
  </Page>
}

export function PremiumScreen({ back }: ScreenProps) {
  const [selected, setSelected] = useState(false)
  return <Page back={back} title="프리미엄 여행 기간권" subtitle="여행 중 필요한 편의 기능을 한 여행에서 이용해요.">
    <div className={styles.card}><h2>30일 · 6,000원</h2><p>잠금 화면 티켓 카드 · 시간과 위치에 맞춘 티켓 안내</p></div>
    <div className={styles.buttons}><button className={styles.primary} onClick={() => setSelected(true)}>결제 단계 미리 보기</button></div>
    {selected && <div className={styles.card} role="status">시연용 결제 화면입니다. 실제 결제는 진행되지 않아요.</div>}
  </Page>
}

export function DynamicVoucherScreen({ back }: ScreenProps) {
  const [opened, setOpened] = useState(false)
  return <Page back={back} title="실시간 QR 티켓" subtitle="이 티켓은 인터넷에 연결한 뒤 발급처 앱에서 열어야 해요.">
    <div className={styles.card}><h2>오사카 전망대 입장권</h2><p>예약번호 DYNAMIC-DEMO-12</p><p>온라인 필요 · QR이 실시간으로 바뀌는 티켓</p></div>
    <div className={styles.buttons}><button className={styles.primary} onClick={() => setOpened(true)}>원본 앱에서 열기</button></div>
    {opened && <p role="status">시연용 티켓이라 실제 발급처 앱은 열리지 않아요.</p>}
  </Page>
}

export function AgencyJoinScreen({ go, back }: ScreenProps) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  return <Page back={back} title="여행사 초대 참여" subtitle="파트너센터에서 발송한 시연 바우처 번호로 일정을 열어요.">
    <div className={styles.card}>
      <label htmlFor="agency-code">시연 초대 코드</label>
      <input className={styles.file} id="agency-code" value={code} placeholder={DEMO_DELIVERY_ID} onChange={e => setCode(e.target.value)} />
      <div className={styles.buttons}><button className={styles.primary} onClick={() => {
        if (!getDemoDeliveries().some(row => row.id === code.trim().toUpperCase())) {
          setMessage('아직 받은 바우처가 없거나 코드가 달라요.')
          return
        }
        setDemoState({ tripId: DEMO_AGENCY_TRIP_ID, dayIndex: 0, planId: undefined })
        go('timeline')
      }}>고객 일정 열기</button></div>
      {message && <p role="status">{message}</p>}
    </div>
  </Page>
}
