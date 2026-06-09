import Link from "next/link";

export default function Home() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">room record app</span>
            <strong>아늑</strong>
          </div>
          <div className="aneuk-links">
            <Link className="aneuk-link" href="/login">
              로그인
            </Link>
            <Link className="aneuk-link" href="/rooms">
              기록 보기
            </Link>
            <Link className="aneuk-button" href="/rooms/new">
              새 기록
            </Link>
          </div>
        </nav>

        <section className="aneuk-content aneuk-grid aneuk-grid-hero">
          <article className="aneuk-card aneuk-stack">
            <span className="aneuk-badge">현장에서 빠르게, 집에 와서 차분하게</span>
            <h1 className="aneuk-title">내가 본 방을 잊지 않게 남기는 기록 습관</h1>
            <p className="aneuk-copy">
              아늑은 자취방을 둘러볼 때 놓치기 쉬운 수압, 습기, 채광, 소음 같은
              현장 감각을 정리하고 같은 기준으로 비교하기 위한 개인용 앱입니다.
            </p>

            <div className="aneuk-kpis">
              <div className="aneuk-kpi">
                <span>v1 범위</span>
                <strong>로그인 + 기록 + 비교</strong>
              </div>
              <div className="aneuk-kpi">
                <span>입력 원칙</span>
                <strong>부분 입력 허용</strong>
              </div>
              <div className="aneuk-kpi">
                <span>기록 단위</span>
                <strong>월세 기준</strong>
              </div>
            </div>
          </article>

          <aside className="aneuk-card aneuk-stack">
            <h2>이번에 잡아둔 라우트</h2>
            <ul className="aneuk-list">
              <li className="aneuk-item">
                <strong>/login</strong>
                <div className="aneuk-meta">Google 로그인 진입 화면</div>
              </li>
              <li className="aneuk-item">
                <strong>/rooms</strong>
                <div className="aneuk-meta">내 방 기록 목록과 비교 진입</div>
              </li>
              <li className="aneuk-item">
                <strong>/rooms/new</strong>
                <div className="aneuk-meta">새 방 기록 작성 폼</div>
              </li>
              <li className="aneuk-item">
                <strong>/compare</strong>
                <div className="aneuk-meta">선택한 방들을 같은 기준으로 비교</div>
              </li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
