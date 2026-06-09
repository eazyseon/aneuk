import Link from "next/link";

export const metadata = {
  title: "새 기록",
};

export default function NewRoomPage() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">new room record</span>
            <strong>아늑</strong>
          </div>
          <div className="aneuk-links">
            <Link className="aneuk-link" href="/rooms">
              목록으로
            </Link>
          </div>
        </nav>

        <section className="aneuk-content aneuk-grid aneuk-grid-hero">
          <article className="aneuk-card aneuk-stack">
            <h1 className="aneuk-title">현장에서 바로 남길 수 있는 최소 입력 폼</h1>
            <p className="aneuk-copy">
              실제 구현에서는 `방문일`과 `동네명`만 필수로 두고, 별칭은 비워두면
              자동 생성되도록 연결합니다.
            </p>

            <form className="aneuk-form">
              <div className="aneuk-form-grid">
                <div className="aneuk-field">
                  <label htmlFor="visitedAt">방문일</label>
                  <input className="aneuk-input" id="visitedAt" placeholder="2026-06-09" />
                </div>
                <div className="aneuk-field">
                  <label htmlFor="districtName">동네명</label>
                  <input className="aneuk-input" id="districtName" placeholder="신림동" />
                </div>
              </div>

              <div className="aneuk-form-grid">
                <div className="aneuk-field">
                  <label htmlFor="nickname">별칭</label>
                  <input className="aneuk-input" id="nickname" placeholder="신림역 7분 큰창 방" />
                </div>
                <div className="aneuk-field">
                  <label htmlFor="monthlyRent">월세</label>
                  <input className="aneuk-input" id="monthlyRent" placeholder="55" />
                </div>
              </div>

              <div className="aneuk-field">
                <label htmlFor="note">전체 메모</label>
                <textarea
                  className="aneuk-textarea"
                  id="note"
                  placeholder="수압은 좋았는데 복도 소음이 조금 있었다"
                />
              </div>
            </form>
          </article>

          <aside className="aneuk-card aneuk-stack">
            <h2>v1 입력 원칙</h2>
            <ul className="aneuk-list">
              <li className="aneuk-item">
                <strong>필수값 최소화</strong>
                <div className="aneuk-meta">방문일 + 동네명만 필수</div>
              </li>
              <li className="aneuk-item">
                <strong>부분 입력 허용</strong>
                <div className="aneuk-meta">현장에서 아는 값만 먼저 저장</div>
              </li>
              <li className="aneuk-item">
                <strong>월세 기준</strong>
                <div className="aneuk-meta">전세/단기임대는 이후 단계에서 확장</div>
              </li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
