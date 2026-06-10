"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SaveRoomRecordButtonProps = Omit<ComponentProps<typeof Button>, "children" | "type"> & {
  idleLabel?: string;
  pendingLabel?: string;
};

export function SaveRoomRecordButton({
  className,
  disabled,
  idleLabel = "기록 저장하기",
  pendingLabel = "저장 중...",
  ...props
}: SaveRoomRecordButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={cn("rounded-full px-4", className)}
      disabled={pending || disabled}
      type="submit"
      {...props}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
