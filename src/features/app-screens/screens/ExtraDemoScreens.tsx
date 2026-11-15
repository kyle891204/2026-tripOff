import { useEffect, useState } from 'react'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import Avatar from '../parts/Avatar'
import QrCode from '../parts/QrCode'
import { IconBack, IconFile, IconTicketCoral, IconChevronRight } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { ME, NEXT_ENTRY, voucherOf } from '../mock'
import { setDemoState, useCurrentPlan, useCurrentTrip } from '../store'
import { detectImageQr, fileRecord } from '../voucherFiles'
import type { ScreenProps } from '../types'
import styles from './ExtraDemoScreens.module.css'

export function Page({ back, title, subtitle, children, tabGo }: {
  back: () => void; title: string; subtitle: string; children: React.ReactNode; tabGo?: ScreenProps['go']
}) {
  return <Screen bg="var(--mist)" label={title}>
    {!tabGo && <button type="button" aria-label="뒤로" className={shared.back} onClick={back}><IconBack /></button>}
    <div className={styles.body} style={tabGo ? { top: 72, bottom: 84 } : undefined}><h1 className={styles.title}>{title}</h1><p className={styles.sub}>{subtitle}</p>{children}</div>
    {tabGo && <TabBar active="profile" go={tabGo} />}
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
    <div className={styles.upload}>
      <span className={styles.uploadIcon}><IconFile /></span>
      <h2>예약한 바우처를 가져오세요</h2>
      <p className={styles.sub}>예약 메일의 PDF도, 저장한 캡처도 좋아요.</p>
      <label className={styles.fileLabel} htmlFor="voucher-file">{busy ? '파일을 저장하는 중…' : '기기에서 파일 선택'}</label>
      <input id="voucher-file" className={styles.file} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={busy} onChange={e => {
        const file = e.currentTarget.files?.[0]
        e.currentTarget.value = ''
        if (file) void select(file)
      }} />
      <small className={styles.formats}>PDF · JPG · PNG · WebP / 최대 10MB</small>
      {busy && <p role="status">파일을 저장하고 있어요…</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    <div className={styles.card}>
      <span className={styles.eyebrow}>먼저 체험해 보세요</span><div className={styles.fileRow}><span className={shared.iconBoxCoral}><IconTicketCoral /></span><div><h2>샘플 바우처</h2><p>{trip.sample.file}</p></div></div>
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
  return <Page back={back} title="원본 바우처" subtitle={original?.name ?? data.file}>
    {original ? <div className={styles.card}>
      {preview ? <>
        {preview.type.startsWith('image/') ? <img className={styles.preview} src={preview.url} alt="첨부한 바우처 원본" /> : <iframe className={styles.preview} src={preview.url} title="첨부한 PDF 원본" />}
        <div className={styles.buttons}><a href={preview.url} download={original.name}>원본 다운로드</a></div>
      </> : <p role="status">{unavailable ? '기기에 저장된 원본을 찾을 수 없어요.' : '기기에서 원본을 불러오는 중이에요.'}</p>}
    </div> : <div className={styles.ticket}>
      <div className={styles.ticketHeader}><span className={styles.eyebrow}>TRAVEL VOUCHER</span><span className={styles.badge}>시연용 샘플</span><h2>{data.title}</h2></div>
      <dl className={styles.details}><div><dt>이용 일시</dt><dd>{data.date} · {data.time}</dd></div><div><dt>예약 번호</dt><dd>{data.code}</dd></div></dl>
      {data.qrValue && <div className={styles.qr}><QrCode value={data.qrValue} size={148} /><p>입장 시 QR을 보여 주세요</p></div>}
    </div>}
  </Page>
}

export function ProfileScreen({ go, back }: ScreenProps) {
  return <Page back={back} tabGo={go} title="마이페이지" subtitle="여행의 시작부터 끝까지, 트립오프와 함께">
    <div className={styles.profileCard}>
      <Avatar label={ME.label} name={ME.name} tone="coral" size={72} fontSize={28} />
      <h2>{ME.name}<span>님</span></h2><p>가볍게 떠나는 여행자</p><span className={styles.badge}>시연 계정</span>
    </div>
    <div className={styles.menu}><button onClick={() => go('home', { replace: true })}><span>내 여행</span><IconChevronRight /></button><button onClick={() => go('vouchers', { replace: true })}><span>내 바우처</span><IconChevronRight /></button><button onClick={() => go('invite')}><span>동행 초대</span><IconChevronRight /></button><button onClick={() => go('notifications')}><span>알림함</span><IconChevronRight /></button></div>
    <div className={styles.menu} aria-label="계정 및 지원">
      <button type="button" title="시연용 버튼"><span>설정</span><IconChevronRight /></button>
      <button type="button" title="시연용 버튼"><span>도움말 · 문의</span><IconChevronRight /></button>
      <button type="button" className={styles.logout} title="시연용 버튼 · 실제로 로그아웃되지 않아요"><span>로그아웃</span><IconChevronRight /></button>
    </div>
  </Page>
}

export function InviteScreen({ back }: ScreenProps) {
  const trip = useCurrentTrip()
  const [state, setState] = useState('')
  const link = new URL(`/j/${encodeURIComponent(trip.id)}`, location.origin).href
  return <Page back={back} title="동행 초대" subtitle="함께 떠날 친구에게 여행을 공유해 보세요.">
    <div className={styles.inviteCard}><span className={styles.eyebrow}>OUR NEXT TRIP</span><h2>{trip.name}</h2><div className={styles.members}>{trip.members.map(member => <Avatar key={member.name} {...member} size={44} fontSize={18} ring={{ width: 3, color: 'var(--deep)' }} />)}</div><p>같은 일정, 함께하는 여행</p></div>
    <div className={styles.card}><h2>초대 링크</h2><p className={styles.sub}>링크를 열어 여행 일정을 확인할 수 있어요.</p><input className={styles.linkInput} aria-label="초대 링크" value={link} readOnly onFocus={e => e.currentTarget.select()} /><div className={styles.buttons}>
      <button className={styles.primary} onClick={async () => { try { await navigator.clipboard.writeText(link); setState('링크를 복사했어요.') } catch { setState('위 링크를 길게 눌러 직접 복사해 주세요.') } }}>{state === '링크를 복사했어요.' ? '복사 완료' : '초대 링크 복사'}</button>
      <a href={link} target="_blank" rel="noreferrer">초대 화면 미리 보기</a>
    </div></div><p className={styles.notice}>시연에서는 같은 브라우저의 여행을 공유해요.</p><p role="status" className={styles.feedback}>{state}</p>
  </Page>
}
