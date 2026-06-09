"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(async () => {
      setErrorMessage(null);

      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/rooms`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage("Google 로그인 연결에 실패했습니다. Provider 설정을 확인해 주세요.");
      }
    });
  };

  return (
    <div className="grid gap-3">
      <Button
        className="rounded-full px-4"
        disabled={isPending}
        onClick={handleSignIn}
        type="button"
      >
        {isPending ? "Google로 이동 중..." : "Google로 계속하기"}
      </Button>
      {errorMessage ? (
        <p className="text-sm leading-6 text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
