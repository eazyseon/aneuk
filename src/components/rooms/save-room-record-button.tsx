"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SaveRoomRecordButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-full px-4" disabled={pending} type="submit">
      {pending ? "저장 중..." : "기록 저장하기"}
    </Button>
  );
}
