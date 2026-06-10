"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function DeleteRoomRecordButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="rounded-full px-4"
      disabled={pending}
      type="submit"
      variant="destructive"
    >
      {pending ? "삭제 중..." : "기록 삭제하기"}
    </Button>
  );
}
