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

const surfaceClassName = "aneuk-surface";

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
                  본 집의 느낌을 현장에서 바로 붙잡는 기록 폼
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  방문일과 동네명만 먼저 적고 나머지는 아는 만큼만 채워도 됩니다.
                  주소는 검색과 핀 선택으로 정확히 잡아두고, 나중에 비교 기준은 다시
                  천천히 보완하는 흐름에 맞춘 입력 화면입니다.
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
                    지도에서 집 위치를 먼저 정확히 잡아 두면, 저장 직후 상세 화면에서
                    근처 지하철역, 마트, 공원, 헬스장까지 한 번에 이어서 확인할 수 있습니다.
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
                  입력을 오래 붙잡지 않는 기준
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
                  주소 검색으로 대략 위치를 잡고, 핀을 드래그하거나 지도를 눌러 실제로
                  보려는 건물 위치에 가깝게 미세 조정합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}
