import { createClient } from "@/lib/supabase/server";
import {
  ROOM_CONDITION_VALUES,
  type RoomCondition,
  type RoomRecord,
} from "@/lib/room-record-types";

export type { RoomCondition, RoomRecord } from "@/lib/room-record-types";

const conditionLabelMap: Record<RoomCondition, string> = {
  good: "좋음",
  okay: "보통",
  bad: "나쁨",
};

export function isRoomCondition(value: string): value is RoomCondition {
  return ROOM_CONDITION_VALUES.includes(value as RoomCondition);
}

export function formatCondition(value: RoomCondition | null) {
  if (!value) {
    return "미입력";
  }

  return conditionLabelMap[value];
}

export function formatCurrencyInManwon(value: number | null) {
  if (value === null) {
    return "미입력";
  }

  return `${value.toLocaleString("ko-KR")}만원`;
}

export function getRoomRecordName(record: Pick<RoomRecord, "nickname" | "district_name" | "visited_at">) {
  if (record.nickname) {
    return record.nickname;
  }

  return `${record.district_name} / ${record.visited_at}`;
}

export function getRoomRecordMeta(record: Pick<RoomRecord, "visited_at" | "district_name" | "monthly_rent">) {
  return [
    `방문일 ${record.visited_at}`,
    `동네 ${record.district_name}`,
    `월세 ${formatCurrencyInManwon(record.monthly_rent)}`,
  ].join(" · ");
}

export function parseRecordIds(value: string | string[] | undefined) {
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  const seen = new Set<string>();

  return ids
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item) => {
      if (seen.has(item)) {
        return false;
      }

      seen.add(item);
      return true;
    });
}

export function buildIdsSearchParams(ids: string[]) {
  const searchParams = new URLSearchParams();

  ids.forEach((id) => {
    searchParams.append("ids", id);
  });

  return searchParams.toString();
}

export function orderRecordsByIds(records: RoomRecord[], ids: string[]) {
  const order = new Map(ids.map((id, index) => [id, index]));

  return [...records].sort((first, second) => {
    return (order.get(first.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(second.id) ?? Number.MAX_SAFE_INTEGER);
  });
}

export async function listRoomRecords(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_records")
    .select("*")
    .eq("user_id", userId)
    .order("visited_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as RoomRecord[];
}

export async function listRoomRecordsByIds(userId: string, ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_records")
    .select("*")
    .eq("user_id", userId)
    .in("id", ids);

  if (error) {
    throw error;
  }

  return orderRecordsByIds((data ?? []) as RoomRecord[], ids);
}

export async function getRoomRecordById(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_records")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as RoomRecord | null;
}
