import Link from "next/link";

export const metadata = {
  title: "내 기록",
};

const records = [
  {
    name: "신림동 / 2026-06-09",
    meta: "방문일 2026-06-09 · 월세 55만원 · 관리비 미입력",
  },
  {
    name: "봉천동 햇빛 좋던 방",
    meta: "방문일 2026-06-07 · 월세 62만원 · 관리비 7만원",
  },
  {
    name: "서울대입구역 도보 8분",
    meta: "방문일 2026-06-03 · 월세 50만원 · 수압 메모 있음",
  },
];

export default function RoomsPage() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">my records</span>
            <strong>아늑</strong>
          </div>
          <div className="aneuk-links">
            <Link className="aneuk-link" href="/compare">
              비교 화면
            </Link>
            <Link className="aneuk-button" href="/rooms/new">
              새 기록
            </Link>
          </div>
        </nav>

        <section className="aneuk-content aneuk-grid">
          <article className="aneuk-card aneuk-stack">
            <span className="aneuk-eyebrow">recent first</span>
            <h1 className="aneuk-title">최근에 본 방부터 차례로 정리합니다</h1>
            <p className="aneuk-copy">
              이후 실제 구현에서는 여기에 로그인 사용자 기준의 기록 목록과 비교용
              체크박스가 들어갑니다.
            </p>
          </article>

          <div className="aneuk-grid" style={{ gridTemplateColumns: "1.3fr 0.9fr" }}>
            <section className="aneuk-card">
              <div className="aneuk-stack">
                <h3>기록 목록</h3>
                <ul className="aneuk-list">
                  {records.map((record) => (
                    <li className="aneuk-item" key={record.name}>
                      <strong>{record.name}</strong>
                      <div className="aneuk-meta">{record.meta}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="aneuk-card aneuk-stack">
              <h3>다음 단계</h3>
              <p className="aneuk-copy">
                로그인 연동 후 이 페이지에서 기록 선택, 정렬, 비교 진입을 실제
                상태로 연결합니다.
              </p>
              <span className="aneuk-pill">비교 선택 상태는 URL로 보존 예정</span>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
