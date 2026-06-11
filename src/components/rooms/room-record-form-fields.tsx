import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoomLocationPickerField } from "@/components/rooms/room-location-picker-field";
import {
  ROOM_CONDITION_OPTIONS,
  type RoomRecordFormFieldErrors,
} from "@/lib/room-records-form";
import { type RoomRecord } from "@/lib/room-record-types";
import { cn } from "@/lib/utils";

type RoomRecordFormFieldsProps = {
  fieldErrors?: RoomRecordFormFieldErrors;
  record?: RoomRecord | null;
};

const selectClassName =
  "h-12 w-full rounded-[18px] border border-input bg-white/55 px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function RoomRecordFormFields({
  fieldErrors,
  record,
}: RoomRecordFormFieldsProps) {
  const getFieldClassName = (hasError?: boolean) =>
    cn(
      hasError &&
        "border-destructive/60 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/20",
    );

  const renderFieldError = (message?: string) =>
    message ? (
      <p className="text-sm leading-6 text-destructive">{message}</p>
    ) : null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="visitedAt">
          방문일
          <Input
            aria-invalid={Boolean(fieldErrors?.visitedAt)}
            className={cn(
              "h-12 rounded-[18px] bg-white/55 px-4 text-foreground",
              getFieldClassName(Boolean(fieldErrors?.visitedAt)),
            )}
            defaultValue={record?.visited_at ?? ""}
            id="visitedAt"
            name="visitedAt"
            required
            type="date"
          />
          {renderFieldError(fieldErrors?.visitedAt)}
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="districtName">
          동네명
          <Input
            aria-invalid={Boolean(fieldErrors?.districtName)}
            className={cn(
              "h-12 rounded-[18px] bg-white/55 px-4 text-foreground",
              getFieldClassName(Boolean(fieldErrors?.districtName)),
            )}
            defaultValue={record?.district_name ?? ""}
            id="districtName"
            name="districtName"
            placeholder="신림동"
            required
          />
          {renderFieldError(fieldErrors?.districtName)}
        </label>
      </div>

      <div className="grid gap-4">
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
      </div>

      <div className="grid gap-4">
        <RoomLocationPickerField
          defaultAddress={record?.address}
          defaultLatitude={record?.latitude}
          defaultLongitude={record?.longitude}
          errorMessage={fieldErrors?.address}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="monthlyRent">
          월세
          <Input
            aria-invalid={Boolean(fieldErrors?.monthlyRent)}
            className={cn(
              "h-12 rounded-[18px] bg-white/55 px-4 text-foreground",
              getFieldClassName(Boolean(fieldErrors?.monthlyRent)),
            )}
            defaultValue={record?.monthly_rent ?? ""}
            id="monthlyRent"
            inputMode="numeric"
            min={0}
            name="monthlyRent"
            placeholder="55"
            type="number"
          />
          {renderFieldError(fieldErrors?.monthlyRent)}
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="maintenanceFee">
          관리비
          <Input
            aria-invalid={Boolean(fieldErrors?.maintenanceFee)}
            className={cn(
              "h-12 rounded-[18px] bg-white/55 px-4 text-foreground",
              getFieldClassName(Boolean(fieldErrors?.maintenanceFee)),
            )}
            defaultValue={record?.maintenance_fee ?? ""}
            id="maintenanceFee"
            inputMode="numeric"
            min={0}
            name="maintenanceFee"
            placeholder="7"
            type="number"
          />
          {renderFieldError(fieldErrors?.maintenanceFee)}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="waterPressure">
          수압
          <select
            aria-invalid={Boolean(fieldErrors?.waterPressure)}
            className={cn(
              selectClassName,
              getFieldClassName(Boolean(fieldErrors?.waterPressure)),
            )}
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
          {renderFieldError(fieldErrors?.waterPressure)}
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="sunlight">
          채광
          <select
            aria-invalid={Boolean(fieldErrors?.sunlight)}
            className={cn(
              selectClassName,
              getFieldClassName(Boolean(fieldErrors?.sunlight)),
            )}
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
          {renderFieldError(fieldErrors?.sunlight)}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="noise">
          소음
          <select
            aria-invalid={Boolean(fieldErrors?.noise)}
            className={cn(
              selectClassName,
              getFieldClassName(Boolean(fieldErrors?.noise)),
            )}
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
          {renderFieldError(fieldErrors?.noise)}
        </label>
        <label className="grid gap-2 text-sm text-muted-foreground" htmlFor="sanitation">
          벌레·위생
          <select
            aria-invalid={Boolean(fieldErrors?.sanitation)}
            className={cn(
              selectClassName,
              getFieldClassName(Boolean(fieldErrors?.sanitation)),
            )}
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
          {renderFieldError(fieldErrors?.sanitation)}
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
    </>
  );
}
