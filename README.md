# aneuk

아늑은 자취방을 둘러볼 때 남긴 기록을 모으고, 같은 기준으로 차분하게 비교하는 개인용 Next.js 앱입니다.

## 현재 범위

- Google OAuth 로그인
- 로그인 사용자 기준 방 기록 생성, 조회, 수정, 삭제
- 내 기록 상세 화면
- 선택한 기록 비교

지도는 아직 붙이지 않았지만, 이후 단계를 위해 `address`, `latitude`, `longitude` 컬럼은 스키마에 포함했습니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- Supabase SSR
- Tailwind CSS 4

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경 변수

`.env.local`을 만들고 다음 값을 넣습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-project-publishable-key
```

예시는 [.env.local.example](/Users/eazyseon/Desktop/aneuk/.env.local.example:1)에 있습니다.

## Supabase 설정

1. SQL Editor에서 [supabase/migrations/20260610113000_create_room_records.sql](/Users/eazyseon/Desktop/aneuk/supabase/migrations/20260610113000_create_room_records.sql:1)을 실행합니다.
2. Authentication > Providers에서 Google Provider를 켭니다.
3. Redirect URL에 `http://localhost:3000/auth/callback`을 등록합니다.

이 스키마는 다음을 포함합니다.

- `room_records` 테이블
- `auth.uid() = user_id` 기준 RLS 정책
- 이후 지도 연동을 위한 주소/좌표 컬럼

## 주요 라우트

- `/login`: Google 로그인
- `/rooms`: 내 기록 목록과 비교 선택
- `/rooms/new`: 새 기록 저장 폼
- `/compare`: 선택한 기록 비교

## 구현 메모

- 읽기: Server Component에서 Supabase 직접 조회
- 쓰기: Server Action으로 저장
- 세션 갱신: 루트 [proxy.ts](/Users/eazyseon/Desktop/aneuk/proxy.ts:1)에서 처리
- 비교 화면은 URL의 `ids`를 받고, 서버에서 현재 사용자 소유 기록만 다시 검증합니다.
