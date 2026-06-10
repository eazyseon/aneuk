import { ROOM_CONDITION_VALUES, type RoomCondition } from "@/lib/room-records";

export const ROOM_CONDITION_OPTIONS: Array<{ label: string; value: RoomCondition }> = [
  { value: "good", label: "좋음" },
  { value: "okay", label: "보통" },
  { value: "bad", label: "나쁨" },
];

export type RoomRecordFormErrorCode =
  | "missing_required"
  | "invalid_date"
  | "invalid_number"
  | "invalid_location"
  | "invalid_condition"
  | "save_failed"
  | "record_not_found";

export const ROOM_RECORD_FORM_ERROR_MESSAGES: Record<RoomRecordFormErrorCode, string> = {
  missing_required: "방문일과 동네명은 꼭 입력해 주세요.",
  invalid_date: "방문일 형식이 올바르지 않습니다.",
  invalid_number: "월세와 관리비는 0 이상의 정수로 입력해 주세요.",
  invalid_location: "저장된 위치 좌표 형식이 올바르지 않습니다.",
  invalid_condition: "상태 입력값이 올바르지 않습니다.",
  save_failed: "기록 저장에 실패했습니다. Supabase 테이블과 정책 설정을 확인해 주세요.",
  record_not_found: "요청한 기록을 찾을 수 없거나 수정 권한이 없습니다.",
};

export function getRoomRecordFormErrorMessage(code?: string) {
  if (!code) {
    return ROOM_RECORD_FORM_ERROR_MESSAGES.save_failed;
  }

  if (code in ROOM_RECORD_FORM_ERROR_MESSAGES) {
    return ROOM_RECORD_FORM_ERROR_MESSAGES[
      code as keyof typeof ROOM_RECORD_FORM_ERROR_MESSAGES
    ];
  }

  return ROOM_RECORD_FORM_ERROR_MESSAGES.save_failed;
}

export type RoomRecordMutationInput = {
  visited_at: string;
  district_name: string;
  nickname: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  monthly_rent: number | null;
  maintenance_fee: number | null;
  water_pressure: RoomCondition | null;
  sunlight: RoomCondition | null;
  noise: RoomCondition | null;
  sanitation: RoomCondition | null;
  note: string | null;
};

function getTrimmedString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getOptionalInteger(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return { value: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return { error: "invalid_number" as const };
  }

  return { value: parsed };
}

function getOptionalFloat(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return { value: null };
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return { error: "invalid_location" as const };
  }

  return { value: parsed };
}

function getOptionalCondition(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return { value: null };
  }

  if (!ROOM_CONDITION_VALUES.includes(value as RoomCondition)) {
    return { error: "invalid_condition" as const };
  }

  return { value: value as RoomCondition };
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function parseRoomRecordFormData(
  formData: FormData,
): { data: RoomRecordMutationInput } | { error: RoomRecordFormErrorCode } {
  const visitedAt = getTrimmedString(formData, "visitedAt");
  const districtName = getTrimmedString(formData, "districtName");

  if (!visitedAt || !districtName) {
    return { error: "missing_required" };
  }

  if (!isIsoDate(visitedAt)) {
    return { error: "invalid_date" };
  }

  const monthlyRent = getOptionalInteger(formData, "monthlyRent");
  if (monthlyRent.error) {
    return { error: monthlyRent.error };
  }

  const maintenanceFee = getOptionalInteger(formData, "maintenanceFee");
  if (maintenanceFee.error) {
    return { error: maintenanceFee.error };
  }

  const latitude = getOptionalFloat(formData, "latitude");
  if (latitude.error) {
    return { error: latitude.error };
  }

  const longitude = getOptionalFloat(formData, "longitude");
  if (longitude.error) {
    return { error: longitude.error };
  }

  if (
    latitude.value !== null &&
    (latitude.value < -90 || latitude.value > 90)
  ) {
    return { error: "invalid_location" };
  }

  if (
    longitude.value !== null &&
    (longitude.value < -180 || longitude.value > 180)
  ) {
    return { error: "invalid_location" };
  }

  const waterPressure = getOptionalCondition(formData, "waterPressure");
  if (waterPressure.error) {
    return { error: waterPressure.error };
  }

  const sunlight = getOptionalCondition(formData, "sunlight");
  if (sunlight.error) {
    return { error: sunlight.error };
  }

  const noise = getOptionalCondition(formData, "noise");
  if (noise.error) {
    return { error: noise.error };
  }

  const sanitation = getOptionalCondition(formData, "sanitation");
  if (sanitation.error) {
    return { error: sanitation.error };
  }

  return {
    data: {
      visited_at: visitedAt,
      district_name: districtName,
      nickname: getOptionalString(formData, "nickname"),
      address: getOptionalString(formData, "address"),
      latitude: latitude.value,
      longitude: longitude.value,
      monthly_rent: monthlyRent.value,
      maintenance_fee: maintenanceFee.value,
      water_pressure: waterPressure.value,
      sunlight: sunlight.value,
      noise: noise.value,
      sanitation: sanitation.value,
      note: getOptionalString(formData, "note"),
    },
  };
}
