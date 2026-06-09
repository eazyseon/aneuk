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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "비교",
};

const rows = [
  ["월세", "55만원", "62만원"],
  ["수압", "좋음", "보통"],
  ["채광", "미입력", "좋음"],
  ["소음", "보통", "나쁨"],
  ["벌레·위생", "미입력", "보통"],
];

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

function statusClassName(value: string) {
  if (value === "좋음") {
    return "border-emerald-200 bg-emerald-100 text-emerald-900";
  }

  if (value === "보통") {
    return "border-amber-200 bg-amber-100 text-amber-900";
  }

  if (value === "나쁨") {
    return "border-rose-200 bg-rose-100 text-rose-900";
  }

  if (value === "미입력") {
    return "border-border bg-background text-muted-foreground";
  }

  return "border-border bg-secondary text-secondary-foreground";
}

export default function ComparePage() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">comparison matrix</span>
            <strong>아늑</strong>
          </div>
          <Button asChild className="rounded-full px-4" variant="outline">
            <Link href="/rooms">목록으로</Link>
          </Button>
        </nav>

        <section className="aneuk-content grid gap-5">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-4">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                side-by-side comparison
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                  같은 기준으로 조용히 비교하는 화면
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  실제 구현에서는 선택한 방만 URL 쿼리로 받고, 내 기록인지
                  서버에서 다시 검증한 뒤 렌더링합니다.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_320px]">
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                      비교 매트릭스
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                      미입력 값도 숨기지 않고 그대로 보여줍니다.
                    </CardDescription>
                  </div>
                  <Badge className="rounded-full" variant="outline">
                    2개 기록 선택됨
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/80 hover:bg-transparent">
                      <TableHead className="w-40 text-muted-foreground">항목</TableHead>
                      <TableHead>신림동 / 2026-06-09</TableHead>
                      <TableHead>봉천동 햇빛 좋던 방</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(([label, first, second]) => (
                      <TableRow className="border-border/70 hover:bg-white/30" key={label}>
                        <TableCell className="font-medium text-foreground">
                          {label}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-full border ${statusClassName(first)}`}
                            variant="outline"
                          >
                            {first}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-full border ${statusClassName(second)}`}
                            variant="outline"
                          >
                            {second}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <aside className="grid gap-4">
              <Card className={surfaceClassName}>
                <CardHeader className="gap-3">
                  <Badge className="rounded-full" variant="outline">
                    읽는 방식
                  </Badge>
                  <CardTitle className="font-serif text-2xl">
                    이 화면은 판단을 대신하지 않습니다
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>가격, 상태, 미입력 값을 같은 밀도로 보여주는 것이 v1의 목적입니다.</p>
                  <p>총점 계산이나 자동 추천은 의도적으로 제외했습니다.</p>
                </CardContent>
              </Card>

              <Card className={surfaceClassName}>
                <CardHeader className="gap-3">
                  <CardTitle className="font-serif text-2xl">상태 범례</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge className={`rounded-full border ${statusClassName("좋음")}`} variant="outline">
                    좋음
                  </Badge>
                  <Badge className={`rounded-full border ${statusClassName("보통")}`} variant="outline">
                    보통
                  </Badge>
                  <Badge className={`rounded-full border ${statusClassName("나쁨")}`} variant="outline">
                    나쁨
                  </Badge>
                  <Badge
                    className={`rounded-full border ${statusClassName("미입력")}`}
                    variant="outline"
                  >
                    미입력
                  </Badge>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
