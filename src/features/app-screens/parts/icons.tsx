/**
 * Figma 하이파이 화면의 아이콘 (src/assets/icons/*.svg 원본 그대로 사용).
 * 여러 조각으로 된 아이콘은 Figma 좌표대로 겹쳐서 하나의 컴포넌트로 묶는다.
 * SVG 루트 크기는 건드리지 않는다 (stroke 여백 포함 크기).
 */
import type { CSSProperties } from 'react'
import airplaneSmall from '@/assets/icons/ic-airplane-small.svg'
import appLogo from '@/assets/icons/ic-app-logo.svg'
import arrowRight from '@/assets/icons/ic-arrow-right.svg'
import back from '@/assets/icons/ic-back.svg'
import bed from '@/assets/icons/ic-bed.svg'
import busBottom from '@/assets/icons/ic-bus-bottom.svg'
import busBottomCoral from '@/assets/icons/ic-bus-bottom-coral.svg'
import busDot from '@/assets/icons/ic-bus-dot.svg'
import busTop from '@/assets/icons/ic-bus-top.svg'
import busTopCoral from '@/assets/icons/ic-bus-top-coral.svg'
import cameraBody from '@/assets/icons/ic-camera-body.svg'
import cameraLens from '@/assets/icons/ic-camera-lens.svg'
import chevronRight from '@/assets/icons/ic-chevron-right.svg'
import close from '@/assets/icons/ic-close.svg'
import file from '@/assets/icons/ic-file.svg'
import flash from '@/assets/icons/ic-flash.svg'
import imageA from '@/assets/icons/ic-image-a.svg'
import imageB from '@/assets/icons/ic-image-b.svg'
import kbd from '@/assets/icons/ic-kbd.svg'
import kbdDot from '@/assets/icons/ic-kbd-dot.svg'
import kbdLine from '@/assets/icons/ic-kbd-line.svg'
import plane from '@/assets/icons/ic-plane.svg'
import plus from '@/assets/icons/ic-plus.svg'
import ship from '@/assets/icons/ic-ship.svg'
import sunCore from '@/assets/icons/ic-sun-core.svg'
import sunRays from '@/assets/icons/ic-sun-rays.svg'
import ticketCoral from '@/assets/icons/ic-ticket-coral.svg'
import ticketGold from '@/assets/icons/ic-ticket-gold.svg'
import wallet from '@/assets/icons/ic-wallet.svg'

/** 단일 SVG 아이콘 */
function Img({ src, style }: { src: string; style?: CSSProperties }) {
  return <img src={src} alt="" aria-hidden style={{ display: 'block', maxWidth: 'none', ...style }} />
}

/** 조각 아이콘용: box 크기 안에서 (x, y)에 절대 배치 */
function Layer({ src, x, y }: { src: string; x: number; y: number }) {
  return <Img src={src} style={{ position: 'absolute', left: x, top: y }} />
}

function Box({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  return (
    <span aria-hidden style={{ position: 'relative', display: 'block', width: w, height: h }}>
      {children}
    </span>
  )
}

export const IconPlane = () => <Img src={plane} />
export const IconBed = () => <Img src={bed} />
export const IconShip = () => <Img src={ship} />
export const IconTicketCoral = () => <Img src={ticketCoral} />
export const IconTicketGold = () => <Img src={ticketGold} />
export const IconFile = () => <Img src={file} />
export const IconChevronRight = () => <Img src={chevronRight} />
export const IconBack = () => <Img src={back} />
export const IconClose = () => <Img src={close} />
export const IconPlus = () => <Img src={plus} />
export const IconWallet = () => <Img src={wallet} />
export const IconAppLogo = () => <Img src={appLogo} />
export const IconAirplaneSmall = () => <Img src={airplaneSmall} />
export const IconArrowRight = () => <Img src={arrowRight} />
export const IconFlash = () => <Img src={flash} />

/** 버스 (16×21) — teal 기본, coral 은 타임라인 강조 카드 */
export function IconBus({ tone = 'teal' }: { tone?: 'teal' | 'coral' }) {
  const coral = tone === 'coral'
  return (
    <Box w={16} h={21}>
      <Layer src={coral ? busTopCoral : busTop} x={-1} y={-1} />
      <Layer src={coral ? busBottomCoral : busBottom} x={-1} y={8} />
      {!coral && <Layer src={busDot} x={2.7} y={11.7} />}
      {!coral && <Layer src={busDot} x={10.7} y={11.7} />}
    </Box>
  )
}

/** 사진 (20×16) */
export function IconImage() {
  return (
    <Box w={20} h={16}>
      <Layer src={imageA} x={-1} y={-1} />
      <Layer src={imageB} x={-1} y={6} />
    </Box>
  )
}

/** 키보드 (22×14) */
export function IconKeyboard() {
  return (
    <Box w={22} h={14}>
      <Layer src={kbd} x={-1} y={-1} />
      <Layer src={kbdDot} x={4.7} y={4.7} />
      <Layer src={kbdDot} x={9.7} y={4.7} />
      <Layer src={kbdDot} x={14.7} y={4.7} />
      <Layer src={kbdLine} x={5.2} y={9.2} />
    </Box>
  )
}

/** 밝기 (18×18) */
export function IconSun() {
  return (
    <Box w={18} h={18}>
      <Layer src={sunRays} x={-0.9} y={-0.9} />
      <Layer src={sunCore} x={3.6} y={3.6} />
    </Box>
  )
}

/** 카메라 (22×16) */
export function IconCamera() {
  return (
    <Box w={22} h={16}>
      <Layer src={cameraBody} x={-0.9} y={-0.9} />
      <Layer src={cameraLens} x={6.1} y={3.1} />
    </Box>
  )
}
