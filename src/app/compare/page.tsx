import Link from "next/link";

export const metadata = {
  title: "비교",
};

export default function ComparePage() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">comparison matrix</span>
            <strong>아늑</strong>
          </div>
          <div className="aneuk-links">
            <Link className="aneuk-link" href="/rooms">
              목록으로
            </Link>
          </div>
        </nav>

        <section className="aneuk-content aneuk-grid">
          <article className="aneuk-card aneuk-stack">
            <h1 className="aneuk-title">같은 기준으로 조용히 비교하는 화면</h1>
            <p className="aneuk-copy">
              실제 구현에서는 선택한 방만 URL 쿼리로 받고, 내 기록인지 서버에서
              다시 검증한 뒤 렌더링합니다.
            </p>
          </article>

          <div className="aneuk-card">
            <table className="aneuk-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>신림동 / 2026-06-09</th>
                  <th>봉천동 햇빛 좋던 방</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>월세</th>
                  <td>55만원</td>
                  <td>62만원</td>
                </tr>
                <tr>
                  <th>수압</th>
                  <td>
                    <span className="aneuk-pill">좋음</span>
                  </td>
                  <td>
                    <span className="aneuk-pill">보통</span>
                  </td>
                </tr>
                <tr>
                  <th>채광</th>
                  <td>
                    <span className="aneuk-pill">미입력</span>
                  </td>
                  <td>
                    <span className="aneuk-pill">좋음</span>
                  </td>
                </tr>
                <tr>
                  <th>소음</th>
                  <td>
                    <span className="aneuk-pill">보통</span>
                  </td>
                  <td>
                    <span className="aneuk-pill">나쁨</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
