# aneuk

아늑은 자취방을 둘러볼 때 남긴 기록을 모으고, 같은 기준으로 차분하게 비교하는 개인용 Next.js 앱입니다.

## 현재 범위

- Google OAuth 로그인
- 로그인 사용자 기준 방 기록 생성, 조회, 수정, 삭제
- 내 기록 상세 화면
- 선택한 기록 비교
- 주소가 구체적으로 입력된 기록은 근처 지하철역, 마트, 공원, 헬스장 요약 표시
- 카카오 지도에서 위치 선택 후 주소/좌표 저장

지도에서 선택한 위치는 `address`, `latitude`, `longitude` 컬럼에 저장됩니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- Supabase SSR
- Tailwind CSS 4

## 로컬 실행

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
KAKAO_REST_API_KEY=your-kakao-rest-api-key
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-javascript-key
```

예시는 [.env.local.example](/Users/eazyseon/Desktop/aneuk/.env.local.example:1)에 있습니다.

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase 브라우저용 publishable key
- `KAKAO_REST_API_KEY`: 서버에서 주소 보정과 근처 생활권 요약을 계산할 때 사용
- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`: 브라우저에서 카카오 지도 SDK를 띄울 때 사용

`NEXT_PUBLIC_`가 붙은 값은 클라이언트 번들에 포함되므로, Kakao JavaScript 키와 Supabase publishable key만 여기에 둡니다.

## Supabase 설정

1. migration 적용

```bash
supabase db push
```

2. Google 로그인을 켭니다.
3. `http://localhost:3000/auth/callback`을 로그인 복귀 URL로 허용합니다.
4. 배포 도메인을 쓸 때는 `https://<your-domain>/auth/callback`도 같이 허용합니다.

이 스키마는 다음을 포함합니다.

- `room_records` 테이블
- `auth.uid() = user_id` 기준 RLS 정책
- 이후 지도 연동을 위한 주소/좌표 컬럼

## Kakao 설정

1. Kakao Maps API를 활성화합니다.
2. JavaScript 키의 사이트 도메인에 다음 origin을 등록합니다.
- `http://localhost:3000`
- `https://<your-domain>`
3. REST API 키는 서버에서만 사용합니다.

지도가 안 뜨면 JavaScript 키 또는 도메인 등록을 먼저 확인하고, 생활권 요약이 비어 있으면 REST API 키를 먼저 확인하면 됩니다.

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

## 배포 체크리스트

배포 전/후 체크는 [docs/deployment-checklist.md](/Users/eazyseon/Desktop/aneuk/docs/deployment-checklist.md:1)에 따로 정리했습니다.

최소 확인 항목은 이 5개입니다.

1. 배포 환경 변수 4개가 모두 들어갔는지
2. Supabase에 배포 도메인의 `/auth/callback`이 허용돼 있는지
3. Kakao JavaScript 키에 배포 origin이 등록돼 있는지
4. `supabase db push`가 최신 migration까지 반영됐는지
5. 로그인, 새 기록 저장, 상세 지도, 비교 화면이 실제 배포 URL에서 동작하는지
