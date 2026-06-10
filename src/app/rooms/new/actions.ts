"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { isRoomCondition } from "@/lib/room-records";
import { createClient } from "@/lib/supabase/server";

function getTrimmedString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getOptionalInteger(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    redirect("/rooms/new?error=invalid_number");
  }

  return parsed;
}

function getOptionalFloat(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    redirect("/rooms/new?error=invalid_location");
  }

  return parsed;
}

function getOptionalCondition(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);

  if (!value) {
    return null;
  }

  if (!isRoomCondition(value)) {
    redirect("/rooms/new?error=invalid_condition");
  }

  return value;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export async function createRoomRecord(formData: FormData) {
  const user = await requireUser("/rooms/new");
  const visitedAt = getTrimmedString(formData, "visitedAt");
  const districtName = getTrimmedString(formData, "districtName");

  if (!visitedAt || !districtName) {
    redirect("/rooms/new?error=missing_required");
  }

  if (!isIsoDate(visitedAt)) {
    redirect("/rooms/new?error=invalid_date");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("room_records").insert({
    user_id: user.id,
    visited_at: visitedAt,
    district_name: districtName,
    nickname: getOptionalString(formData, "nickname"),
    address: getOptionalString(formData, "address"),
    latitude: getOptionalFloat(formData, "latitude"),
    longitude: getOptionalFloat(formData, "longitude"),
    monthly_rent: getOptionalInteger(formData, "monthlyRent"),
    maintenance_fee: getOptionalInteger(formData, "maintenanceFee"),
    water_pressure: getOptionalCondition(formData, "waterPressure"),
    sunlight: getOptionalCondition(formData, "sunlight"),
    noise: getOptionalCondition(formData, "noise"),
    sanitation: getOptionalCondition(formData, "sanitation"),
    note: getOptionalString(formData, "note"),
  });

  if (error) {
    redirect("/rooms/new?error=save_failed");
  }

  revalidatePath("/rooms");
  revalidatePath("/compare");
  redirect("/rooms?created=1");
}
