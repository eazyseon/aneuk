import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const routes = [
  {
    href: "/login",
    label: "/login",
    description: "Google 로그인과 세션 복귀 흐름",
  },
  {
    href: "/rooms",
    label: "/rooms",
    description: "내 기록 목록, 비교 큐, 최근 방문 흐름",
  },
  {
    href: "/rooms/new",
    label: "/rooms/new",
    description: "주소 검색과 지도 핀 선택이 있는 입력 폼",
  },
  {
    href: "/compare",
    label: "/compare",
    description: "생활권까지 포함한 정렬·필터 비교 화면",
  },
];

const highlights = [
  { label: "기록 방식", value: "현장 감각 저장" },
  { label: "위치 입력", value: "지도 핀 확정" },
  { label: "비교 기준", value: "가격 + 생활권" },
];

const surfaceClassName = "aneuk-surface";

export default function Home() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">room record app</span>
            <strong>아늑</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full px-4">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild className="rounded-full px-4" variant="outline">
              <Link href="/rooms">기록 보기</Link>
            </Button>
            <Button asChild className="rounded-full px-4" variant="secondary">
              <Link href="/rooms/new">새 기록</Link>
            </Button>
          </div>
        </nav>

        <section className="aneuk-content grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-5">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                apartment field journal
              </Badge>
              <div className="space-y-4">
                <CardTitle className="font-serif text-4xl leading-[0.96] tracking-[-0.04em] md:text-6xl">
                  하루에 본 집들을 감으로만 넘기지 않게 붙잡아 두는 기록 도구
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  아늑은 자취방을 볼 때 남기는 수압, 채광, 소음, 위치, 생활권 같은
                  현장 메모를 한곳에 모으고, 집에 돌아와 같은 눈금으로 다시 비교하는
                  개인용 기록 앱입니다.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {highlights.map((item) => (
                <Card
                  className="rounded-[22px] border-border/70 bg-white/45 shadow-none"
                  key={item.label}
                  size="sm"
                >
                  <CardHeader className="gap-2">
                    <CardDescription className="text-[0.78rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </CardDescription>
                    <CardTitle className="font-serif text-2xl leading-tight">
                      {item.value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className={surfaceClassName}>
            <CardHeader className="gap-3">
              <Badge className="rounded-full" variant="outline">
                실제로 되는 흐름
              </Badge>
              <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                로그인부터 비교까지 바로 이어집니다
              </CardTitle>
              <CardDescription className="text-base leading-7 text-muted-foreground">
                지금은 목업 단계가 아니라, 실제 저장과 지도 입력, 생활권 비교까지
                한 흐름으로 움직입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {routes.map((route) => (
                <Card
                  className="rounded-[22px] border-border/70 bg-white/50 shadow-none"
                  key={route.href}
                  size="sm"
                >
                  <CardHeader className="gap-2">
                    <CardTitle className="text-base">{route.label}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {route.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
