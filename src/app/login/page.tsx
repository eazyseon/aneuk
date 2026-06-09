import Link from "next/link";

export const metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <section className="aneuk-content aneuk-grid aneuk-grid-hero">
          <article className="aneuk-card aneuk-stack">
            <span className="aneuk-eyebrow">google auth placeholder</span>
            <h1 className="aneuk-title">로그인 후 내 방 기록만 조용히 모아볼게요.</h1>
            <p className="aneuk-copy">
              이 페이지는 이후 Supabase Google OAuth를 연결할 자리입니다.
              지금은 화면 뼈대만 먼저 고정해 둡니다.
            </p>
            <div className="aneuk-links">
              <Link className="aneuk-button" href="/rooms">
                Google로 계속하기
              </Link>
              <Link className="aneuk-link" href="/">
                홈으로
              </Link>
            </div>
          </article>

          <aside className="aneuk-card aneuk-stack">
            <h2>로그인 후 기대 흐름</h2>
            <ul className="aneuk-list">
              <li className="aneuk-item">
                <strong>1. 세션 생성</strong>
                <div className="aneuk-meta">Google 인증을 마치고 보호 라우트로 이동</div>
              </li>
              <li className="aneuk-item">
                <strong>2. 내 기록 조회</strong>
                <div className="aneuk-meta">목록 페이지에서 최근 방문순으로 표시</div>
              </li>
              <li className="aneuk-item">
                <strong>3. 비교 시작</strong>
                <div className="aneuk-meta">기록을 고르고 `/compare`로 진입</div>
              </li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
