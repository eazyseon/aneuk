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

export const metadata = {
  title: "로그인",
};

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

const steps = [
  {
    title: "1. 세션 생성",
    description: "Google 인증을 마치고 보호 라우트로 이동",
  },
  {
    title: "2. 내 기록 조회",
    description: "목록 페이지에서 최근 방문순으로 표시",
  },
  {
    title: "3. 비교 시작",
    description: "기록을 고르고 `/compare`로 진입",
  },
];

export default function LoginPage() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <section className="aneuk-content grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-5">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                Google OAuth placeholder
              </Badge>
              <div className="space-y-4">
                <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                  로그인 후 내 방 기록만 조용히 모아볼게요.
                </CardTitle>
                <CardDescription className="max-w-xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  이 페이지는 이후 Supabase Google OAuth를 연결할 자리입니다.
                  지금은 버튼, 안내 문구, 보호 라우트 흐름만 먼저 고정해 둡니다.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[22px] border border-border/70 bg-white/45 p-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  실제 구현에서는 이 버튼이 Google 인증을 시작하고, 성공 후
                  `/rooms`로 이동합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full px-4">
                  <Link href="/rooms">Google로 계속하기</Link>
                </Button>
                <Button asChild className="rounded-full px-4" variant="outline">
                  <Link href="/">홈으로</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceClassName}>
            <CardHeader className="gap-3">
              <Badge className="rounded-full" variant="outline">
                로그인 후 흐름
              </Badge>
              <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                보호 영역에 들어간 뒤의 순서
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {steps.map((step) => (
                <Card
                  className="rounded-[22px] border-border/70 bg-white/50 shadow-none"
                  key={step.title}
                  size="sm"
                >
                  <CardHeader className="gap-2">
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {step.description}
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
