"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { parseRoomRecordFormData } from "@/lib/room-records-form";
import { createClient } from "@/lib/supabase/server";

function getRecordId(formData: FormData) {
  const value = formData.get("recordId");
  return typeof value === "string" ? value.trim() : "";
}

export async function updateRoomRecord(formData: FormData) {
  const recordId = getRecordId(formData);

  if (!recordId) {
    redirect("/rooms?error=record_not_found");
  }

  const user = await requireUser(`/rooms/${recordId}`);
  const parsed = parseRoomRecordFormData(formData);

  if ("error" in parsed) {
    redirect(`/rooms/${recordId}?error=${parsed.error}`);
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("room_records")
    .update(parsed.data)
    .eq("id", recordId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/rooms/${recordId}?error=save_failed`);
  }

  if (!data) {
    redirect("/rooms?error=record_not_found");
  }

  revalidatePath("/rooms");
  revalidatePath("/compare");
  revalidatePath(`/rooms/${recordId}`);
  redirect(`/rooms/${recordId}?updated=1`);
}

export async function deleteRoomRecord(formData: FormData) {
  const recordId = getRecordId(formData);

  if (!recordId) {
    redirect("/rooms?error=record_not_found");
  }

  const user = await requireUser(`/rooms/${recordId}`);
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("room_records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/rooms/${recordId}?error=save_failed`);
  }

  if (!data) {
    redirect("/rooms?error=record_not_found");
  }

  revalidatePath("/rooms");
  revalidatePath("/compare");
  revalidatePath(`/rooms/${recordId}`);
  redirect("/rooms?deleted=1");
}
