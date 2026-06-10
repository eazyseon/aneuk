import Link from "next/link";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/guards";
import {
  buildIdsSearchParams,
  formatCondition,
  formatCurrencyInManwon,
  getRoomRecordName,
  listRoomRecordsByIds,
  parseRecordIds,
  type RoomCondition,
  type RoomRecord,
} from "@/lib/room-records";

export const metadata = {
  title: "비교",
};

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

type CompareField = {
  label: string;
  kind: "text" | "money" | "condition";
  value: (record: RoomRecord) => number | string | RoomCondition | null;
};

const compareFields: CompareField[] = [
  { label: "방문일", kind: "text", value: (record) => record.visited_at },
  { label: "동네", kind: "text", value: (record) => record.district_name },
  { label: "주소", kind: "text", value: (record) => record.address },
  { label: "월세", kind: "money", value: (record) => record.monthly_rent },
  { label: "관리비", kind: "money", value: (record) => record.maintenance_fee },
  { label: "수압", kind: "condition", value: (record) => record.water_pressure },
  { label: "채광", kind: "condition", value: (record) => record.sunlight },
  { label: "소음", kind: "condition", value: (record) => record.noise },
  { label: "벌레·위생", kind: "condition", value: (record) => record.sanitation },
];

function statusClassName(value: RoomCondition | null) {
  if (value === "good") {
    return "border-emerald-200 bg-emerald-100 text-emerald-900";
  }

  if (value === "okay") {
    return "border-amber-200 bg-amber-100 text-amber-900";
  }

  if (value === "bad") {
    return "border-rose-200 bg-rose-100 text-rose-900";
  }

  return "border-border bg-secondary text-secondary-foreground";
}

function formatCompareValue(field: CompareField, value: number | string | RoomCondition | null) {
  if (field.kind === "condition") {
    return formatCondition((value as RoomCondition | null) ?? null);
  }

  if (field.kind === "money") {
    return formatCurrencyInManwon((value as number | null) ?? null);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return "미입력";
}

type ComparePageProps = {
  searchParams: Promise<{
    ids?: string | string[];
  }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const user = await requireUser("/compare");
  const { ids } = await searchParams;
  const selectedIds = parseRecordIds(ids);
  let records: RoomRecord[] = [];
  let loadError = false;

  if (selectedIds.length > 0) {
    try {
      records = await listRoomRecordsByIds(user.id, selectedIds);
    } catch {
      loadError = true;
    }
  }

  const backHref = selectedIds.length > 0 ? `/rooms?${buildIdsSearchParams(selectedIds)}` : "/rooms";
  const missingCount = Math.max(selectedIds.length - records.length, 0);

  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">comparison matrix</span>
            <strong>아늑</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full px-4" variant="outline">
              <Link href="/rooms">목록으로</Link>
            </Button>
            <SignOutButton />
          </div>
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
                  URL로 넘긴 기록 id만 받고, 서버에서 현재 로그인 사용자의 기록인지
                  다시 확인한 뒤 비교합니다.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {loadError ? (
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="destructive">
                  load error
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  비교 데이터를 불러오지 못했습니다
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Supabase 테이블 또는 정책 설정을 먼저 확인해 주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="rounded-full px-4" variant="outline">
                  <Link href={backHref}>목록으로 돌아가기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : records.length < 2 ? (
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="outline">
                  selection needed
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  비교하려면 기록 2개 이상이 필요합니다
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  목록에서 체크박스로 기록을 고른 뒤 비교 화면으로 다시 들어와 주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="rounded-full px-4">
                  <Link href={backHref}>기록 고르러 가기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                      {records.length}개 기록 선택됨
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {missingCount > 0 ? (
                    <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      요청한 기록 중 {missingCount}개는 현재 사용자 소유가 아니거나 이미
                      삭제되어 제외했습니다.
                    </div>
                  ) : null}
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/80 hover:bg-transparent">
                        <TableHead className="w-40 text-muted-foreground">항목</TableHead>
                        {records.map((record) => (
                          <TableHead key={record.id}>{getRoomRecordName(record)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compareFields.map((field) => (
                        <TableRow className="border-border/70 hover:bg-white/30" key={field.label}>
                          <TableCell className="font-medium text-foreground">
                            {field.label}
                          </TableCell>
                          {records.map((record) => {
                            const value = field.value(record);
                            const text = formatCompareValue(field, value);

                            return (
                              <TableCell key={`${field.label}-${record.id}`}>
                                <Badge
                                  className={`rounded-full border ${field.kind === "condition" ? statusClassName(value as RoomCondition | null) : "border-border bg-background text-foreground"}`}
                                  variant="outline"
                                >
                                  {text}
                                </Badge>
                              </TableCell>
                            );
                          })}
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
                    <p>가격, 상태, 메모, 미입력 값을 같은 밀도로 보여주는 것이 v1의 목적입니다.</p>
                    <p>총점 계산이나 자동 추천은 의도적으로 제외했습니다.</p>
                  </CardContent>
                </Card>

                <Card className={surfaceClassName}>
                  <CardHeader className="gap-3">
                    <CardTitle className="font-serif text-2xl">기록 메모</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {records.map((record) => (
                      <div
                        className="rounded-[20px] border border-border/70 bg-white/45 p-4"
                        key={`note-${record.id}`}
                      >
                        <p className="font-medium">{getRoomRecordName(record)}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {record.note ?? "남겨둔 메모가 아직 없습니다."}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className={surfaceClassName}>
                  <CardHeader className="gap-3">
                    <CardTitle className="font-serif text-2xl">상태 범례</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge className={`rounded-full border ${statusClassName("good")}`} variant="outline">
                      좋음
                    </Badge>
                    <Badge className={`rounded-full border ${statusClassName("okay")}`} variant="outline">
                      보통
                    </Badge>
                    <Badge className={`rounded-full border ${statusClassName("bad")}`} variant="outline">
                      나쁨
                    </Badge>
                    <Badge className="rounded-full border border-border bg-background text-muted-foreground" variant="outline">
                      미입력
                    </Badge>
                  </CardContent>
                </Card>
              </aside>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
