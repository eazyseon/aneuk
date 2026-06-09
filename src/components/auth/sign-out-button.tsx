"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      setErrorMessage(null);

      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMessage("로그아웃에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-2">
      <Button
        className="rounded-full px-4"
        disabled={isPending}
        onClick={handleSignOut}
        type="button"
        variant="outline"
      >
        {isPending ? "로그아웃 중..." : "로그아웃"}
      </Button>
      {errorMessage ? (
        <p className="text-sm leading-6 text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
