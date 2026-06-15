import { Fragment } from "react";

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
  getRoomLocationInsightSnapshot,
  type NearbyAmenityInsight,
  type NearbyAmenityKind,
  type RoomLocationInsightSnapshot,
} from "@/lib/location-insights";
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

const surfaceClassName = "aneuk-surface";

type CompareField = {
  label: string;
  kind: "text" | "money" | "condition";
  value: (record: RoomRecord) => number | string | RoomCondition | null;
};

type CompareSection = {
  label: string;
  fields: CompareField[];
};

type CompareSortOption =
  | "selected"
  | "monthly-rent-asc"
  | "monthly-rent-desc"
  | "subway-asc";

type RecordWithInsight = {
  insight: RoomLocationInsightSnapshot;
  record: RoomRecord;
};

const compareSections: CompareSection[] = [
  {
    label: "기본 정보",
    fields: [
      { label: "방문일", kind: "text", value: (record) => record.visited_at },
      { label: "동네", kind: "text", value: (record) => record.district_name },
      { label: "주소", kind: "text", value: (record) => record.address },
    ],
  },
  {
    label: "비용",
    fields: [
      { label: "월세", kind: "money", value: (record) => record.monthly_rent },
      { label: "관리비", kind: "money", value: (record) => record.maintenance_fee },
    ],
  },
  {
    label: "상태",
    fields: [
      { label: "수압", kind: "condition", value: (record) => record.water_pressure },
      { label: "채광", kind: "condition", value: (record) => record.sunlight },
      { label: "소음", kind: "condition", value: (record) => record.noise },
      { label: "벌레·위생", kind: "condition", value: (record) => record.sanitation },
    ],
  },
];

const amenityRows = [
  { kind: "subway", label: "지하철역" },
  { kind: "supermarket", label: "마트" },
  { kind: "park", label: "공원" },
  { kind: "gym", label: "헬스장" },
] satisfies Array<{
  kind: NearbyAmenityKind;
  label: string;
}>;

const compareSortOptions = [
  { label: "선택한 순서", value: "selected" },
  { label: "월세 낮은 순", value: "monthly-rent-asc" },
  { label: "월세 높은 순", value: "monthly-rent-desc" },
  { label: "지하철역 가까운 순", value: "subway-asc" },
] satisfies Array<{
  label: string;
  value: CompareSortOption;
}>;

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

function normalizeTextValue(value: string | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}

function getCompareValueSignature(field: CompareField, record: RoomRecord) {
  const value = field.value(record);

  if (field.kind === "money" || field.kind === "condition") {
    return value ?? null;
  }

  if (typeof value === "string") {
    return normalizeTextValue(value);
  }

  return null;
}

function getLocationStatusMeta(insight: RoomLocationInsightSnapshot) {
  if ("reason" in insight.resolvedLocation) {
    return {
      className: "border-rose-200 bg-rose-50 text-rose-900",
      detail: insight.amenityMessage ?? "위치 확인이 필요합니다.",
      label: "위치 보완 필요",
    };
  }

  if (insight.resolvedLocation.source === "stored_coordinates") {
    return {
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      detail: insight.amenityBasisNote ?? "저장된 좌표 기준",
      label: "좌표 확정",
    };
  }

  return {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    detail: insight.amenityBasisNote ?? "주소 기반 근사",
    label: "주소 근사",
  };
}

function findAmenity(
  insight: RoomLocationInsightSnapshot,
  kind: NearbyAmenityKind,
) {
  return insight.nearbyAmenities.find((amenity) => amenity.kind === kind) ?? null;
}

function formatAmenityDistance(amenity: NearbyAmenityInsight) {
  return `${amenity.distanceMeters.toLocaleString("ko-KR")}m`;
}

function formatWalkEstimate(minutes: number) {
  return `도보 추정 ${minutes}분`;
}

function parseSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isFlagEnabled(value: string | string[] | undefined) {
  return parseSingleValue(value) === "1";
}

function parseSortOption(value: string | string[] | undefined): CompareSortOption {
  const rawValue = parseSingleValue(value);

  if (rawValue === "monthly-rent-asc") {
    return rawValue;
  }

  if (rawValue === "monthly-rent-desc") {
    return rawValue;
  }

  if (rawValue === "subway-asc") {
    return rawValue;
  }

  return "selected";
}

function compareNullableNumbers(
  first: number | null,
  second: number | null,
  direction: "asc" | "desc",
) {
  if (first === null && second === null) {
    return 0;
  }

  if (first === null) {
    return 1;
  }

  if (second === null) {
    return -1;
  }

  return direction === "asc" ? first - second : second - first;
}

function getSubwaySortValue(recordWithInsight: RecordWithInsight) {
  const subwayAmenity = findAmenity(recordWithInsight.insight, "subway");

  return subwayAmenity?.distanceMeters ?? Number.POSITIVE_INFINITY;
}

function sortRecordsWithInsights(
  recordsWithInsights: RecordWithInsight[],
  sortOption: CompareSortOption,
) {
  if (sortOption === "selected") {
    return recordsWithInsights;
  }

  return [...recordsWithInsights].sort((first, second) => {
    if (sortOption === "monthly-rent-asc") {
      return compareNullableNumbers(
        first.record.monthly_rent,
        second.record.monthly_rent,
        "asc",
      );
    }

    if (sortOption === "monthly-rent-desc") {
      return compareNullableNumbers(
        first.record.monthly_rent,
        second.record.monthly_rent,
        "desc",
      );
    }

    return getSubwaySortValue(first) - getSubwaySortValue(second);
  });
}

function shouldShowCompareField(
  field: CompareField,
  recordsWithInsights: RecordWithInsight[],
  options: { differencesOnly: boolean; hideEmpty: boolean },
) {
  const signatures = recordsWithInsights.map(({ record }) =>
    getCompareValueSignature(field, record),
  );
  const allMissing = signatures.every((signature) => signature === null);

  if (options.hideEmpty && allMissing) {
    return false;
  }

  if (!options.differencesOnly) {
    return true;
  }

  return new Set(signatures.map((signature) => JSON.stringify(signature))).size > 1;
}

function getAmenitySignature(amenity: NearbyAmenityInsight | null) {
  if (!amenity) {
    return null;
  }

  return JSON.stringify({
    address: amenity.primaryAddress,
    distanceMeters: amenity.distanceMeters,
    placeName: amenity.placeName,
    walkMinutes: amenity.walkMinutes,
  });
}

function shouldShowAmenityRow(
  kind: NearbyAmenityKind,
  recordsWithInsights: RecordWithInsight[],
  options: { differencesOnly: boolean; hideEmpty: boolean },
) {
  const signatures = recordsWithInsights.map(({ insight }) =>
    getAmenitySignature(findAmenity(insight, kind)),
  );
  const allMissing = signatures.every((signature) => signature === null);

  if (options.hideEmpty && allMissing) {
    return false;
  }

  if (!options.differencesOnly) {
    return true;
  }

  return new Set(signatures).size > 1;
}

function shouldShowLocationStatusRow(
  recordsWithInsights: RecordWithInsight[],
  differencesOnly: boolean,
) {
  if (!differencesOnly) {
    return true;
  }

  const signatures = recordsWithInsights.map(({ insight }) => {
    const locationStatus = getLocationStatusMeta(insight);

    return JSON.stringify({
      detail: locationStatus.detail,
      label: locationStatus.label,
    });
  });

  return new Set(signatures).size > 1;
}

function renderAmenityCell(
  insight: RoomLocationInsightSnapshot,
  kind: NearbyAmenityKind,
) {
  const amenity = findAmenity(insight, kind);

  if (!amenity) {
    return (
      <div className="space-y-2 text-sm leading-6 text-muted-foreground">
        <p>정보 없음</p>
      </div>
    );
  }

  return (
    <div className="min-w-[13rem] space-y-2">
      <p className="font-medium text-foreground">{amenity.placeName}</p>
      <div className="flex flex-wrap gap-2">
        <Badge className="rounded-full" variant="secondary">
          {formatWalkEstimate(amenity.walkMinutes)}
        </Badge>
        <Badge className="rounded-full" variant="outline">
          {formatAmenityDistance(amenity)}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{amenity.primaryAddress}</p>
    </div>
  );
}

type ComparePageProps = {
  searchParams: Promise<{
    differencesOnly?: string | string[];
    hideEmpty?: string | string[];
    ids?: string | string[];
    sort?: string | string[];
  }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const user = await requireUser("/compare");
  const {
    differencesOnly: differencesOnlyParam,
    hideEmpty: hideEmptyParam,
    ids,
    sort: sortParam,
  } = await searchParams;
  const selectedIds = parseRecordIds(ids);
  const sortOption = parseSortOption(sortParam);
  const differencesOnly = isFlagEnabled(differencesOnlyParam);
  const hideEmpty = isFlagEnabled(hideEmptyParam);
  let records: RoomRecord[] = [];
  let recordsWithInsights: RecordWithInsight[] = [];
  let loadError = false;

  if (selectedIds.length > 0) {
    try {
      records = await listRoomRecordsByIds(user.id, selectedIds);

      if (records.length >= 2) {
        recordsWithInsights = await Promise.all(
          records.map(async (record) => ({
            insight: await getRoomLocationInsightSnapshot(record),
            record,
          })),
        );
      }
    } catch {
      loadError = true;
    }
  }

  recordsWithInsights = sortRecordsWithInsights(recordsWithInsights, sortOption);
  records = recordsWithInsights.map(({ record }) => record);

  const visibleCompareSections = compareSections
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) =>
        shouldShowCompareField(field, recordsWithInsights, {
          differencesOnly,
          hideEmpty,
        }),
      ),
    }))
    .filter((section) => section.fields.length > 0);
  const visibleAmenityRows = amenityRows.filter((amenityRow) =>
    shouldShowAmenityRow(amenityRow.kind, recordsWithInsights, {
      differencesOnly,
      hideEmpty,
    }),
  );
  const showLocationStatusRow = shouldShowLocationStatusRow(
    recordsWithInsights,
    differencesOnly,
  );
  const hasVisibleMatrixRows =
    visibleCompareSections.length > 0 || visibleAmenityRows.length > 0 || showLocationStatusRow;

  const backHref = selectedIds.length > 0 ? `/rooms?${buildIdsSearchParams(selectedIds)}` : "/rooms";
  const resetHref =
    selectedIds.length > 0
      ? `/compare?${buildIdsSearchParams(selectedIds)}`
      : "/compare";
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
                  가격과 상태, 생활권을 같은 눈금으로 비교합니다
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  URL로 받은 기록 id를 서버에서 다시 검증하고, 저장된 좌표 또는 주소 기반
                  근사 좌표로 가장 가까운 지하철역, 마트, 공원, 헬스장을 함께 보여줍니다.
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
            <>
              <Card className={surfaceClassName}>
                <CardHeader className="gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                        비교 보기 조절
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                        보고 싶은 기준만 남겨서 컬럼 순서와 비교 항목을 바로 바꿉니다.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sortOption !== "selected" ? (
                        <Badge className="rounded-full" variant="secondary">
                          {compareSortOptions.find((option) => option.value === sortOption)?.label}
                        </Badge>
                      ) : null}
                      {differencesOnly ? (
                        <Badge className="rounded-full" variant="secondary">
                          차이만 보기
                        </Badge>
                      ) : null}
                      {hideEmpty ? (
                        <Badge className="rounded-full" variant="secondary">
                          미입력 숨기기
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form action="/compare" className="grid gap-4 lg:grid-cols-[1.2fr_auto]" method="get">
                    {selectedIds.map((id) => (
                      <input key={`compare-id-${id}`} name="ids" type="hidden" value={id} />
                    ))}
                    <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_1fr]">
                      <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="sort">
                        정렬 기준
                        <select
                          className="h-12 rounded-[18px] border border-input bg-white/55 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          defaultValue={sortOption}
                          id="sort"
                          name="sort"
                        >
                          {compareSortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="grid gap-3 rounded-[22px] border border-border/70 bg-white/45 p-4">
                        <label className="flex items-center gap-3 text-sm text-foreground">
                          <input
                            className="h-4 w-4 accent-[var(--accent)]"
                            defaultChecked={differencesOnly}
                            name="differencesOnly"
                            type="checkbox"
                            value="1"
                          />
                          차이가 있는 항목만 보기
                        </label>
                        <label className="flex items-center gap-3 text-sm text-foreground">
                          <input
                            className="h-4 w-4 accent-[var(--accent)]"
                            defaultChecked={hideEmpty}
                            name="hideEmpty"
                            type="checkbox"
                            value="1"
                          />
                          모두 미입력인 항목 숨기기
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-2 lg:justify-end">
                      <Button asChild className="rounded-full px-4" variant="outline">
                        <Link href={resetHref}>초기화</Link>
                      </Button>
                      <Button className="rounded-full px-5" type="submit">
                        보기 적용
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {recordsWithInsights.map(({ insight, record }) => {
                  const locationStatus = getLocationStatusMeta(insight);

                  return (
                    <Card className={surfaceClassName} key={`summary-${record.id}`}>
                      <CardHeader className="gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                              {getRoomRecordName(record)}
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-muted-foreground">
                              {record.address ?? `${record.district_name} · 주소 미입력`}
                            </CardDescription>
                          </div>
                          <Badge
                            className={`rounded-full border ${locationStatus.className}`}
                            variant="outline"
                          >
                            {locationStatus.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-[20px] border border-border/70 bg-white/45 p-4 text-sm leading-6 text-muted-foreground">
                          <p>월세 {formatCurrencyInManwon(record.monthly_rent)}</p>
                          <p>관리비 {formatCurrencyInManwon(record.maintenance_fee)}</p>
                          <p>{locationStatus.detail}</p>
                        </div>

                        {insight.amenityMessage && insight.nearbyAmenities.length === 0 ? (
                          <div className="rounded-[20px] border border-border/70 bg-white/45 p-4 text-sm leading-6 text-muted-foreground">
                            {insight.amenityMessage}
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {amenityRows.map((amenityRow) => {
                              const amenity = findAmenity(insight, amenityRow.kind);

                              return (
                                <div
                                  className="rounded-[20px] border border-border/70 bg-white/45 p-4"
                                  key={`${record.id}-${amenityRow.kind}`}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="font-medium">{amenityRow.label}</p>
                                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {amenity?.placeName ?? "정보 없음"}
                                      </p>
                                    </div>
                                    <Badge className="rounded-full" variant="secondary">
                                      {amenity
                                        ? formatWalkEstimate(amenity.walkMinutes)
                                        : "계산 불가"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <Button asChild className="rounded-full px-4" variant="outline">
                          <Link href={`/rooms/${record.id}`}>상세 보기</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_320px]">
                <Card className={surfaceClassName}>
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                          비교 매트릭스
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                          상태 값과 생활권 정보를 같은 표 안에서 함께 훑어볼 수 있습니다.
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

                    <div className="overflow-x-auto">
                      {hasVisibleMatrixRows ? (
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
                            {visibleCompareSections.map((section) => (
                              <Fragment key={section.label}>
                                <TableRow className="border-border/70 bg-white/30 hover:bg-white/30">
                                  <TableCell
                                    className="font-serif text-lg tracking-[-0.02em] text-foreground"
                                    colSpan={records.length + 1}
                                  >
                                    {section.label}
                                  </TableCell>
                                </TableRow>
                                {section.fields.map((field) => (
                                  <TableRow
                                    className="border-border/70 hover:bg-white/30"
                                    key={field.label}
                                  >
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
                              </Fragment>
                            ))}

                            {(showLocationStatusRow || visibleAmenityRows.length > 0) ? (
                              <TableRow className="border-border/70 bg-white/30 hover:bg-white/30">
                                <TableCell
                                  className="font-serif text-lg tracking-[-0.02em] text-foreground"
                                  colSpan={records.length + 1}
                                >
                                  생활권
                                </TableCell>
                              </TableRow>
                            ) : null}

                            {showLocationStatusRow ? (
                              <TableRow className="border-border/70 hover:bg-white/30">
                                <TableCell className="font-medium text-foreground">위치 기준</TableCell>
                                {recordsWithInsights.map(({ insight, record }) => {
                                  const locationStatus = getLocationStatusMeta(insight);

                                  return (
                                    <TableCell key={`location-status-${record.id}`}>
                                      <div className="space-y-2">
                                        <Badge
                                          className={`rounded-full border ${locationStatus.className}`}
                                          variant="outline"
                                        >
                                          {locationStatus.label}
                                        </Badge>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                          {locationStatus.detail}
                                        </p>
                                      </div>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ) : null}

                            {visibleAmenityRows.map((amenityRow) => (
                              <TableRow
                                className="border-border/70 hover:bg-white/30"
                                key={`amenity-${amenityRow.kind}`}
                              >
                                <TableCell className="font-medium text-foreground">
                                  {amenityRow.label}
                                </TableCell>
                                {recordsWithInsights.map(({ insight, record }) => (
                                  <TableCell key={`${amenityRow.kind}-${record.id}`}>
                                    {renderAmenityCell(insight, amenityRow.kind)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="rounded-[20px] border border-border/70 bg-white/45 p-5 text-sm leading-6 text-muted-foreground">
                          현재 필터 조건에서는 보여줄 비교 항목이 없습니다. 차이만 보기 또는
                          미입력 숨기기를 해제해 주세요.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <aside className="grid gap-4">
                  <Card className={surfaceClassName}>
                    <CardHeader className="gap-3">
                      <Badge className="rounded-full" variant="outline">
                        읽는 방식
                      </Badge>
                      <CardTitle className="font-serif text-2xl">
                        이 화면은 결론 대신 근거를 정리합니다
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                      <p>총점 계산이나 자동 추천은 의도적으로 넣지 않았습니다.</p>
                      <p>생활권 시간은 현재 직선거리 기준의 도보 추정값이고, 다음 단계에서 실제 보행 경로로 바꿀 수 있습니다.</p>
                      <p>좌표가 없는 기록은 주소 기반 근사 좌표 또는 위치 보완 필요 상태로 표시합니다.</p>
                    </CardContent>
                  </Card>

                  <Card className={surfaceClassName}>
                    <CardHeader className="gap-3">
                      <CardTitle className="font-serif text-2xl">기록 메모</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recordsWithInsights.map(({ record }) => (
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
                      <Badge
                        className={`rounded-full border ${statusClassName("good")}`}
                        variant="outline"
                      >
                        좋음
                      </Badge>
                      <Badge
                        className={`rounded-full border ${statusClassName("okay")}`}
                        variant="outline"
                      >
                        보통
                      </Badge>
                      <Badge
                        className={`rounded-full border ${statusClassName("bad")}`}
                        variant="outline"
                      >
                        나쁨
                      </Badge>
                      <Badge
                        className="rounded-full border border-border bg-background text-muted-foreground"
                        variant="outline"
                      >
                        미입력
                      </Badge>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
