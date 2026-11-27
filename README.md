# TripOff (트립오프)

> **예약은 어디서 하든, 여행은 한 곳에서.**
> 흩어진 여행 바우처를 하나의 타임라인 지갑에 모으고, 여행사가 바꾼 일정은 고객 폰에 바로 반영하는 여행 플랫폼

**시연 사이트: https://2026-trip-off.vercel.app**
- 여행자 앱 시연: [`/demo`](https://2026-trip-off.vercel.app/demo)
- 여행사 파트너센터: [`/partners`](https://2026-trip-off.vercel.app/partners)

<!-- 시연 GIF 또는 캡처 (앱 화면 + 파트너센터) -->
<p align="center">
  <img src="docs/images/demo.gif" width="300" />
  <img src="docs/images/partner.png" width="500" />
</p>

> 이 저장소는 TripOff 앱의 **시연용 웹 사이트**입니다 (React 19 + Vite + TypeScript + React Router).
> 여행자 앱과 파트너센터를 하나의 React 앱으로 구현했고, 백엔드 없이 목 데이터와 브라우저 저장소로 동작합니다.

<br>

## 서비스 소개

| 문제 | TripOff의 해결 |
| --- | --- |
| 항공·숙소·투어 바우처가 여러 앱과 메일에 흩어져 있음 | 어디서 산 예약이든 **날짜별 타임라인** 하나에 모음 |
| PDF, 메일, 캡처 등 바우처 형식이 제각각임 | 일시·장소·예약번호와 **QR을 같은 형태로 정리** |
| 대표 예약자가 동행에게 티켓을 하나씩 캡처해 보냄 | **동행 초대** 한 번으로 각자 폰에 티켓 전달 |
| 소형 여행사가 바우처 발송과 변경 안내를 수작업으로 함 | **파트너센터**에서 발송하면 일정 변경이 고객 앱에 즉시 반영 |

<br>

## 주요 기능

### 여행자 앱
- 여행별 날짜 타임라인과 시간이 겹치는 일정 경고
- 바우처 추가 (파일 첨부 → 검수 화면에서 수정 → 저장)
- 티켓 상세: QR, 원본 문서 보기, **오프라인 열람**
- 현지 투어·액티비티 상점, 알림, 동행·마이페이지

### 파트너센터 (여행사 관리자)
- 상품 등록 5단계 폼과 고객 바우처 실시간 미리보기
- 바우처 관리: 상태별 탭, 검색·필터, 처리 이력, 재발송·취소
- 대시보드, 예약 현황, 정산, 업체 설정

### 구현 범위
| 상태 | 기능 |
| --- | --- |
| 동작 | 타임라인, 바우처 첨부·검수, QR, 오프라인 열람, 파트너 발송 → 여행자 화면 반영, 알림 배너 |
| 시연 화면 | 프로필, 동행 초대, 기간권, 실시간 QR, 여행사 초대 |
| 미구현 | 실제 결제, 운영체제 푸시·알림톡, 서버·외부 앱 연동 |

<br>

## 기술적으로 신경 쓴 부분

- **오프라인 티켓 열람**: 서비스 워커로 앱을 캐싱해서, 한 번 접속한 뒤에는 네트워크 없이도 티켓과 QR이 열립니다.
- **원본 바우처 보관**: 첨부한 파일은 IndexedDB에 저장하고, 지원하는 브라우저에서는 이미지 속 QR을 읽어 옵니다.
- **파트너와 여행자 화면 실시간 연동**: 파트너센터에서 바우처를 발송하거나 수정하면, 같은 브라우저의 다른 탭에 열린 여행자 화면에 일정과 알림이 바로 반영됩니다.
- **Figma와 맞춘 디자인 시스템**: Figma 「디자인 소스 › 라군 틸」 색상을 CSS 변수 토큰으로 옮기고 CSS Modules로 구성했습니다. 파트너센터는 별도 블루 테마를 씁니다.
- **반응형 시연 프레임**: 너비에 따라 앱 화면만 보이거나, 화면 선택 목록과 함께 보이도록 구성했습니다.

<br>

## 시연 가이드

> **화면 크기 안내**
> `/demo`는 너비 767px 이하에서 앱만 표시합니다. 좁은 창에서는 비율을 유지하며 줄어들고, 393px보다 넓은 창에서는 중앙의 앱 콘텐츠가 더 커지지 않습니다. 높이가 작은 기기에서는 앱 안에서 스크롤합니다. 768px부터는 화면 선택 목록과 파트너센터 이동 버튼이 다시 표시됩니다.

1. **바우처 추가**
   `/demo`에서 오사카 날짜별 일정을 엽니다. `+ 바우처` → `파일에서` → `샘플 바우처 사용`을 누릅니다. 시간을 14:00으로 확인하고 저장하면 USJ 티켓과 셔틀 겹침 경고가 나타납니다.
2. **티켓 확인**
   USJ 상세에서 QR과 메인 게이트를 확인하고, `원본 보기`로 샘플 문서를 엽니다. 검수 화면에서 날짜나 시간을 바꾸면 겹침이 다시 계산됩니다.
3. **실제 파일 첨부**
   실제 파일도 첨부할 수 있습니다. 원본은 IndexedDB에 남으며, 지원 브라우저는 이미지 QR을 읽습니다. PDF의 예약 정보나 인식하지 못한 QR 값은 직접 입력합니다.
4. **오프라인 재시작**
   `npm run build` 후 `npm run preview`에서 확인합니다. HTTPS 또는 localhost에서 온라인으로 한 번 접속해 서비스 워커 설치가 끝난 뒤, 네트워크를 끄고 같은 브라우저에서 티켓을 다시 엽니다.
5. **파트너 → 여행자 발송**
   `/partners/vouchers`에서 김용태의 `TO-2606-0618`을 발송하면 같은 브라우저의 여행자 화면에 ‘제주로드트립 · 고객 일정’이 생깁니다. 수정 후 재발송도 반영됩니다. 이 연결은 시연 데이터용이며 실제 알림을 보내지 않습니다.
6. **알림**
   여행자 홈에서 알림 종을 누르고 ‘입장 알림 시연’을 선택하면 배너가 나타납니다. 여행자 화면을 열어 둔 채 같은 브라우저의 다른 탭에서 파트너 바우처를 발송하거나 수정 후 재발송해도 알림이 뜹니다. 알림을 누르면 해당 바우처 상세가 열립니다. 운영체제 푸시나 알림톡은 전송되지 않습니다.

> 프로필, 동행 초대, 기간권, 실시간 QR, 여행사 초대는 시연 화면입니다. 실제 결제나 외부 앱 연결은 이루어지지 않습니다.

<br>

## 기술 스택

![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

React 19 · TypeScript · Vite · React Router · CSS Modules · Service Worker · IndexedDB · qrcode · oxlint

<br>

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기 (오프라인 시연)
npm run lint     # oxlint
```

<br>

## 폴더 구조

```
src/
├─ main.tsx                # 진입점 (폰트·전역 CSS 로드)
├─ app/                    # App.tsx, router.tsx (라우트 정의)
├─ pages/                  # 라우트 1개 = 폴더 1개
│  ├─ Home/                #   랜딩 (sections/ Hero·Features·Cta)
│  ├─ Demo/                #   앱 시연 페이지
│  ├─ ScreenOnly/          #   /screens/:id — 앱 화면 단독 (캡처·QA 용)
│  ├─ Partner/             #   /partners/* (파트너센터)
│  └─ NotFound/
├─ components/
│  ├─ layout/              # Header, Footer, Layout (사이트 공통)
│  └─ ui/                  # Button, Container, Section
├─ features/
│  ├─ app-screens/         # Figma 하이파이 앱 화면 (393×852)
│  │  ├─ screens/          #   화면 1개 = 파일 1개 (+ .module.css)
│  │  ├─ parts/            #   StatusBar, QrCode, Avatar, icons 등 화면 공용 부품
│  │  ├─ registry.ts       #   화면 목록·순서·설명 (시연 순서는 여기서)
│  │  ├─ mock.ts           #   시나리오 데이터 (여행 여러 개, 여행사 일정/내 일정 구분)
│  │  └─ store.ts          #   화면 간 시연 상태 (선택한 여행·날짜, 저장 여부)
│  ├─ demo/                # PhoneFrame(화면 축소 틀), DemoPlayer(시연 플레이어·뒤로가기)
│  └─ partner/             # 파트너센터 레이아웃·공용 컴포넌트·상태 관리
├─ data/                   # 사이트 문구·기능 목록·목 데이터 ← 텍스트 수정은 여기
├─ offline/                # 서비스 워커 템플릿
├─ hooks/  lib/  types/
├─ styles/                 # global.css, variables.css (라군 틸 디자인 토큰)
└─ assets/icons/           # Figma에서 받은 아이콘 SVG
docs/
└─ admin-plan.md           # 파트너센터 구현 방식·현황
```

<br>

<details>
<summary><b>개발 규칙</b></summary>

- **import 경로**: `@/` = `src/` (예: `import { Button } from '@/components/ui'`)
- **스타일**: 컴포넌트 옆에 `Xxx.module.css` (CSS Modules). 색·간격은 `styles/variables.css` 토큰 사용
- **어디에 둘까?**
  - 여러 페이지에서 쓰는 범용 UI → `components/ui`
  - 특정 기능 묶음(시연 뷰어 등) → `features/<기능명>`
  - 한 페이지에서만 쓰는 블록 → `pages/<페이지>/sections`
- **새 페이지 추가**: `pages/Xxx/XxxPage.tsx` 생성 → `lib/routes.ts`에 경로 추가 → `app/router.tsx`에 등록 → (필요하면) `data/site.ts`의 `nav`에 추가
- **앱 화면 추가**: `features/app-screens/screens/XxxScreen.tsx` 작성 → `registry.ts`의 `SCREENS`에 등록 (시연 목록·`/screens/:id`에 자동 반영)
- **색**: Figma 「디자인 소스 › 라군 틸」 값이 `styles/variables.css`에 있음. 화면에서는 `var(--teal)` 등 토큰만 사용
- **파트너센터 구현 방식**: [docs/admin-plan.md](docs/admin-plan.md)

</details>

<br>

## Team 그게아니라

| 이석민 | 강준우 | 김용태 | 박지성 | 박태현 | 조주이 | 최지범 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 팀장·기획 | 개발 | 기획·개발 | 개발 | 마케팅·디자인 | 개발 | 기획·디자인 |
| [@github]() | [@github]() | [@github]() | [@github]() | [@github]() | [@github]() | [@github]() |

<br>

<sub>2026 한양대학교 ERICA 캡스톤디자인</sub>
