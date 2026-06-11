import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteRoomRecord, updateRoomRecord } from "@/app/rooms/[id]/actions";
import { RoomRecordActionForm } from "@/components/rooms/room-record-action-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DeleteRoomRecordButton } from "@/components/rooms/delete-room-record-button";
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
import {
  formatCondition,
  formatCurrencyInManwon,
  getRoomRecordById,
  getRoomRecordName,
} from "@/lib/room-records";
import {
  getNearbyAmenityInsights,
  resolveRecordLocation,
} from "@/lib/location-insights";

export const metadata = {
  title: "기록 상세",
};

const surfaceClassName =
  "rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,249,240,0.82))] shadow-[var(--shadow)] backdrop-blur-sm";

type RoomDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    updated?: string;
  }>;
};

export default async function RoomDetailPage({
  params,
  searchParams,
}: RoomDetailPageProps) {
  const { id } = await params;
  const { updated } = await searchParams;
  const user = await requireUser(`/rooms/${id}`);

  let record = null;
  let loadError = false;

  try {
    record = await getRoomRecordById(user.id, id);
  } catch {
    loadError = true;
  }

  if (!loadError && !record) {
    notFound();
  }

  if (loadError || !record) {
    return (
      <div className="aneuk-shell">
        <main className="aneuk-frame">
          <section className="aneuk-content grid gap-5">
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="destructive">
                  load error
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  기록을 불러오지 못했습니다
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  잠시 후 다시 시도하거나 목록으로 돌아가 주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="rounded-full px-4">
                  <Link href="/rooms">목록으로 돌아가기</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    );
  }

  const resolvedLocation = await resolveRecordLocation(record);
  const nearbyAmenities =
    "reason" in resolvedLocation
      ? []
      : await getNearbyAmenityInsights(
          resolvedLocation.latitude,
          resolvedLocation.longitude,
        );
  const amenityBasisNote =
    "reason" in resolvedLocation
      ? null
      : resolvedLocation.source === "stored_coordinates"
        ? "저장된 좌표 기준"
        : "저장된 주소를 다시 좌표로 변환한 근사 기준";

  let amenityMessage: string | null = null;

  if ("reason" in resolvedLocation) {
    if (resolvedLocation.reason === "missing_location") {
      amenityMessage = "주소나 좌표가 아직 없어 근처 생활권을 계산할 수 없습니다.";
    } else if (resolvedLocation.reason === "address_needs_detail") {
      amenityMessage =
        "근처 생활권을 계산하려면 주소를 도로명이나 번지까지 더 자세히 입력해 주세요.";
    } else if (resolvedLocation.reason === "api_unavailable") {
      amenityMessage =
        "KAKAO_REST_API_KEY를 설정하면 근처 지하철역, 마트, 공원, 헬스장 요약을 볼 수 있습니다.";
    } else {
      amenityMessage =
        "입력한 주소로 위치를 찾지 못했습니다. 주소를 더 정확히 적어 주세요.";
    }
  } else if (nearbyAmenities.length === 0) {
    amenityMessage =
      "근처 생활권 정보를 찾지 못했습니다. 잠시 후 다시 시도하거나 주소를 더 정확히 입력해 주세요.";
  }

  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <nav className="aneuk-nav">
          <div className="aneuk-brand">
            <span className="aneuk-eyebrow">room record detail</span>
            <strong>아늑</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full px-4" variant="outline">
              <Link href="/rooms">목록으로</Link>
            </Button>
            <Button asChild className="rounded-full px-4" variant="outline">
              <Link href="/compare">비교 화면</Link>
            </Button>
            <SignOutButton />
          </div>
        </nav>

        <section className="aneuk-content grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-4">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                room record detail
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                  {getRoomRecordName(record)}
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  저장된 기록을 다시 읽고 바로 수정하거나 삭제할 수 있습니다.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5">
                {updated === "1" ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                    기록을 수정했습니다.
                  </div>
                ) : null}
                <RoomRecordActionForm
                  action={updateRoomRecord}
                  cancelHref="/rooms"
                  footerBadge={`마지막 수정 ${new Date(record.updated_at).toLocaleDateString("ko-KR")}`}
                  helperText={
                    <>
                      지도와 위치 수정 UI는 다음 단계에서 붙입니다. 지금은 저장된 주소와
                      좌표 컬럼을 유지한 채 텍스트 기록을 먼저 안정화합니다.
                    </>
                  }
                  record={record}
                  recordId={record.id}
                  submitIdleLabel="수정 내용 저장"
                  submitPendingLabel="수정 중..."
                />
              </div>
            </CardContent>
          </Card>

          <aside className="grid gap-4">
            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="outline">
                  저장 요약
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  지금 저장된 값
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
                <div className="rounded-[20px] border border-border/70 bg-white/45 p-4">
                  <p>월세 {formatCurrencyInManwon(record.monthly_rent)}</p>
                  <p>관리비 {formatCurrencyInManwon(record.maintenance_fee)}</p>
                  <p>주소 {record.address ?? "미입력"}</p>
                </div>
                <div className="rounded-[20px] border border-border/70 bg-white/45 p-4">
                  <p>수압 {formatCondition(record.water_pressure)}</p>
                  <p>채광 {formatCondition(record.sunlight)}</p>
                  <p>소음 {formatCondition(record.noise)}</p>
                  <p>벌레·위생 {formatCondition(record.sanitation)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="outline">
                  근처 생활권
                </Badge>
                <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                  이 위치에서 가까운 생활 편의
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  카카오 Local API 거리값 기준 직선거리와 도보 예상 시간을 함께 표시합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {amenityBasisNote ? (
                  <div className="rounded-[20px] border border-border/70 bg-white/45 p-4 text-sm leading-6 text-muted-foreground">
                    {amenityBasisNote}
                  </div>
                ) : null}
                {amenityMessage ? (
                  <div className="rounded-[20px] border border-border/70 bg-white/45 p-4 text-sm leading-6 text-muted-foreground">
                    {amenityMessage}
                  </div>
                ) : (
                  nearbyAmenities.map((amenity) => (
                    <div
                      className="rounded-[20px] border border-border/70 bg-white/45 p-4"
                      key={amenity.kind}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{amenity.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {amenity.placeName}
                          </p>
                        </div>
                        <Badge className="rounded-full" variant="secondary">
                          도보 약 {amenity.walkMinutes}분
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        직선거리 {amenity.distanceMeters.toLocaleString("ko-KR")}m ·{" "}
                        {amenity.primaryAddress}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {amenity.categoryName}
                      </p>
                      <a
                        className="mt-2 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
                        href={amenity.placeUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        카카오맵에서 보기
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className={surfaceClassName}>
              <CardHeader className="gap-3">
                <Badge className="rounded-full" variant="destructive">
                  danger zone
                </Badge>
                <CardTitle className="font-serif text-2xl">
                  이 기록 삭제
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  삭제하면 비교 목록과 상세 화면에서도 바로 사라집니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={deleteRoomRecord} className="flex flex-wrap gap-2">
                  <input name="recordId" type="hidden" value={record.id} />
                  <DeleteRoomRecordButton />
                </form>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}
