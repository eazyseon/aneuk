"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_KAKAO_MAP_CENTER,
  loadKakaoMapsSdk,
  type KakaoAddressSearchResult,
  type KakaoCoordAddressResult,
  type KakaoGeocoder,
  type KakaoLatLng,
  type KakaoMap,
  type KakaoMarker,
  type KakaoSdk,
} from "@/lib/kakao-maps-sdk";
import { cn } from "@/lib/utils";

type RoomLocationPickerFieldProps = {
  defaultAddress?: string | null;
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  errorMessage?: string;
};

type KakaoSdkState =
  | { status: "loading" }
  | { status: "ready"; kakao: KakaoSdk }
  | { status: "error"; message: string };

function formatCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) {
    return "위치를 아직 확정하지 않았습니다.";
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

export function RoomLocationPickerField({
  defaultAddress,
  defaultLatitude,
  defaultLongitude,
  errorMessage,
}: RoomLocationPickerFieldProps) {
  const [address, setAddress] = useState(defaultAddress ?? "");
  const [latitude, setLatitude] = useState<number | null>(defaultLatitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(defaultLongitude ?? null);
  const [statusMessage, setStatusMessage] = useState(
    defaultLatitude !== null && defaultLongitude !== null
      ? "저장된 위치가 지도에 반영되어 있습니다."
      : "주소 검색 또는 지도 클릭으로 위치를 확정해 주세요.",
  );
  const [sdkState, setSdkState] = useState<KakaoSdkState>({ status: "loading" });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const geocoderRef = useRef<KakaoGeocoder | null>(null);

  useEffect(() => {
    let active = true;

    loadKakaoMapsSdk()
      .then((kakao) => {
        if (!active) {
          return;
        }

        setSdkState({ status: "ready", kakao });
      })
      .catch((error: Error) => {
        if (!active) {
          return;
        }

        setSdkState({ status: "error", message: error.message });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (sdkState.status !== "ready" || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const { kakao } = sdkState;
    const center = new kakao.maps.LatLng(
      defaultLatitude ?? DEFAULT_KAKAO_MAP_CENTER.latitude,
      defaultLongitude ?? DEFAULT_KAKAO_MAP_CENTER.longitude,
    );
    const map = new kakao.maps.Map(mapContainerRef.current, {
      center,
      draggable: true,
      level: defaultLatitude !== null && defaultLongitude !== null ? 3 : 4,
      scrollwheel: true,
    });
    const marker = new kakao.maps.Marker({
      draggable: true,
      position: center,
    });
    const geocoder = new kakao.maps.services.Geocoder();

    if (defaultLatitude !== null && defaultLongitude !== null) {
      marker.setMap(map);
    }

    mapRef.current = map;
    markerRef.current = marker;
    geocoderRef.current = geocoder;

    const updateFromLatLng = (
      latLng: KakaoLatLng,
      reason: "click" | "drag" | "search",
    ) => {
      const nextLatitude = Number(latLng.getLat());
      const nextLongitude = Number(latLng.getLng());

      marker.setMap(map);
      marker.setPosition(latLng);
      map.panTo(latLng);
      setLatitude(nextLatitude);
      setLongitude(nextLongitude);
      setStatusMessage(
        reason === "search"
          ? "검색 결과로 위치를 맞췄습니다. 필요하면 핀을 더 세밀하게 옮겨 주세요."
          : "지도에서 선택한 위치를 반영했습니다.",
      );

      geocoder.coord2Address(
        nextLongitude,
        nextLatitude,
        (result: KakaoCoordAddressResult[], status: string) => {
          if (status !== kakao.maps.services.Status.OK || !result[0]) {
            return;
          }

          const resolvedAddress =
            result[0].road_address?.address_name ?? result[0].address.address_name;
          setAddress(resolvedAddress);
        },
      );
    };

    kakao.maps.event.addListener(map, "click", (...args: unknown[]) => {
      const mouseEvent = args[0] as { latLng?: KakaoLatLng } | undefined;

      if (!mouseEvent?.latLng) {
        return;
      }

      updateFromLatLng(mouseEvent.latLng, "click");
    });

    kakao.maps.event.addListener(marker, "dragend", () => {
      updateFromLatLng(marker.getPosition(), "drag");
    });
  }, [defaultLatitude, defaultLongitude, sdkState]);

  const handleSearch = () => {
    if (sdkState.status !== "ready") {
      return;
    }

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setStatusMessage("검색할 주소를 먼저 입력해 주세요.");
      return;
    }

    const map = mapRef.current;
    const marker = markerRef.current;
    const geocoder = geocoderRef.current;

    if (!map || !marker || !geocoder) {
      setStatusMessage("지도를 아직 준비하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    geocoder.addressSearch(
      trimmedAddress,
      (result: KakaoAddressSearchResult[], status: string) => {
        if (status !== sdkState.kakao.maps.services.Status.OK || !result[0]) {
          setStatusMessage(
            "입력한 주소를 찾지 못했습니다. 도로명이나 번지까지 더 자세히 입력해 주세요.",
          );
          return;
        }

        const first = result[0];
        const latLng = new sdkState.kakao.maps.LatLng(Number(first.y), Number(first.x));

        marker.setMap(map);
        marker.setPosition(latLng);
        map.setLevel(3);
        map.panTo(latLng);

        setLatitude(Number(first.y));
        setLongitude(Number(first.x));
        setAddress(first.road_address?.address_name ?? first.address.address_name);
        setStatusMessage(
          "검색 결과를 찾았습니다. 필요하면 핀을 드래그하거나 지도를 눌러 미세 조정해 주세요.",
        );
      },
    );
  };

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="address">
        주소
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            aria-invalid={Boolean(errorMessage)}
            className={cn(
              "h-12 rounded-[18px] bg-white/55 px-4 text-foreground",
              errorMessage &&
                "border-destructive/60 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/20",
            )}
            id="address"
            name="address"
            onChange={(event) => {
              setAddress(event.target.value);
              setLatitude(null);
              setLongitude(null);
              markerRef.current?.setMap(null);
              setStatusMessage("주소를 수정했습니다. 검색 버튼이나 지도에서 위치를 다시 확정해 주세요.");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder="관악구 신림동 123-45 또는 도로명 주소"
            value={address}
          />
          <Button
            className="h-12 rounded-[18px] px-4"
            onClick={handleSearch}
            type="button"
            variant="secondary"
          >
            주소로 찾기
          </Button>
        </div>
        {errorMessage ? (
          <p className="text-sm leading-6 text-destructive">{errorMessage}</p>
        ) : null}
      </label>

      <div className="grid gap-3 rounded-[24px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(251,247,241,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">집 위치 선택</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              주소 검색 후 핀을 드래그하거나 지도를 눌러 위치를 더 정확하게 맞춥니다.
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-white/70 px-3 py-1 text-xs text-muted-foreground">
            {latitude !== null && longitude !== null ? "위치 확정됨" : "위치 미확정"}
          </div>
        </div>

        <div
          className="relative h-72 overflow-hidden rounded-[22px] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(221,197,164,0.32),transparent_35%),linear-gradient(180deg,rgba(247,241,233,0.94),rgba(238,231,221,0.88))]"
          ref={mapContainerRef}
        >
          {sdkState.status !== "ready" ? (
            <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-sm">
              <div className="max-w-xs text-center text-sm leading-6 text-muted-foreground">
                {sdkState.status === "error"
                  ? "카카오 지도를 불러오지 못했습니다. 사이트 도메인 등록과 JavaScript 키를 확인해 주세요."
                  : "카카오 지도를 불러오는 중입니다."}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 rounded-[20px] border border-border/70 bg-white/60 p-4 text-sm leading-6 text-muted-foreground">
          <p>{statusMessage}</p>
          <p>현재 좌표: {formatCoordinates(latitude, longitude)}</p>
        </div>
      </div>

      <input name="latitude" type="hidden" value={latitude ?? ""} />
      <input name="longitude" type="hidden" value={longitude ?? ""} />
    </div>
  );
}
