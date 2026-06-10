"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { parseRoomRecordFormData } from "@/lib/room-records-form";
import { createClient } from "@/lib/supabase/server";

export async function createRoomRecord(formData: FormData) {
  const user = await requireUser("/rooms/new");
  const parsed = parseRoomRecordFormData(formData);

  if ("error" in parsed) {
    redirect(`/rooms/new?error=${parsed.error}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("room_records").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) {
    redirect("/rooms/new?error=save_failed");
  }

  revalidatePath("/rooms");
  revalidatePath("/compare");
  redirect("/rooms?created=1");
}
