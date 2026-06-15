declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsNamespace;
    };
  }
}

export type KakaoSdk = NonNullable<Window["kakao"]>;

export type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

export type KakaoMap = {
  panTo(latLng: KakaoLatLng): void;
  setLevel(level: number): void;
};

export type KakaoMarker = {
  getPosition(): KakaoLatLng;
  setMap(map: KakaoMap | null): void;
  setPosition(latLng: KakaoLatLng): void;
};

export type KakaoCoordAddressResult = {
  address: {
    address_name: string;
  };
  road_address?: {
    address_name: string;
  } | null;
};

export type KakaoAddressSearchResult = {
  address: {
    address_name: string;
  };
  road_address?: {
    address_name: string;
  } | null;
  x: string;
  y: string;
};

export type KakaoGeocoder = {
  addressSearch(
    query: string,
    callback: (result: KakaoAddressSearchResult[], status: string) => void,
  ): void;
  coord2Address(
    longitude: number,
    latitude: number,
    callback: (result: KakaoCoordAddressResult[], status: string) => void,
  ): void;
};

export type KakaoMapsNamespace = {
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => KakaoMap;
  Marker: new (options: Record<string, unknown>) => KakaoMarker;
  event: {
    addListener(
      target: unknown,
      eventName: string,
      handler: (...args: unknown[]) => void,
    ): void;
  };
  load(callback: () => void): void;
  services: {
    Geocoder: new () => KakaoGeocoder;
    Status: {
      OK: string;
    };
  };
};

export const DEFAULT_KAKAO_MAP_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
};

let kakaoSdkPromise: Promise<KakaoSdk> | null = null;

export function loadKakaoMapsSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser environment is required."));
  }

  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }

  if (kakaoSdkPromise) {
    return kakaoSdkPromise;
  }

  const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  if (!javascriptKey) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY is not configured."),
    );
  }

  kakaoSdkPromise = new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      kakaoSdkPromise = null;
      reject(
        new Error(
          "Kakao Maps SDK load timed out. Check the JavaScript key and registered site domain.",
        ),
      );
    }, 10000);

    const finishReject = (message: string) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      kakaoSdkPromise = null;
      reject(new Error(message));
    };

    const finishResolve = (kakao: KakaoSdk) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      resolve(kakao);
    };

    const handleLoad = () => {
      const kakao = window.kakao;

      if (!kakao?.maps?.load) {
        finishReject("Kakao Maps SDK did not load correctly.");
        return;
      }

      kakao.maps.load(() => {
        finishResolve(kakao);
      });
    };

    const createScript = () => {
      const script = document.createElement("script");
      script.async = true;
      script.dataset.kakaoMapsSdk = "true";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${javascriptKey}&autoload=false&libraries=services`;
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener(
        "error",
        () => finishReject("Failed to load Kakao Maps SDK."),
        { once: true },
      );
      document.head.append(script);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-maps-sdk="true"]',
    );

    if (window.kakao?.maps) {
      handleLoad();
      return;
    }

    if (existingScript) {
      existingScript.remove();
    }

    createScript();
  });

  return kakaoSdkPromise;
}
