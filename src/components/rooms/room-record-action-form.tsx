"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import Link from "next/link";

import { RoomRecordFormFields } from "@/components/rooms/room-record-form-fields";
import { SaveRoomRecordButton } from "@/components/rooms/save-room-record-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EMPTY_ROOM_RECORD_FORM_STATE,
  type RoomRecordFormAction,
} from "@/lib/room-records-form";
import { type RoomRecord } from "@/lib/room-record-types";

type RoomRecordActionFormProps = {
  action: RoomRecordFormAction;
  cancelHref: string;
  footerBadge: ReactNode;
  helperText: ReactNode;
  record?: RoomRecord | null;
  recordId?: string;
  submitIdleLabel: string;
  submitPendingLabel: string;
};

export function RoomRecordActionForm({
  action,
  cancelHref,
  footerBadge,
  helperText,
  record,
  recordId,
  submitIdleLabel,
  submitPendingLabel,
}: RoomRecordActionFormProps) {
  const [state, formAction] = useActionState(
    action,
    EMPTY_ROOM_RECORD_FORM_STATE,
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state.formError ? (
        <div className="rounded-[20px] border border-destructive/25 bg-destructive/8 p-4 text-sm leading-6 text-destructive">
          {state.formError}
        </div>
      ) : null}

      {recordId ? <input name="recordId" type="hidden" value={recordId} /> : null}

      <RoomRecordFormFields fieldErrors={state.fieldErrors} record={record} />

      <div className="rounded-[20px] border border-border/70 bg-white/45 p-4 text-sm leading-6 text-muted-foreground">
        {helperText}
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <Badge className="rounded-full" variant="outline">
          {footerBadge}
        </Badge>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full px-4" variant="outline">
            <Link href={cancelHref}>목록으로</Link>
          </Button>
          <SaveRoomRecordButton
            idleLabel={submitIdleLabel}
            pendingLabel={submitPendingLabel}
          />
        </div>
      </div>
    </form>
  );
}
