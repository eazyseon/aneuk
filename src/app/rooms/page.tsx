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
import {
  buildIdsSearchParams,
  formatCondition,
  formatCurrencyInManwon,
  getRoomRecordMeta,
  getRoomRecordName,
  listRoomRecords,
  parseRecordIds,
  type RoomRecord,
} from "@/lib/room-records";

export const metadata = {
  title: "내 기록",
};

const surfaceClassName = "aneuk-surface";

type RoomsPageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    error?: string;
    ids?: string | string[];
  }>;
};

function getSelectedRecords(records: RoomRecord[], selectedIds: string[]) {
  const selectedIdSet = new Set(selectedIds);
  return records.filter((record) => selectedIdSet.has(record.id));
}

function getConditionSummary(record: RoomRecord) {
  return [
    `수압 ${formatCondition(record.water_pressure)}`,
    `채광 ${formatCondition(record.sunlight)}`,
    `소음 ${formatCondition(record.noise)}`,
    `벌레·위생 ${formatCondition(record.sanitation)}`,
  ].join(" · ");
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const user = await requireUser("/rooms");
  const { created, deleted, error, ids } = await searchParams;
  const selectedIds = parseRecordIds(ids);
  let records: RoomRecord[] = [];
  let loadError = false;

  try {
    records = await listRoomRecords(user.id);
  } catch {
    loadError = true;
  }

  const selectedRecords = getSelectedRecords(records, selectedIds);
  const queueQuery = buildIdsSearchParams(selectedIds);

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
                  로그인한 사용자 기준으로 방 기록을 불러오고, 선택한 항목만 묶어서
                  비교 화면으로 보냅니다.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {created === "1" ? (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
              새 기록을 저장했습니다. 바로 아래에서 비교 후보를 골라볼 수 있습니다.
            </div>
          ) : null}

          {deleted === "1" ? (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
              기록을 삭제했습니다.
            </div>
          ) : null}

          {error === "record_not_found" ? (
            <div className="rounded-[24px] border border-destructive/25 bg-destructive/8 px-5 py-4 text-sm leading-6 text-destructive">
              요청한 기록을 찾을 수 없거나 수정 권한이 없습니다.
            </div>
          ) : null}

          {loadError ? (
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="destructive">
                  load error
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  기록을 불러오지 못했습니다
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Supabase에 `room_records` 테이블과 RLS 정책이 적용됐는지 먼저 확인해
                  주세요.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : records.length === 0 ? (
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="outline">
                  empty state
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  아직 저장된 방 기록이 없습니다
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  첫 기록을 만든 뒤 목록과 비교 흐름이 같은 데이터 위에서 움직이게
                  됩니다.
                </CardDescription>
              </CardHeader>
              <CardFooter className="bg-transparent">
                <Button asChild className="rounded-full px-4">
                  <Link href="/rooms/new">첫 기록 만들기</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <form className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)]" method="get">
              <section className="grid gap-3">
                {records.map((record) => {
                  const isSelected = selectedIds.includes(record.id);

                  return (
                    <Card className={surfaceClassName} key={record.id}>
                      <CardHeader className="gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <input
                                className="size-4 rounded border-input accent-[var(--primary)]"
                                defaultChecked={isSelected}
                                id={`room-record-${record.id}`}
                                name="ids"
                                type="checkbox"
                                value={record.id}
                              />
                              <label
                                className="font-serif text-2xl tracking-[-0.03em]"
                                htmlFor={`room-record-${record.id}`}
                              >
                                {getRoomRecordName(record)}
                              </label>
                            </div>
                            <CardDescription className="text-sm leading-6 text-muted-foreground">
                              {getRoomRecordMeta(record)}
                            </CardDescription>
                          </div>
                          <Badge className="rounded-full" variant={isSelected ? "default" : "outline"}>
                            {isSelected ? "비교 큐에 포함" : "선택 가능"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="rounded-full" variant="outline">
                            관리비 {formatCurrencyInManwon(record.maintenance_fee)}
                          </Badge>
                          {record.address ? (
                            <Badge className="rounded-full" variant="secondary">
                              {record.address}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {getConditionSummary(record)}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {record.note ?? "남겨둔 메모가 아직 없습니다."}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-wrap justify-between gap-2 bg-transparent">
                        <Badge className="rounded-full" variant="outline">
                          체크 후 비교 큐에 반영
                        </Badge>
                        <Button asChild className="rounded-full px-4" size="sm" variant="outline">
                          <Link href={`/rooms/${record.id}`}>상세 보기</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </section>

              <aside className="grid gap-4">
                <Card className={surfaceClassName}>
                  <CardHeader className="gap-3">
                    <Badge className="rounded-full" variant="outline">
                      비교 큐
                    </Badge>
                    <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                      선택한 기록 {selectedRecords.length}개
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      2개 이상 고르면 비교 화면으로 바로 보낼 수 있습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRecords.length > 0 ? (
                      selectedRecords.map((record) => (
                        <div
                          className="rounded-[20px] border border-border/70 bg-white/45 p-4"
                          key={`queue-${record.id}`}
                        >
                          <p className="font-medium">{getRoomRecordName(record)}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getRoomRecordMeta(record)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[20px] border border-dashed border-border/80 bg-white/35 p-4 text-sm leading-6 text-muted-foreground">
                        왼쪽 카드에서 비교할 기록을 체크한 뒤 선택 반영을 눌러 주세요.
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-2 bg-transparent">
                    <Button className="w-full rounded-full" formAction="/rooms" formMethod="get" variant="outline">
                      선택 반영
                    </Button>
                    <Button
                      className="w-full rounded-full"
                      formAction="/compare"
                      formMethod="get"
                    >
                      선택한 기록 비교하기
                    </Button>
                    {selectedRecords.length >= 2 ? (
                      <Link
                        className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                        href={`/compare?${queueQuery}`}
                      >
                        현재 선택을 링크로 열기
                      </Link>
                    ) : null}
                  </CardFooter>
                </Card>

                <Card className={surfaceClassName}>
                  <CardHeader className="gap-2">
                    <CardTitle className="font-serif text-2xl">현재 기준</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      총점 계산 없이 가격, 상태, 메모, 미입력 값을 그대로 보여주는 것이
                      v1의 기준입니다.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </aside>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
