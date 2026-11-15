# 2026-tripOff
캡스톤에서 돔황챠ㅑㅑㅑㅑ

TripOff 앱 시연용 웹 사이트 (React 19 + Vite + TypeScript + React Router).

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
```

## 시연 순서

`/demo`는 너비 767px 이하에서 앱만 표시합니다. 좁은 창에서는 비율을 유지하며 줄어들고, 393px보다 넓은 창에서는 중앙의 앱 콘텐츠가 더 크게 늘어나지 않습니다. 높이가 작은 기기에서는 앱 안에서 스크롤합니다. 768px부터 화면 선택 목록과 파트너센터 이동 버튼이 다시 표시됩니다.

1. `/demo`에서 오사카 날짜별 일정을 엽니다. `+ 바우처` → `파일에서` → `샘플 바우처 사용`을 누릅니다. 시간을 14:00으로 확인하고 저장하면 USJ 티켓과 셔틀 겹침 경고가 나타납니다.
2. USJ 상세에서 QR과 메인 게이트를 확인하고, `원본 보기`로 샘플 문서를 엽니다. 검수 화면에서 날짜나 시간을 바꾸면 겹침이 다시 계산됩니다.
3. 실제 파일도 첨부할 수 있습니다. 원본은 IndexedDB에 남으며, 지원 브라우저는 이미지 QR을 읽습니다. PDF의 예약 정보나 인식하지 못한 QR 값은 직접 입력합니다.
4. 오프라인 재시작은 `npm run build` 후 `npm run preview`에서 확인합니다. HTTPS 또는 localhost에서 온라인으로 한 번 접속해 서비스 워커 설치가 끝난 뒤 네트워크를 끄고 같은 브라우저에서 티켓을 다시 엽니다.
5. `/partners/vouchers`에서 김용태의 `TO-2606-0618`을 발송하면 같은 브라우저의 여행자 화면에 ‘제주로드트립 · 고객 일정’이 생깁니다. 수정 후 재발송도 반영됩니다. 이 연결은 시연 데이터용이며 실제 알림을 보내지 않습니다.

프로필, 동행 초대, 기간권, 실시간 QR, 여행사 초대는 시연 화면입니다. 실제 결제나 외부 앱 연결은 이루어지지 않습니다.

**알림 시연:** 여행자 홈에서 알림 종을 누르고 ‘입장 알림 시연’을 선택하면 배너가 나타납니다. 여행자 화면을 열어 둔 채 같은 브라우저의 다른 탭에서 파트너 바우처를 발송하거나 수정 후 재발송해도 알림이 뜹니다. 알림을 누르면 해당 바우처 상세가 열립니다. 운영체제 푸시나 알림톡은 전송되지 않습니다.

## 폴더 구조

```
src/
├─ main.tsx                # 진입점 (폰트·전역 CSS 로드)
├─ app/                    # App.tsx, router.tsx (라우트 정의)
├─ pages/                  # 라우트 1개 = 폴더 1개
│  ├─ Home/                #   랜딩 (sections/ Hero·Features·Cta)
│  ├─ Demo/                #   앱 시연 페이지
│  ├─ ScreenOnly/          #   /screens/:id — 앱 화면 단독 (캡처·QA 용)
│  ├─ Partner/             #   /partners/products, /partners/vouchers (관리자)
│  └─ NotFound/
├─ components/
│  ├─ layout/              # Header, Footer, Layout (사이트 공통)
│  └─ ui/                  # Button, Container, Section
├─ features/
│  ├─ app-screens/         # ★ Figma 하이파이 앱 화면 (393×852)
│  │  ├─ screens/          #   화면 1개 = 파일 1개 (+ .module.css)
│  │  ├─ parts/            #   StatusBar, QrCode, Avatar, icons 등 화면 공용 부품
│  │  ├─ registry.ts       #   화면 목록·순서·설명 (시연 순서는 여기서)
│  │  ├─ mock.ts           #   시나리오 데이터 (여행 여러 개, 여행사 일정/내 일정 구분)
│  │  └─ store.ts          #   화면 간 시연 상태 (선택한 여행·날짜, 저장 여부)
│  ├─ demo/                # PhoneFrame(화면 축소 틀), DemoPlayer(시연 플레이어·뒤로가기)
│  └─ partner/             # 파트너센터(관리자) 레이아웃·공용 컴포넌트
├─ data/                   # 사이트 문구·기능 목록 ← 텍스트 수정은 여기
├─ hooks/  lib/  types/
├─ styles/                 # global.css, variables.css (라군 틸 디자인 토큰)
└─ assets/icons/           # Figma 에서 받은 아이콘 SVG
docs/
└─ admin-plan.md           # 파트너센터(관리자) 구현 방식·현황
```

## 규칙

- **import 경로**: `@/` = `src/` (예: `import { Button } from '@/components/ui'`)
- **스타일**: 컴포넌트 옆에 `Xxx.module.css` (CSS Modules). 색·간격은 `styles/variables.css` 토큰 사용
- **어디에 둘까?**
  - 여러 페이지에서 쓰는 범용 UI → `components/ui`
  - 특정 기능 묶음(시연 뷰어 등) → `features/<기능명>`
  - 한 페이지에서만 쓰는 블록 → `pages/<페이지>/sections`
- **새 페이지 추가**: `pages/Xxx/XxxPage.tsx` 생성 → `lib/routes.ts`에 경로 추가 → `app/router.tsx`에 등록 → (필요하면) `data/site.ts`의 `nav`에 추가
- **앱 화면 추가**: `features/app-screens/screens/XxxScreen.tsx` 작성 → `registry.ts`의 `SCREENS`에 등록 (시연 목록·`/screens/:id`에 자동 반영)
- **색**: Figma 「디자인 소스 › 라군 틸」 값이 `styles/variables.css`에 있음. 화면에서는 `var(--teal)` 등 토큰만 사용
