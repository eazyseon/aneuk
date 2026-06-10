export const ROOM_CONDITION_VALUES = ["good", "okay", "bad"] as const;

export type RoomCondition = (typeof ROOM_CONDITION_VALUES)[number];

export type RoomRecord = {
  id: string;
  user_id: string;
  visited_at: string;
  district_name: string;
  nickname: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  monthly_rent: number | null;
  maintenance_fee: number | null;
  water_pressure: RoomCondition | null;
  sunlight: RoomCondition | null;
  noise: RoomCondition | null;
  sanitation: RoomCondition | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};
