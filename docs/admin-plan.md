# 파트너센터(여행사 관리자) 구현 방식

> 상태: **1차 구현됨** (YONG, `feat: 관리자 페이지 구현`). Figma 페이지 「파트너센터 (여행사 관리자)」 기준.
>
> 실제 구현 위치: `src/features/partner/` (레이아웃·공용 컴포넌트), `src/pages/Partner/` (상품 등록, 바우처 관리),
> `src/data/partnerVouchers.ts` (목 데이터). 경로는 `/partners` → `/partners/products`, `/partners/vouchers`.
> 색은 `PartnerLayout.module.css` 의 `--p-*` 토큰으로 앱(라군 틸)과 분리돼 있음.
> 아래는 처음 정한 방식이며, 아직 반영 안 된 항목: `src/api/` 데이터 계층, `React.lazy` 분리, 앱 ↔ 관리자 데이터 연동.

## 결론

같은 리액트 앱 안에 `/partners/*` 라우트로 붙인다. 따로 앱을 만들지 않는다.

| 항목 | 정한 방식 |
| --- | --- |
| 위치 | 같은 저장소, 같은 Vite 앱. `/partners` 아래 라우트 |
| 번들 | `React.lazy` 로 분리 → 시연 사이트 첫 로딩에 관리자 코드가 안 실림 |
| 레이아웃 | 전용 `PartnerLayout` (왼쪽 사이드바 + 본문). 사이트 헤더/푸터 안 씀 |
| 테마 | Figma 관리자 화면은 **파란 계열**(앱은 라군 틸). 레이아웃 루트에 `data-theme="partners"` 를 달고 그 아래에서만 색 토큰 덮어쓰기 |
| 데이터 | 백엔드 없음. 목 데이터 + `src/api/partners.ts` 함수(Promise 반환)로만 접근 → 나중에 실제 API 붙일 때 이 파일만 교체 |
| 상태 저장 | 시연 중 수정한 값은 `localStorage` 에 보관 (새로고침해도 유지, 초기화 버튼 제공) |
| 로그인 | 없음 (시연용). 푸터의 「파트너센터」 링크로 진입 |
| 반응형 | 데스크톱 우선 (1280px 기준). 모바일은 "PC에서 확인하세요" 안내만 |

### 따로 앱을 만드는 방식(모노레포)은 안 쓴 이유
- 시연용이라 배포·빌드 설정을 두 벌 관리할 이유가 없음
- 앱 화면과 관리자 화면이 **같은 바우처 데이터**를 보여줘야 시연이 됨 (관리자에서 발급 → 앱 타임라인에 뜸). 한 앱 안이면 목 데이터를 그대로 공유 가능

## 화면 범위

Figma 에 하이파이가 있는 화면부터 만들고, 나머지는 메뉴만 두고 "준비 중" 표시.

| 메뉴 | Figma | 1차 구현 |
| --- | --- | --- |
| 대시보드 | 없음 | 준비 중 |
| 상품 등록·관리 → 새 상품 등록 | **있음** | ✅ 폼 5단계 + 오른쪽 「고객 바우처 미리보기」 실시간 반영 |
| 바우처 관리 | **있음** | ✅ 요약 카드 4개, 상태 탭(전체/발송 대기/발송 완료/사용 완료/취소), 검색·필터, 표, 오른쪽 상세 패널(처리 이력, 사용 처리, 재발송, 취소) |
| 예약 현황 | 없음 | 준비 중 |
| 정산 | 없음 | 준비 중 |
| 업체 설정 | 없음 | 준비 중 |

## 폴더 구조 (예정)

```
src/
├─ api/
│  └─ partners.ts            # getVouchers(), updateVoucher(), createProduct() … (지금은 목 데이터)
├─ features/partners/
│  ├─ layout/PartnerLayout.tsx   # 사이드바 + 본문, data-theme="partners"
│  ├─ components/            # StatusBadge, VoucherTable, VoucherDetailPanel, VoucherPreview, FormSection …
│  ├─ mock/                  # 상품·바우처 목 데이터
│  └─ theme.css              # [data-theme="partners"] 색 토큰
└─ pages/partners/
   ├─ ProductNewPage.tsx
   ├─ VouchersPage.tsx
   └─ ComingSoonPage.tsx
```

라우트 예시:

```tsx
{ path: '/partners', element: <PartnerLayout />, children: [
  { index: true, element: <Navigate to="vouchers" /> },
  { path: 'products/new', lazy: () => import('@/pages/partners/ProductNewPage') },
  { path: 'vouchers', lazy: () => import('@/pages/partners/VouchersPage') },
  { path: '*', element: <ComingSoonPage /> },
]}
```

## 구현 전에 정할 것
- 앱 ↔ 관리자 데이터 연동을 시연에서 보여줄지 (관리자에서 「발송」 → 앱 타임라인에 새 일정 추가). 보여준다면 목 데이터를 `src/api` 한 곳에서 공유.
- 관리자 색: Figma 디자인 소스의 「1. 보딩 블루」로 볼지 확인 필요 (관리자 화면 컬러가 그 팔레트와 비슷함).
