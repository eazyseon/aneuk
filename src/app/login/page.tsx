import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirectIfAuthenticated } from "@/lib/auth/guards";

export const metadata = {
  title: "로그인",
};

const surfaceClassName = "aneuk-surface";

const steps = [
  {
    title: "1. 세션 생성",
    description: "Google 인증을 마치고 보호 라우트로 이동",
  },
  {
    title: "2. 내 기록 조회",
    description: "목록 페이지에서 최근 방문순으로 표시",
  },
  {
    title: "3. 비교 시작",
    description: "기록을 고르고 `/compare`로 진입",
  },
];

type AuthBannerTone = "destructive" | "info" | "success";

type AuthBanner =
  | {
      message: string;
      tone: AuthBannerTone;
    }
  | null;

function resolveAuthBanner({
  error,
  errorDescription,
  reason,
  status,
}: {
  error?: string;
  errorDescription?: string;
  reason?: string;
  status?: string;
}): AuthBanner {
  if (status === "signed_out") {
    return {
      message: "로그아웃되었습니다. 다시 로그인하면 내 기록 화면으로 돌아갑니다.",
      tone: "success",
    };
  }

  if (reason === "auth_required") {
    return {
      message:
        "로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인하면 원래 가려던 화면으로 돌아갑니다.",
      tone: "info",
    };
  }

  if (error === "oauth_cancelled") {
    return {
      message: "Google 로그인 창이 취소되었습니다. 다시 시도해 주세요.",
      tone: "destructive",
    };
  }

  if (error === "oauth_session_exchange_failed") {
    return {
      message:
        "Google 인증은 끝났지만 세션 생성에 실패했습니다. Supabase 설정을 확인한 뒤 다시 시도해 주세요.",
      tone: "destructive",
    };
  }

  if (error === "oauth_callback_missing_code") {
    return {
      message:
        "OAuth 콜백에 필요한 인증 코드가 없습니다. 로그인 버튼으로 다시 시작해 주세요.",
      tone: "destructive",
    };
  }

  if (error === "oauth_callback_failed") {
    return {
      message:
        "OAuth 콜백 처리에 실패했습니다. Supabase Dashboard의 Google Provider 설정과 Redirect URL을 다시 확인해 주세요.",
      tone: "destructive",
    };
  }

  if (error && errorDescription) {
    return {
      message: `로그인 처리 중 오류가 발생했습니다. ${errorDescription}`,
      tone: "destructive",
    };
  }

  return null;
}

function getBannerClassName(tone: AuthBannerTone) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (tone === "info") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-destructive/25 bg-destructive/8 text-destructive";
}

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
    next?: string;
    reason?: string;
    status?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, error_description, next, reason, status } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/rooms";
  const authBanner = resolveAuthBanner({
    error,
    errorDescription: error_description,
    reason,
    status,
  });

  await redirectIfAuthenticated(nextPath);

  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <section className="aneuk-content grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-5">
              <Badge className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[#8c4e28]">
                Google OAuth
              </Badge>
              <div className="space-y-4">
                <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                  로그인 후 내 방 기록만 조용히 모아볼게요.
                </CardTitle>
                <CardDescription className="max-w-xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  Google 로그인 후 내 기록 목록으로 돌아오고, 보호 페이지에 직접
                  진입했을 때도 원래 가려던 화면으로 복귀하도록 연결했습니다.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[22px] border border-border/70 bg-white/45 p-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  Google 로그인 후 `{nextPath}`로 돌아오고, 보호 페이지에서 튕겨온 경우에도
                  원래 가려던 화면을 유지합니다.
                </p>
              </div>
              {authBanner ? (
                <div
                  className={`rounded-[20px] border p-4 text-sm leading-6 ${getBannerClassName(authBanner.tone)}`}
                >
                  {authBanner.message}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <GoogleSignInButton nextPath={nextPath} />
                <Button asChild className="rounded-full px-4" variant="outline">
                  <Link href="/">홈으로</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceClassName}>
            <CardHeader className="gap-3">
              <Badge className="rounded-full" variant="outline">
                로그인 후 흐름
              </Badge>
              <CardTitle className="font-serif text-3xl tracking-[-0.03em]">
                보호 영역에 들어간 뒤의 순서
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {steps.map((step) => (
                <Card
                  className="rounded-[22px] border-border/70 bg-white/50 shadow-none"
                  key={step.title}
                  size="sm"
                >
                  <CardHeader className="gap-2">
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
