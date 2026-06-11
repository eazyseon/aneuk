"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { hydrateRoomRecordLocation } from "@/lib/location-insights";
import {
  getRoomRecordFormStateFromErrorCode,
  getRoomRecordFormStateFromFieldErrors,
  type RoomRecordFormState,
  parseRoomRecordFormData,
} from "@/lib/room-records-form";
import { createClient } from "@/lib/supabase/server";

export async function createRoomRecord(
  _: RoomRecordFormState,
  formData: FormData,
): Promise<RoomRecordFormState> {
  const user = await requireUser("/rooms/new");
  const parsed = parseRoomRecordFormData(formData);

  if ("fieldErrors" in parsed) {
    return getRoomRecordFormStateFromFieldErrors(parsed.fieldErrors);
  }

  const enrichedInput = await hydrateRoomRecordLocation(parsed.data);

  const supabase = await createClient();
  const { error } = await supabase.from("room_records").insert({
    user_id: user.id,
    ...enrichedInput,
  });

  if (error) {
    return getRoomRecordFormStateFromErrorCode("save_failed");
  }

  revalidatePath("/rooms");
  revalidatePath("/compare");
  redirect("/rooms?created=1");
}
