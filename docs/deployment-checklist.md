# Deployment Checklist

아늑을 실제 도메인에 올리기 전과 후에 확인할 항목입니다.

## 1. 배포 전 준비

필수 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
KAKAO_REST_API_KEY=
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=
```

확인할 점

1. `NEXT_PUBLIC_`가 붙은 값은 브라우저에서 사용됩니다.
2. `KAKAO_REST_API_KEY`는 서버에서만 쓰입니다.
3. 환경 변수를 바꾼 뒤에는 새 배포가 필요합니다.

## 2. Supabase

배포 전 체크

1. migration 최신 반영

```bash
supabase db push
```

2. Google 로그인이 켜져 있는지
3. 로그인 복귀 URL이 허용돼 있는지

허용해야 하는 경로

- `http://localhost:3000/auth/callback`
- `https://<your-domain>/auth/callback`

확인 포인트

- 로그인 후 다시 `/login`으로 돌아오면 callback 허용 URL부터 확인
- 보호 페이지 접근 시 바로 로그인으로 튕기는 것은 세션 만료 또는 callback 설정 문제일 가능성이 큼

## 3. Kakao

배포 전 체크

1. Kakao Maps API 활성화
2. JavaScript 키의 사이트 도메인 등록
3. REST API 키 발급 확인

등록해야 하는 origin

- `http://localhost:3000`
- `https://<your-domain>`

확인 포인트

- 지도가 안 뜨면 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`와 도메인 등록 확인
- 생활권 요약이 비어 있으면 `KAKAO_REST_API_KEY` 확인
- 지도는 뜨는데 요약만 비어 있으면 REST 키 또는 주소 정밀도 문제일 가능성이 큼

## 4. 배포 직후 기능 점검

최소 점검 시나리오

1. `/login` 진입
2. Google 로그인 성공
3. `/rooms/new`에서 주소 검색 후 위치 확정
4. 기록 저장 후 `/rooms`에 보이는지 확인
5. `/rooms/[id]`에서 지도 미리보기와 생활권 카드 확인
6. `/compare`에서 정렬과 필터 동작 확인
7. 로그아웃 후 `/login?status=signed_out` 안내 확인

## 5. 문제별 빠른 확인

로그인 실패

- Supabase Google Provider 활성화 여부
- 허용 callback URL 등록 여부
- 배포 도메인 오타 여부

지도 미표시

- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`
- Kakao 사이트 도메인 등록 여부
- 배포 후 새로고침이 아니라 재배포가 필요한지

생활권 정보 미표시

- `KAKAO_REST_API_KEY`
- 주소가 번지나 도로명까지 충분히 구체적인지
- 저장된 좌표가 있는지

세션이 자주 끊기는 것처럼 보임

- [proxy.ts](/Users/eazyseon/Desktop/aneuk/proxy.ts:1)가 배포 빌드에 포함됐는지
- 브라우저에서 쿠키 차단 정책이 과한지

## 6. 운영 중 수정 순서

설정 변경이 있을 때는 이 순서로 가는 게 안전합니다.

1. 로컬에서 env 수정
2. 필요한 경우 `supabase db push`
3. 배포 환경 변수 반영
4. 재배포
5. 로그인과 지도부터 다시 점검
