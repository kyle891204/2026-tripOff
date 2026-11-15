import { cn } from '@/lib/cn'
import { STATUS_LABEL, type VoucherStatus } from '@/data/partnerVouchers'
import s from '../partner.module.css'

/** 바우처 상태 배지 (Figma Badge/발송 대기 · 발송 완료 · 사용 완료 · 취소) */
export default function Badge({ status }: { status: VoucherStatus }) {
  return <span className={cn(s.badge, s[status])}>{STATUS_LABEL[status]}</span>
}
