import "server-only";

import { type RoomRecordMutationInput } from "@/lib/room-records-form";
import { type RoomRecord } from "@/lib/room-record-types";

type KakaoAddressDocument = {
  address_name: string;
  road_address: {
    address_name: string;
  } | null;
  x: string;
  y: string;
};

type KakaoPlaceDocument = {
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  place_url: string;
  distance: string;
  x: string;
  y: string;
};

type KakaoSearchResponse<TDocument> = {
  documents: TDocument[];
};

export type NearbyAmenityKind = "subway" | "supermarket" | "park" | "gym";

export type NearbyAmenityInsight = {
  kind: NearbyAmenityKind;
  label: string;
  distanceMeters: number;
  placeName: string;
  categoryName: string;
  placeUrl: string;
  primaryAddress: string;
  walkMinutes: number;
};

export type ResolvedRecordLocation =
  | {
      latitude: number;
      longitude: number;
      source: "stored_coordinates" | "address_geocode";
    }
  | {
      reason:
        | "missing_location"
        | "address_needs_detail"
        | "api_unavailable"
        | "address_lookup_failed";
    };

export type RoomLocationInsightSnapshot = {
  amenityBasisNote: string | null;
  amenityMessage: string | null;
  nearbyAmenities: NearbyAmenityInsight[];
  resolvedLocation: ResolvedRecordLocation;
};

const KAKAO_LOCAL_API_BASE_URL = "https://dapi.kakao.com/v2/local";
const WALKING_METERS_PER_MINUTE = 67;

const nearbyAmenitySpecs = [
  {
    kind: "subway",
    label: "지하철역",
    radius: 3000,
    type: "category",
    categoryGroupCode: "SW8",
  },
  {
    kind: "supermarket",
    label: "마트",
    radius: 3000,
    type: "category",
    categoryGroupCode: "MT1",
  },
  {
    kind: "park",
    label: "공원",
    query: "공원",
    radius: 3000,
    type: "keyword",
  },
  {
    kind: "gym",
    label: "헬스장",
    query: "헬스장",
    radius: 3000,
    type: "keyword",
  },
] as const;

function getKakaoRestApiKey() {
  return process.env.KAKAO_REST_API_KEY?.trim() ?? "";
}

function hasUsableLocationApi() {
  return getKakaoRestApiKey().length > 0;
}

function looksPreciseEnoughAddress(address: string) {
  return /\d/.test(address);
}

function toWalkMinutes(distanceMeters: number) {
  return Math.max(1, Math.ceil(distanceMeters / WALKING_METERS_PER_MINUTE));
}

async function fetchKakaoLocal<TDocument>(
  path: string,
  searchParams: URLSearchParams,
) {
  const restApiKey = getKakaoRestApiKey();

  if (!restApiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${KAKAO_LOCAL_API_BASE_URL}${path}?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `KakaoAK ${restApiKey}`,
        },
        next: {
          revalidate: 60 * 60,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as KakaoSearchResponse<TDocument>;
  } catch {
    return null;
  }
}

async function geocodeAddress(address: string) {
  if (!looksPreciseEnoughAddress(address)) {
    return null;
  }

  const searchParams = new URLSearchParams({
    analyze_type: "similar",
    query: address,
    size: "1",
  });
  const response = await fetchKakaoLocal<KakaoAddressDocument>(
    "/search/address.json",
    searchParams,
  );
  const document = response?.documents[0];

  if (!document) {
    return null;
  }

  return {
    latitude: Number(document.y),
    longitude: Number(document.x),
    matchedAddress:
      document.road_address?.address_name ?? document.address_name,
  };
}

async function searchNearestCategoryPlace(
  categoryGroupCode: string,
  latitude: number,
  longitude: number,
  radius: number,
) {
  const searchParams = new URLSearchParams({
    category_group_code: categoryGroupCode,
    radius: String(radius),
    size: "1",
    sort: "distance",
    x: String(longitude),
    y: String(latitude),
  });
  const response = await fetchKakaoLocal<KakaoPlaceDocument>(
    "/search/category.json",
    searchParams,
  );

  return response?.documents[0] ?? null;
}

async function searchNearestKeywordPlace(
  query: string,
  latitude: number,
  longitude: number,
  radius: number,
) {
  const searchParams = new URLSearchParams({
    query,
    radius: String(radius),
    size: "1",
    sort: "distance",
    x: String(longitude),
    y: String(latitude),
  });
  const response = await fetchKakaoLocal<KakaoPlaceDocument>(
    "/search/keyword.json",
    searchParams,
  );

  return response?.documents[0] ?? null;
}

export async function hydrateRoomRecordLocation(
  input: RoomRecordMutationInput,
) {
  if (
    input.latitude !== null &&
    input.longitude !== null
  ) {
    return input;
  }

  if (!input.address || !hasUsableLocationApi()) {
    return input;
  }

  const geocodedAddress = await geocodeAddress(input.address);

  if (!geocodedAddress) {
    return input;
  }

  return {
    ...input,
    latitude: geocodedAddress.latitude,
    longitude: geocodedAddress.longitude,
  };
}

export async function resolveRecordLocation(record: RoomRecord): Promise<ResolvedRecordLocation> {
  if (record.latitude !== null && record.longitude !== null) {
    return {
      latitude: record.latitude,
      longitude: record.longitude,
      source: "stored_coordinates",
    };
  }

  if (!record.address) {
    return { reason: "missing_location" };
  }

  if (!looksPreciseEnoughAddress(record.address)) {
    return { reason: "address_needs_detail" };
  }

  if (!hasUsableLocationApi()) {
    return { reason: "api_unavailable" };
  }

  const geocodedAddress = await geocodeAddress(record.address);

  if (!geocodedAddress) {
    return { reason: "address_lookup_failed" };
  }

  return {
    latitude: geocodedAddress.latitude,
    longitude: geocodedAddress.longitude,
    source: "address_geocode",
  };
}

function getAmenityMessage(
  resolvedLocation: ResolvedRecordLocation,
  nearbyAmenities: NearbyAmenityInsight[],
) {
  if ("reason" in resolvedLocation) {
    if (resolvedLocation.reason === "missing_location") {
      return "주소나 좌표가 아직 없어 근처 생활권을 계산할 수 없습니다.";
    }

    if (resolvedLocation.reason === "address_needs_detail") {
      return "근처 생활권을 계산하려면 주소를 도로명이나 번지까지 더 자세히 입력해 주세요.";
    }

    if (resolvedLocation.reason === "api_unavailable") {
      return "KAKAO_REST_API_KEY를 설정하면 근처 지하철역, 마트, 공원, 헬스장 요약을 볼 수 있습니다.";
    }

    return "입력한 주소로 위치를 찾지 못했습니다. 주소를 더 정확히 적어 주세요.";
  }

  if (nearbyAmenities.length === 0) {
    return "근처 생활권 정보를 찾지 못했습니다. 잠시 후 다시 시도하거나 주소를 더 정확히 입력해 주세요.";
  }

  return null;
}

function getAmenityBasisNote(resolvedLocation: ResolvedRecordLocation) {
  if ("reason" in resolvedLocation) {
    return null;
  }

  return resolvedLocation.source === "stored_coordinates"
    ? "저장된 좌표 기준"
    : "저장된 주소를 다시 좌표로 변환한 근사 기준";
}

export async function getNearbyAmenityInsights(
  latitude: number,
  longitude: number,
): Promise<NearbyAmenityInsight[]> {
  if (!hasUsableLocationApi()) {
    return [];
  }

  const places = await Promise.all(
    nearbyAmenitySpecs.map(async (spec) => {
      const place =
        spec.type === "category"
          ? await searchNearestCategoryPlace(
              spec.categoryGroupCode,
              latitude,
              longitude,
              spec.radius,
            )
          : await searchNearestKeywordPlace(
              spec.query,
              latitude,
              longitude,
              spec.radius,
            );

      if (!place?.distance) {
        return null;
      }

      const distanceMeters = Number(place.distance);

      if (!Number.isFinite(distanceMeters)) {
        return null;
      }

      return {
        kind: spec.kind,
        label: spec.label,
        distanceMeters,
        placeName: place.place_name,
        categoryName: place.category_name,
        placeUrl: place.place_url,
        primaryAddress: place.road_address_name || place.address_name,
        walkMinutes: toWalkMinutes(distanceMeters),
      } satisfies NearbyAmenityInsight;
    }),
  );

  return places.filter((place) => place !== null);
}

export async function getRoomLocationInsightSnapshot(
  record: RoomRecord,
): Promise<RoomLocationInsightSnapshot> {
  const resolvedLocation = await resolveRecordLocation(record);
  const nearbyAmenities =
    "reason" in resolvedLocation
      ? []
      : await getNearbyAmenityInsights(
          resolvedLocation.latitude,
          resolvedLocation.longitude,
        );

  return {
    amenityBasisNote: getAmenityBasisNote(resolvedLocation),
    amenityMessage: getAmenityMessage(resolvedLocation, nearbyAmenities),
    nearbyAmenities,
    resolvedLocation,
  };
}
