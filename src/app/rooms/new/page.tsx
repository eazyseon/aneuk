import Link from "next/link";

import { createRoomRecord } from "@/app/rooms/new/actions";
import { RoomRecordActionForm } from "@/components/rooms/room-record-action-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";

export const metadata = {
  title: "새 기록",
};

const principles = [
  {
    title: "필수값 최소화",
    description: "방문일 + 동네명만 필수",
  },
  {
    title: "부분 입력 허용",
    description: "현장에서 아는 값만 먼저 저장",
  },
  {
    title: "월세 기준",
    description: "전세/단기임대는 이후 단계에서 확장",
  },
];

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

export default async function NewRoomPage() {
  await requireUser("/rooms/new");

  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">new room record</span>
            <strong>아늑</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full px-4" variant="outline">
              <Link href="/rooms">목록으로</Link>
            </Button>
            <SignOutButton />
          </div>
        </nav>

        <section className="aneuk-content grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
            <Card className={surfaceClassName}>
            <CardHeader className="gap-4">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                quick room form
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                  현장에서 바로 남길 수 있는 최소 입력 폼
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  실제 구현에서는 `방문일`과 `동네명`만 필수로 두고, 별칭은
                  비워두면 자동 생성되도록 연결합니다.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <RoomRecordActionForm
                action={createRoomRecord}
                cancelHref="/rooms"
                footerBadge="비어 있는 값은 나중에 다시 입력 가능"
                helperText={
                  <>
                    주소 검색이나 지도 클릭으로 위치를 먼저 확정해 두면, 저장 후 상세 화면에서
                    근처 지하철역, 마트, 공원, 헬스장 요약까지 바로 이어서 볼 수 있습니다.
                  </>
                }
                submitIdleLabel="기록 저장하기"
                submitPendingLabel="저장 중..."
              />
            </CardContent>
          </Card>

          <aside className="grid gap-4">
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="outline">
                  v1 입력 원칙
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  입력 부담을 줄이는 기준
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {principles.map((principle) => (
                  <Card
                    className="rounded-[22px] border-border/70 bg-white/50 shadow-none"
                    key={principle.title}
                    size="sm"
                  >
                    <CardHeader className="gap-2">
                      <CardTitle className="text-base">{principle.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-muted-foreground">
                    {principle.description}
                  </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className={surfaceClassName}>
              <CardHeader className="gap-2">
                <CardTitle className="font-serif text-2xl">지도 입력 방식</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  주소 검색으로 먼저 위치를 찾고, 핀을 드래그하거나 지도를 눌러 실제로 보려는
                  집 위치를 더 세밀하게 맞춥니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}
