import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";

export const metadata = {
  title: "내 기록",
};

const records = [
  {
    name: "신림동 / 2026-06-09",
    visitedAt: "2026-06-09",
    rent: "55만원",
    status: "비교 후보",
    note: "수압 메모 있음 · 관리비 미입력",
  },
  {
    name: "봉천동 햇빛 좋던 방",
    visitedAt: "2026-06-07",
    rent: "62만원",
    status: "기록 완료",
    note: "채광 좋음 · 관리비 7만원",
  },
  {
    name: "서울대입구역 도보 8분",
    visitedAt: "2026-06-03",
    rent: "50만원",
    status: "비교 후보",
    note: "수압 좋음 · 옵션 메모 있음",
  },
];

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

export default async function RoomsPage() {
  await requireUser("/rooms");

  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">my records</span>
            <strong>아늑</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full px-4" variant="outline">
              <Link href="/compare">비교 화면</Link>
            </Button>
            <Button asChild className="rounded-full px-4">
              <Link href="/rooms/new">새 기록</Link>
            </Button>
            <SignOutButton />
          </div>
        </nav>

        <section className="aneuk-content grid gap-5">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-4">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                recent first
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                  최근에 본 방부터 차례로 정리합니다
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  이후 실제 구현에서는 여기에 로그인 사용자 기준의 기록 목록과
                  비교용 선택 상태가 들어갑니다.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)]">
            <section className="grid gap-3">
              {records.map((record) => (
                <Card
                  className={surfaceClassName}
                  key={`${record.name}-${record.visitedAt}`}
                >
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <CardTitle className="font-serif text-2xl tracking-[-0.03em]">
                          {record.name}
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-muted-foreground">
                          방문일 {record.visitedAt} · 월세 {record.rent}
                        </CardDescription>
                      </div>
                      <Badge
                        className="rounded-full"
                        variant={
                          record.status === "비교 후보" ? "default" : "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {record.note}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-between gap-2 bg-transparent">
                    <Badge className="rounded-full" variant="outline">
                      최근 방문순
                    </Badge>
                    <div className="flex gap-2">
                      <Button className="rounded-full px-4" size="sm" variant="outline">
                        상세 보기
                      </Button>
                      <Button className="rounded-full px-4" size="sm">
                        비교에 담기
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </section>

            <aside className="grid gap-4">
              <Card className={surfaceClassName}>
                <CardHeader className="gap-3">
                  <Badge className="rounded-full" variant="outline">
                    비교 큐
                  </Badge>
                  <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                    선택한 기록을 모아두는 자리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {records
                    .filter((record) => record.status === "비교 후보")
                    .map((record) => (
                      <div
                        className="rounded-[20px] border border-border/70 bg-white/45 p-4"
                        key={`queue-${record.name}`}
                      >
                        <p className="font-medium">{record.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          월세 {record.rent} · 비교 화면 진입 예정
                        </p>
                      </div>
                    ))}
                </CardContent>
                <CardFooter className="bg-transparent">
                  <Button asChild className="w-full rounded-full">
                    <Link href="/compare">2개 기록 비교하기</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className={surfaceClassName}>
                <CardHeader className="gap-2">
                  <CardTitle className="font-serif text-2xl">다음 단계</CardTitle>
                  <CardDescription className="text-sm leading-6 text-muted-foreground">
                    로그인 연동 후 이 페이지에서 기록 선택, 정렬, 비교 진입을
                    실제 상태로 연결합니다.
                  </CardDescription>
                </CardHeader>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
