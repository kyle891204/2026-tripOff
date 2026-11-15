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
├─ main.tsx              # 진입점 (전역 CSS 로드)
├─ app/                  # 앱 껍데기
│  ├─ App.tsx            #   RouterProvider
│  └─ router.tsx         #   라우트 정의
├─ pages/                # 라우트 1개 = 폴더 1개
│  ├─ Home/
│  │  ├─ HomePage.tsx
│  │  └─ sections/       #   랜딩 섹션 (Hero, Features, Cta …)
│  ├─ Demo/DemoPage.tsx  #   앱 시연 페이지
│  └─ NotFound/
├─ components/
│  ├─ layout/            # Header, Footer, Layout (모든 페이지 공통)
│  └─ ui/                # Button, Container, Section 등 범용 컴포넌트
├─ features/
│  └─ demo/              # 시연 전용 기능 (PhoneFrame, ScreenViewer)
├─ data/                 # 사이트 문구·기능 목록·시연 화면 목록 ← 텍스트 수정은 여기
├─ hooks/                # 커스텀 훅
├─ lib/                  # 유틸, 라우트 상수
├─ types/                # 공용 타입
├─ styles/               # global.css, variables.css (디자인 토큰)
└─ assets/images/        # 앱 스크린샷 등 (import 해서 사용)
public/                  # 그대로 서빙되는 정적 파일 (favicon 등)
```

## 규칙

- **import 경로**: `@/` = `src/` (예: `import { Button } from '@/components/ui'`)
- **스타일**: 컴포넌트 옆에 `Xxx.module.css` (CSS Modules). 색·간격은 `styles/variables.css` 토큰 사용
- **어디에 둘까?**
  - 여러 페이지에서 쓰는 범용 UI → `components/ui`
  - 특정 기능 묶음(시연 뷰어 등) → `features/<기능명>`
  - 한 페이지에서만 쓰는 블록 → `pages/<페이지>/sections`
- **새 페이지 추가**: `pages/Xxx/XxxPage.tsx` 생성 → `lib/routes.ts`에 경로 추가 → `app/router.tsx`에 등록 → (필요하면) `data/site.ts`의 `nav`에 추가
- **스크린샷 넣기**: `src/assets/images/`에 파일 추가 → `data/screens.ts`에서 import 해서 `image`에 연결
