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
    description: "Google 로그인 진입 화면",
  },
  {
    href: "/rooms",
    label: "/rooms",
    description: "내 방 기록 목록과 비교 진입",
  },
  {
    href: "/rooms/new",
    label: "/rooms/new",
    description: "새 방 기록 작성 폼",
  },
  {
    href: "/compare",
    label: "/compare",
    description: "선택한 방들을 같은 기준으로 비교",
  },
];

const highlights = [
  { label: "v1 범위", value: "로그인 + 기록 + 비교" },
  { label: "입력 원칙", value: "부분 입력 허용" },
  { label: "기록 단위", value: "월세 기준" },
];

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

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
                현장에서 빠르게, 집에 와서 차분하게
              </Badge>
              <div className="space-y-4">
                <CardTitle className="font-serif text-4xl leading-[0.96] tracking-[-0.04em] md:text-6xl">
                  내가 본 방을 잊지 않게 남기는 기록 습관
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  아늑은 자취방을 둘러볼 때 놓치기 쉬운 수압, 습기, 채광, 소음
                  같은 현장 감각을 정리하고 같은 기준으로 비교하기 위한 개인용
                  앱입니다.
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
                준비된 라우트
              </Badge>
              <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                지금 둘러볼 수 있는 화면
              </CardTitle>
              <CardDescription className="text-base leading-7 text-muted-foreground">
                다음 단계부터는 이 뼈대 위에 인증과 실제 데이터를 연결합니다.
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
