"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  loadKakaoMapsSdk,
  type KakaoMap,
  type KakaoMarker,
  type KakaoSdk,
} from "@/lib/kakao-maps-sdk";

type RoomLocationPreviewMapProps = {
  address?: string | null;
  latitude: number;
  longitude: number;
  locationBasisLabel: string;
};

type KakaoSdkState =
  | { status: "loading" }
  | { status: "ready"; kakao: KakaoSdk }
  | { status: "error"; message: string };

function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

export function RoomLocationPreviewMap({
  address,
  latitude,
  longitude,
  locationBasisLabel,
}: RoomLocationPreviewMapProps) {
  const [sdkState, setSdkState] = useState<KakaoSdkState>({ status: "loading" });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);

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
    if (sdkState.status !== "ready" || !mapContainerRef.current) {
      return;
    }

    const { kakao } = sdkState;
    const center = new kakao.maps.LatLng(latitude, longitude);

    if (!mapRef.current) {
      const map = new kakao.maps.Map(mapContainerRef.current, {
        center,
        draggable: false,
        level: 3,
        scrollwheel: false,
      });
      const marker = new kakao.maps.Marker({
        position: center,
      });

      marker.setMap(map);
      mapRef.current = map;
      markerRef.current = marker;
      return;
    }

    mapRef.current.setLevel(3);
    mapRef.current.panTo(center);
    markerRef.current?.setPosition(center);
  }, [latitude, longitude, sdkState]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">저장된 위치 미리보기</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            수정 폼에서 확정한 좌표를 기준으로 집 위치를 다시 확인합니다.
          </p>
        </div>
        <Badge className="rounded-full" variant="secondary">
          {locationBasisLabel}
        </Badge>
      </div>

      <div
        className="relative h-64 overflow-hidden rounded-[22px] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(221,197,164,0.32),transparent_35%),linear-gradient(180deg,rgba(247,241,233,0.94),rgba(238,231,221,0.88))]"
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
        <p>{address ?? "주소가 없어 좌표 기준으로만 미리보기 중입니다."}</p>
        <p>좌표 {formatCoordinates(latitude, longitude)}</p>
      </div>
    </div>
  );
}
