import {
  ROOM_CONDITION_VALUES,
  type RoomCondition,
} from "@/lib/room-record-types";

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

export type RoomRecordFormFieldName =
  | "visitedAt"
  | "districtName"
  | "address"
  | "monthlyRent"
  | "maintenanceFee"
  | "waterPressure"
  | "sunlight"
  | "noise"
  | "sanitation";

export type RoomRecordFormFieldErrors = Partial<
  Record<RoomRecordFormFieldName, string>
>;

export type RoomRecordFormState = {
  fieldErrors: RoomRecordFormFieldErrors;
  formError: string | null;
};

export const EMPTY_ROOM_RECORD_FORM_STATE: RoomRecordFormState = {
  fieldErrors: {},
  formError: null,
};

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

export type RoomRecordFormAction = (
  state: RoomRecordFormState,
  formData: FormData,
) => Promise<RoomRecordFormState>;

type OptionalIntegerResult =
  | { error: "invalid_number"; value: null }
  | { error: null; value: number | null };

type OptionalFloatResult =
  | { error: "invalid_location"; value: null }
  | { error: null; value: number | null };

type OptionalConditionResult =
  | { error: "invalid_condition"; value: null }
  | { error: null; value: RoomCondition | null };

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

function getOptionalInteger(
  formData: FormData,
  key: string,
): OptionalIntegerResult {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return { error: null, value: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return { error: "invalid_number", value: null };
  }

  return { error: null, value: parsed };
}

function getOptionalFloat(formData: FormData, key: string): OptionalFloatResult {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return { error: null, value: null };
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return { error: "invalid_location", value: null };
  }

  return { error: null, value: parsed };
}

function getOptionalCondition(
  formData: FormData,
  key: string,
): OptionalConditionResult {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return { error: null, value: null };
  }

  if (!ROOM_CONDITION_VALUES.includes(value as RoomCondition)) {
    return { error: "invalid_condition", value: null };
  }

  return { error: null, value: value as RoomCondition };
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function parseRoomRecordFormData(
  formData: FormData,
):
  | { data: RoomRecordMutationInput }
  | { fieldErrors: RoomRecordFormFieldErrors } {
  const visitedAt = getTrimmedString(formData, "visitedAt");
  const districtName = getTrimmedString(formData, "districtName");
  const fieldErrors: RoomRecordFormFieldErrors = {};

  if (!visitedAt) {
    fieldErrors.visitedAt = "방문일을 입력해 주세요.";
  }

  if (visitedAt && !isIsoDate(visitedAt)) {
    fieldErrors.visitedAt = "올바른 날짜를 입력해 주세요.";
  }

  if (!districtName) {
    fieldErrors.districtName = "동네명을 입력해 주세요.";
  }

  const monthlyRent = getOptionalInteger(formData, "monthlyRent");
  if (monthlyRent.error) {
    fieldErrors.monthlyRent = "월세는 0 이상의 정수로 입력해 주세요.";
  }

  const maintenanceFee = getOptionalInteger(formData, "maintenanceFee");
  if (maintenanceFee.error) {
    fieldErrors.maintenanceFee = "관리비는 0 이상의 정수로 입력해 주세요.";
  }

  const latitude = getOptionalFloat(formData, "latitude");
  if (latitude.error) {
    fieldErrors.address = "위치 정보가 올바르지 않습니다.";
  }

  const longitude = getOptionalFloat(formData, "longitude");
  if (longitude.error) {
    fieldErrors.address = "위치 정보가 올바르지 않습니다.";
  }

  if (
    latitude.value !== null &&
    (latitude.value < -90 || latitude.value > 90)
  ) {
    fieldErrors.address = "위치 정보가 올바르지 않습니다.";
  }

  if (
    longitude.value !== null &&
    (longitude.value < -180 || longitude.value > 180)
  ) {
    fieldErrors.address = "위치 정보가 올바르지 않습니다.";
  }

  const waterPressure = getOptionalCondition(formData, "waterPressure");
  if (waterPressure.error) {
    fieldErrors.waterPressure = "수압 값이 올바르지 않습니다.";
  }

  const sunlight = getOptionalCondition(formData, "sunlight");
  if (sunlight.error) {
    fieldErrors.sunlight = "채광 값이 올바르지 않습니다.";
  }

  const noise = getOptionalCondition(formData, "noise");
  if (noise.error) {
    fieldErrors.noise = "소음 값이 올바르지 않습니다.";
  }

  const sanitation = getOptionalCondition(formData, "sanitation");
  if (sanitation.error) {
    fieldErrors.sanitation = "벌레·위생 값이 올바르지 않습니다.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
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

export function getRoomRecordFormStateFromFieldErrors(
  fieldErrors: RoomRecordFormFieldErrors,
): RoomRecordFormState {
  return {
    fieldErrors,
    formError: "입력 내용을 다시 확인해 주세요.",
  };
}

export function getRoomRecordFormStateFromErrorCode(
  code: RoomRecordFormErrorCode,
): RoomRecordFormState {
  return {
    fieldErrors: {},
    formError: getRoomRecordFormErrorMessage(code),
  };
}
