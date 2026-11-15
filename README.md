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
