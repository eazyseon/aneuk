import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROOM_CONDITION_OPTIONS } from "@/lib/room-records-form";
import { type RoomRecord } from "@/lib/room-records";

type RoomRecordFormFieldsProps = {
  record?: RoomRecord | null;
};

const selectClassName =
  "h-12 w-full rounded-[18px] border border-input bg-white/55 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function RoomRecordFormFields({
  record,
}: RoomRecordFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="visitedAt">
          방문일
          <Input
            className="h-12 rounded-[18px] bg-white/55 px-4 text-foreground"
            defaultValue={record?.visited_at ?? ""}
            id="visitedAt"
            name="visitedAt"
            required
            type="date"
          />
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="districtName">
          동네명
          <Input
            className="h-12 rounded-[18px] bg-white/55 px-4 text-foreground"
            defaultValue={record?.district_name ?? ""}
            id="districtName"
            name="districtName"
            placeholder="신림동"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="nickname">
          별칭
          <Input
            className="h-12 rounded-[18px] bg-white/55 px-4 text-foreground"
            defaultValue={record?.nickname ?? ""}
            id="nickname"
            name="nickname"
            placeholder="신림역 7분 큰창 방"
          />
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="address">
          주소
          <Input
            className="h-12 rounded-[18px] bg-white/55 px-4 text-foreground"
            defaultValue={record?.address ?? ""}
            id="address"
            name="address"
            placeholder="관악구 신림동 ..."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="monthlyRent">
          월세
          <Input
            className="h-12 rounded-[18px] bg-white/55 px-4 text-foreground"
            defaultValue={record?.monthly_rent ?? ""}
            id="monthlyRent"
            inputMode="numeric"
            min={0}
            name="monthlyRent"
            placeholder="55"
            type="number"
          />
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="maintenanceFee">
          관리비
          <Input
            className="h-12 rounded-[18px] bg-white/55 px-4 text-foreground"
            defaultValue={record?.maintenance_fee ?? ""}
            id="maintenanceFee"
            inputMode="numeric"
            min={0}
            name="maintenanceFee"
            placeholder="7"
            type="number"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="waterPressure">
          수압
          <select
            className={selectClassName}
            defaultValue={record?.water_pressure ?? ""}
            id="waterPressure"
            name="waterPressure"
          >
            <option value="">선택 안 함</option>
            {ROOM_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="sunlight">
          채광
          <select
            className={selectClassName}
            defaultValue={record?.sunlight ?? ""}
            id="sunlight"
            name="sunlight"
          >
            <option value="">선택 안 함</option>
            {ROOM_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="noise">
          소음
          <select
            className={selectClassName}
            defaultValue={record?.noise ?? ""}
            id="noise"
            name="noise"
          >
            <option value="">선택 안 함</option>
            {ROOM_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="sanitation">
          벌레·위생
          <select
            className={selectClassName}
            defaultValue={record?.sanitation ?? ""}
            id="sanitation"
            name="sanitation"
          >
            <option value="">선택 안 함</option>
            {ROOM_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="note">
        전체 메모
        <Textarea
          className="min-h-36 rounded-[20px] bg-white/55 px-4 py-3 text-foreground"
          defaultValue={record?.note ?? ""}
          id="note"
          name="note"
          placeholder="수압은 좋았는데 복도 소음이 조금 있었다"
        />
      </label>

      <input name="latitude" type="hidden" value={record?.latitude ?? ""} />
      <input name="longitude" type="hidden" value={record?.longitude ?? ""} />
    </>
  );
}
