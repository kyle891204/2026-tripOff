import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  CalendarIcon,
  Card,
  CloseIcon,
  Field,
  PartnerButton as Button,
  QrPlaceholder,
  RadioMark,
  partnerStyles as p,
  useProductStore,
  useToast,
} from '@/features/partner'
import { PARTNER_COMPANY_NAME } from '@/data/partnerVouchers'
import type { CodeType } from '@/data/partnerProducts'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'
import s from './ProductRegisterPage.module.css'

type Option = { id: number; name: string; adult: string; child: string; stock: string }
type RefundRule = { id: number; days: string; percent: string }

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

/** 시연용 예시 상품. 플로팅 버튼을 누를 때마다 한 섹션씩 채운다. */
const DEMO_STEPS = [
  { id: 'section-basic', label: '기본 정보' },
  { id: 'section-options', label: '옵션 및 가격' },
  { id: 'section-schedule', label: '운영 일정' },
  { id: 'section-voucher', label: '바우처 설정' },
  { id: 'section-refund', label: '취소·환불 규정' },
] as const
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const CODE_TYPES: Array<{ value: CodeType; title: string; sub: string }> = [
  { value: 'qr', title: 'QR 코드', sub: '현장에서 스캔' },
  { value: 'barcode', title: '바코드', sub: '기존 단말기 사용' },
  { value: 'number', title: '확정번호만', sub: '명단 대조' },
]

let nextId = 3

function formatDate(value: string) {
  if (!value) return '2026.00.00 (요일)'
  const d = new Date(`${value}T00:00:00`)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${WEEKDAY[d.getDay()]})`
}

export default function ProductRegisterPage() {
  const companyName = PARTNER_COMPANY_NAME
  const toast = useToast()
  const navigate = useNavigate()
  const { addProduct } = useProductStore()
  const nameRef = useRef<HTMLInputElement>(null)
  const [demoStep, setDemoStep] = useState(0)
  const [flashId, setFlashId] = useState<string | null>(null)

  // 1. 기본 정보
  const [name, setName] = useState('')
  const [category, setCategory] = useState('투어·가이드')
  const [region, setRegion] = useState('')
  const [duration, setDuration] = useState('')
  const [intro, setIntro] = useState('')
  const [images, setImages] = useState<Array<{ id: number; url: string; name: string }>>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // 2. 옵션 및 가격
  const [options, setOptions] = useState<Option[]>([
    { id: 1, name: '', adult: '', child: '', stock: '' },
    { id: 2, name: '', adult: '', child: '', stock: '' },
  ])

  // 3. 운영 일정
  const [saleStart, setSaleStart] = useState('')
  const [saleEnd, setSaleEnd] = useState('')
  const [days, setDays] = useState<Set<string>>(new Set(['월', '화', '수', '목', '금', '토']))
  const [deadline, setDeadline] = useState('이용 전날 18:00까지')
  const [confirmMode, setConfirmMode] = useState('즉시 확정')

  // 4. 바우처 설정
  const [codeType, setCodeType] = useState<CodeType>('qr')
  const [sendTiming, setSendTiming] = useState('예약 확정 즉시')
  const [validity, setValidity] = useState('선택한 이용일 당일만')
  const [meetPlace, setMeetPlace] = useState('')
  const [meetTime, setMeetTime] = useState('')
  const [contact, setContact] = useState('')
  const [notice, setNotice] = useState('')

  // 5. 취소·환불 규정
  const [rules, setRules] = useState<RefundRule[]>([
    { id: 1, days: '7', percent: '100' },
    { id: 2, days: '3', percent: '50' },
  ])

  useEffect(() => () => images.forEach((img) => URL.revokeObjectURL(img.url)), [])

  const updateOption = (id: number, patch: Partial<Option>) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const toggleDay = (day: string) =>
    setDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })

  const addImages = (files: FileList | null) => {
    if (!files) return
    const room = 10 - images.length
    const added = Array.from(files)
      .slice(0, room)
      .map((f) => ({ id: nextId++, url: URL.createObjectURL(f), name: f.name }))
    setImages((prev) => [...prev, ...added])
    if (files.length > room) toast.show('이미지는 최대 10장까지 등록할 수 있어요.')
  }

  const removeImage = (id: number) =>
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((i) => i.id !== id)
    })

  const firstRule = rules.find((r) => r.days && r.percent)
  const refundSummary = firstRule ? `이용 ${firstRule.days}일 전까지 ${firstRule.percent}% 환불` : '[취소 규정]'
  const optionName = options.find((o) => o.name.trim())?.name.trim() || '[옵션명]'

  /** 시연용: 다음 섹션에 예시 데이터를 한 번에 채우고 그 섹션으로 스크롤한다. */
  const fillNextDemoStep = () => {
    if (demoStep >= DEMO_STEPS.length) {
      register()
      return
    }
    switch (demoStep) {
      case 0:
        setName('서귀포 쇠소깍 투명카약 & 정방폭포 반일 투어')
        setCategory('투어·가이드')
        setRegion('제주 서귀포시')
        setDuration('약 3시간 30분')
        setIntro(
          '쇠소깍 계곡에서 투명카약을 30분 동안 타고, 전용 차량으로 정방폭포와 이중섭거리를 둘러보는 최대 12명 소규모 투어예요. 카약 이용료, 구명조끼, 전문 가이드, 차량이 모두 포함돼 있어요.',
        )
        break
      case 1:
        setOptions([
          { id: nextId++, name: '오전 출발 09:30', adult: '49000', child: '39000', stock: '12' },
          { id: nextId++, name: '오후 출발 14:00', adult: '49000', child: '39000', stock: '12' },
          { id: nextId++, name: '일몰 출발 16:30 (12~2월)', adult: '55000', child: '45000', stock: '8' },
        ])
        break
      case 2:
        setSaleStart('2026-12-01')
        setSaleEnd('2027-02-28')
        setDays(new Set(['화', '수', '목', '금', '토', '일']))
        setDeadline('이용 전날 18:00까지')
        setConfirmMode('즉시 확정')
        break
      case 3:
        setCodeType('qr')
        setSendTiming('예약 확정 즉시')
        setValidity('선택한 이용일 당일만')
        setMeetPlace('쇠소깍 공영주차장 카약 매표소 앞')
        setMeetTime('출발 20분 전')
        setContact('010-2468-1357')
        setNotice('젖어도 되는 옷과 여벌 옷을 챙겨 주세요. 파고 1.5m 이상이면 카약 대신 서귀포 매일올레시장 일정으로 바뀌고, 차액은 현장에서 환불해 드려요.')
        break
      case 4:
        setRules([
          { id: nextId++, days: '7', percent: '100' },
          { id: nextId++, days: '3', percent: '70' },
          { id: nextId++, days: '1', percent: '30' },
        ])
        break
    }
    const target = DEMO_STEPS[demoStep]
    setDemoStep(demoStep + 1)
    setFlashId(target.id)
    window.setTimeout(() => setFlashId((cur) => (cur === target.id ? null : cur)), 1600)
    requestAnimationFrame(() => document.getElementById(target.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  /** 시연용: 승인 절차 없이 바로 등록하고 목록으로 이동한다. 필수값은 상품명만 확인한다. */
  const register = () => {
    if (!name.trim()) {
      toast.show('상품명을 입력해 주세요.')
      nameRef.current?.focus()
      return
    }
    const created = addProduct({
      name: name.trim(),
      category,
      region: region.trim() || '지역 미정',
      duration: duration.trim(),
      options: options
        .filter((o) => o.name.trim() || o.adult)
        .map(({ name: optionName, adult, child, stock }) => ({ name: optionName.trim(), adult, child, stock })),
      days: DAYS.filter((d) => days.has(d)),
      codeType,
      meetPlace: meetPlace.trim(),
    })
    navigate(ROUTES.partnerProducts, { state: { createdId: created.id } })
  }

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <p className={p.crumb}>
            <Link to={ROUTES.partnerProducts}>상품 등록·관리</Link> › 새 상품
          </p>
          <h1>새 상품 등록</h1>
          <p className={p.desc}>
            등록하면 바로 판매가 시작되고, 예약이 확정되면 바우처가 고객의 TripOff 일정에 자동으로 들어갑니다.
          </p>
        </div>
        <div className={p.actions}>
          <Button variant="secondary" onClick={() => navigate(ROUTES.partnerProducts)}>
            취소
          </Button>
          <Button variant="primary" onClick={register}>
            등록
          </Button>
        </div>
      </header>

      <div className={p.body}>
        <div className={p.stack}>
          <Card id="section-basic" highlighted={flashId === 'section-basic'} title="1. 기본 정보" description="고객 앱 상품 카드와 바우처 상단에 표시됩니다.">
            <Field label="상품명 *" htmlFor="p-name">
              <input id="p-name" ref={nameRef} className={p.input} placeholder="예: 제주 동부 오름 트레킹 반일 투어" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className={p.row}>
              <Field label="카테고리 *" htmlFor="p-category">
                <select id="p-category" className={p.input} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {['투어·가이드', '액티비티', '입장권', '교통', '숙박'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="지역 *" htmlFor="p-region">
                <input id="p-region" className={p.input} placeholder="예: 제주 서귀포시" value={region} onChange={(e) => setRegion(e.target.value)} />
              </Field>
              <Field label="소요 시간" htmlFor="p-duration">
                <input id="p-duration" className={p.input} placeholder="예: 약 4시간" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </Field>
            </div>
            <Field label="상품 소개" htmlFor="p-intro">
              <textarea id="p-intro" className={p.input} rows={intro ? 3 : 1} placeholder="코스, 포함 사항, 진행 방식을 짧게 적어 주세요." value={intro} onChange={(e) => setIntro(e.target.value)} />
            </Field>
            <div className={s.images}>
              <p className={p.label}>대표 이미지</p>
              <div className={s.slots}>
                <button className={cn(s.slot, s.slotAdd)} onClick={() => fileRef.current?.click()} disabled={images.length >= 10}>
                  + 이미지 추가
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className={p.visuallyHidden}
                  onChange={(e) => {
                    addImages(e.target.files)
                    e.target.value = ''
                  }}
                />
                {images.length === 0 ? (
                  <div className={cn(s.slot, s.slotEmpty)}>[대표 이미지]</div>
                ) : (
                  images.map((img, i) => (
                    <div key={img.id} className={s.slot}>
                      <img src={img.url} alt={img.name} />
                      {i === 0 && <span className={s.slotTag}>대표</span>}
                      <button className={s.slotRemove} aria-label={`${img.name} 삭제`} onClick={() => removeImage(img.id)}>
                        <CloseIcon />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <p className={p.hint}>JPG·PNG, 최대 10장. 첫 번째 이미지가 대표 이미지가 됩니다.</p>
            </div>
          </Card>

          <Card id="section-options" highlighted={flashId === 'section-options'} title="2. 옵션 및 가격" description="출발 시간·코스별로 옵션을 나누고, 하루 판매 가능 수량을 정하세요.">
            <div className={s.options} role="table" aria-label="옵션 목록">
              <div className={cn(s.optionRow, s.optionHead)} role="row">
                <span role="columnheader">옵션명</span>
                <span role="columnheader">성인 가격(원)</span>
                <span role="columnheader">아동 가격(원)</span>
                <span role="columnheader">일 재고</span>
                <span role="columnheader" className={p.visuallyHidden}>
                  삭제
                </span>
              </div>
              {options.map((o, i) => (
                <div className={s.optionRow} role="row" key={o.id}>
                  <input
                    className={p.input}
                    aria-label={`옵션 ${i + 1} 이름`}
                    placeholder={i === 0 ? '예: 오전 출발 09:00' : i === 1 ? '예: 오후 출발 14:00' : '옵션명'}
                    value={o.name}
                    onChange={(e) => updateOption(o.id, { name: e.target.value })}
                  />
                  <input className={p.input} inputMode="numeric" aria-label={`옵션 ${i + 1} 성인 가격`} placeholder="[가격]" value={o.adult} onChange={(e) => updateOption(o.id, { adult: e.target.value.replace(/[^0-9]/g, '') })} />
                  <input className={p.input} inputMode="numeric" aria-label={`옵션 ${i + 1} 아동 가격`} placeholder="[가격]" value={o.child} onChange={(e) => updateOption(o.id, { child: e.target.value.replace(/[^0-9]/g, '') })} />
                  <input className={p.input} inputMode="numeric" aria-label={`옵션 ${i + 1} 일 재고`} placeholder="0" value={o.stock} onChange={(e) => updateOption(o.id, { stock: e.target.value.replace(/[^0-9]/g, '') })} />
                  <button
                    className={s.iconBtn}
                    aria-label={`옵션 ${i + 1} 삭제`}
                    disabled={options.length === 1}
                    onClick={() => setOptions((prev) => prev.filter((x) => x.id !== o.id))}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <Button variant="outline" onClick={() => setOptions((prev) => [...prev, { id: nextId++, name: '', adult: '', child: '', stock: '' }])}>
                + 옵션 추가
              </Button>
            </div>
          </Card>

          <Card id="section-schedule" highlighted={flashId === 'section-schedule'} title="3. 운영 일정">
            <div className={p.row}>
              <Field label="판매 시작일" htmlFor="p-start">
                <input id="p-start" type="date" className={p.input} value={saleStart} max={saleEnd || undefined} onChange={(e) => setSaleStart(e.target.value)} />
              </Field>
              <Field label="판매 종료일" htmlFor="p-end">
                <input id="p-end" type="date" className={p.input} value={saleEnd} min={saleStart || undefined} onChange={(e) => setSaleEnd(e.target.value)} />
              </Field>
            </div>
            <div className={s.days}>
              <p className={p.label} id="days-label">
                운영 요일
              </p>
              <div className={s.chips} role="group" aria-labelledby="days-label">
                {DAYS.map((d) => (
                  <button key={d} className={p.chip} aria-pressed={days.has(d)} onClick={() => toggleDay(d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className={p.row}>
              <Field label="예약 마감" htmlFor="p-deadline">
                <select id="p-deadline" className={p.input} value={deadline} onChange={(e) => setDeadline(e.target.value)}>
                  {['이용 전날 18:00까지', '이용 당일 09:00까지', '이용 2일 전까지'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="예약 확정 방식" htmlFor="p-confirm">
                <select id="p-confirm" className={p.input} value={confirmMode} onChange={(e) => setConfirmMode(e.target.value)}>
                  {['즉시 확정', '여행사 승인 후 확정'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card id="section-voucher" highlighted={flashId === 'section-voucher'} title="4. 바우처 설정" description="여기서 정한 내용으로 바우처가 자동 발급됩니다. 오른쪽에서 고객 화면을 바로 확인하세요.">
            <fieldset className={s.codeTypes}>
              <legend className={p.label}>현장 확인 방식</legend>
              <div className={s.codeRow}>
                {CODE_TYPES.map((t) => (
                  <label key={t.value} className={cn(s.codeType, codeType === t.value && s.codeSelected)}>
                    <input type="radio" name="code-type" className={p.visuallyHidden} checked={codeType === t.value} onChange={() => setCodeType(t.value)} />
                    <RadioMark checked={codeType === t.value} />
                    <span className={s.codeText}>
                      <strong>{t.title}</strong>
                      <span>{t.sub}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={p.row}>
              <Field label="발송 시점" htmlFor="p-send">
                <select id="p-send" className={p.input} value={sendTiming} onChange={(e) => setSendTiming(e.target.value)}>
                  {['예약 확정 즉시', '이용 전날 09:00'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="유효 기간" htmlFor="p-valid">
                <select id="p-valid" className={p.input} value={validity} onChange={(e) => setValidity(e.target.value)}>
                  {['선택한 이용일 당일만', '판매 기간 내 언제나'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="집결 장소 *" htmlFor="p-meet">
              <input id="p-meet" className={p.input} placeholder="예: 성산일출봉 주차장 A구역 매표소 앞" value={meetPlace} onChange={(e) => setMeetPlace(e.target.value)} />
            </Field>
            <div className={p.row}>
              <Field label="집결 시간" htmlFor="p-meet-time">
                <input id="p-meet-time" className={p.input} placeholder="예: 출발 15분 전" value={meetTime} onChange={(e) => setMeetTime(e.target.value)} />
              </Field>
              <Field label="현장 연락처" htmlFor="p-contact">
                <input id="p-contact" className={p.input} type="tel" placeholder="예: 010-0000-0000" value={contact} onChange={(e) => setContact(e.target.value)} />
              </Field>
            </div>
            <Field label="이용 안내" htmlFor="p-notice">
              <textarea id="p-notice" className={p.input} rows={notice ? 3 : 1} placeholder="준비물, 복장, 우천 시 진행 여부 등 고객이 바우처에서 꼭 봐야 할 내용" value={notice} onChange={(e) => setNotice(e.target.value)} />
            </Field>
          </Card>

          <Card id="section-refund" highlighted={flashId === 'section-refund'} title="5. 취소·환불 규정" description="구간별 환불 비율을 정하면 고객 앱과 바우처에 표로 표시됩니다.">
            {rules.map((r, i) => (
              <div className={s.rule} key={r.id}>
                <span>이용일</span>
                <input
                  className={cn(p.input, p.inputSm)}
                  inputMode="numeric"
                  aria-label={`규정 ${i + 1} 기준 일수`}
                  value={r.days}
                  onChange={(e) => setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, days: e.target.value.replace(/[^0-9]/g, '') } : x)))}
                />
                <span>일 전까지</span>
                <input
                  className={cn(p.input, p.inputSm)}
                  inputMode="numeric"
                  aria-label={`규정 ${i + 1} 환불 비율`}
                  value={r.percent}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '')
                    setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, percent: v && Number(v) > 100 ? '100' : v } : x)))
                  }}
                />
                <span>% 환불</span>
              </div>
            ))}
            <p className={s.ruleTail}>그 이후 취소 및 노쇼는 환불 불가</p>
          </Card>
        </div>

        <aside className={s.preview} aria-label="고객 바우처 미리보기">
          <p className={s.previewTitle}>고객 바우처 미리보기</p>
          <div className={s.voucher}>
            <div className={s.voucherHead}>
              <p className={s.voucherCompany}>{companyName} · 바우처</p>
              <p className={s.voucherName}>{name.trim() || '[상품명]'}</p>
              <p className={s.voucherMeta}>
                {optionName} · 성인 2 · {formatDate(saleStart)}
              </p>
            </div>
            <div className={s.voucherCode}>
              <QrPlaceholder kind={codeType} />
              <p>확정번호 TO-0000-0000</p>
            </div>
            <hr className={s.voucherDivider} />
            <dl className={s.voucherInfo}>
              <div>
                <dt>집결 장소</dt>
                <dd>
                  {meetPlace.trim() || '[집결 장소]'}
                  {meetTime.trim() && <span className={s.voucherSub}> · {meetTime.trim()}</span>}
                </dd>
              </div>
              <div>
                <dt>현장 연락</dt>
                <dd>{contact.trim() || '[현장 연락처]'}</dd>
              </div>
              <div>
                <dt>취소 규정</dt>
                <dd>{refundSummary}</dd>
              </div>
              {notice.trim() && (
                <div>
                  <dt>이용 안내</dt>
                  <dd>{notice.trim()}</dd>
                </div>
              )}
            </dl>
            <div className={s.voucherSync}>
              <CalendarIcon />
              <span>고객의 TripOff 여행 일정에 자동 추가</span>
            </div>
          </div>
          <p className={p.hint}>예약자 이름, 인원, 이용일은 예약 시 자동으로 채워집니다.</p>
        </aside>
      </div>
      <button
        type="button"
        className={cn(s.demoFab, demoStep >= DEMO_STEPS.length && s.demoFabDone)}
        onClick={fillNextDemoStep}
        aria-label={demoStep < DEMO_STEPS.length ? `시연용 예시 데이터 채우기: ${DEMO_STEPS[demoStep].label}` : '예시 상품 등록하기'}
      >
        <span className={s.demoFabText}>
          <small>{demoStep < DEMO_STEPS.length ? `시연 ${demoStep + 1}/${DEMO_STEPS.length} · 예시 데이터` : '모든 항목을 채웠어요'}</small>
          <strong>{demoStep < DEMO_STEPS.length ? `${DEMO_STEPS[demoStep].label} 채우기` : '등록하기'}</strong>
          <span className={s.demoDots} aria-hidden="true">
            {DEMO_STEPS.map((step, i) => (
              <span key={step.id} className={i < demoStep ? s.on : undefined} />
            ))}
          </span>
        </span>
        <span className={s.demoFabArrow} aria-hidden="true">
          →
        </span>
      </button>
      {toast.node}
    </main>
  )
}
