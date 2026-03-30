import type { CalculateRequestError } from "../lib/api/calculateApi";
import type { ControlsState } from "../lib/types";
import type { Dispatch, SetStateAction } from "react";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";

export function ControlPanel({
  controls,
  birthTimeRequired,
  onChangeControls,
  onRun,
  sectOptions,
  rulesetOptions,
  error,
  showHeader = true,
}: {
  controls: ControlsState;
  birthTimeRequired: boolean;
  onChangeControls: Dispatch<SetStateAction<ControlsState>>;
  onRun: () => void | Promise<void>;
  sectOptions: string[];
  rulesetOptions: string[];
  error: CalculateRequestError | null | undefined;
  showHeader?: boolean;
}) {
  const timeRequiredMessage =
    error?.code === "TIME_REQUIRED_FOR_SOLAR_TERM" ? error.message : undefined;

  const validationDetails = error?.code === "VALIDATION_ERROR" ? error.details : undefined;

  const fallbackValidationMessage = (() => {
    if (!validationDetails || typeof validationDetails !== "object") return undefined;
    const d = validationDetails as { formErrors?: unknown };
    const formErrors = Array.isArray(d.formErrors) ? (d.formErrors.filter((x) => typeof x === "string") as string[]) : [];
    return formErrors[0] ?? undefined;
  })();

  const fieldErrorMessages = (() => {
    if (!validationDetails || typeof validationDetails !== "object") return {};
    const d = validationDetails as { fieldErrors?: Record<string, unknown> };
    const errs = d.fieldErrors ?? {};
    const getFirst = (v: unknown) => (Array.isArray(v) ? (v[0] as string | undefined) : undefined);
    return {
      birthDate: getFirst(errs["user.birthDate"]),
      birthTime: getFirst(errs["user.birthTime"]),
      gender: getFirst(errs["user.gender"]),
      timeZoneId: getFirst(errs["user.timeZoneId"]),
      asOf: getFirst(errs["context.asOf"]),
      timeZone: getFirst(errs["context.timeZone"]),
      sect: getFirst(errs["systemConfig.sect"]),
      rulesetVersion: getFirst(errs["systemConfig.rulesetVersion"]),
    };
  })();

  const hasAnyFieldError = Object.values(fieldErrorMessages).some((v) => typeof v === "string" && v.length > 0);

  return (
    <Card className="p-0 border-border/90">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base">入力条件</CardTitle>
        </CardHeader>
      )}
      <div className="px-4 pb-4 md:px-5 md:pb-5">

        {error?.code === "VALIDATION_ERROR" && !hasAnyFieldError && fallbackValidationMessage && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
            {fallbackValidationMessage}
          </div>
        )}

        <div className="mb-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">基本条件</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-sm font-medium">生年月日</span>
              <Input
                type="date"
                value={controls.birthDate}
                onChange={(e) => onChangeControls({ ...controls, birthDate: e.target.value })}
              />
              {fieldErrorMessages.birthDate && <span className="text-xs text-red-600">{fieldErrorMessages.birthDate}</span>}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-sm font-medium">性別</span>
              <Select
                value={controls.gender}
                onChange={(e) => onChangeControls({ ...controls, gender: e.target.value as ControlsState["gender"] })}
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
              </Select>
              {fieldErrorMessages.gender && <span className="text-xs text-red-600">{fieldErrorMessages.gender}</span>}
            </label>

            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
              <span className="text-sm font-medium">出生時刻（節入り前後判定が必要な場合のみ）</span>
              {birthTimeRequired && (
                <>
                  <Input
                    type="time"
                    value={controls.birthTime ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      onChangeControls({ ...controls, birthTime: v === "" ? null : v });
                    }}
                  />
                  {timeRequiredMessage && (
                    <div className="mt-1 text-xs text-amber-700">{timeRequiredMessage}</div>
                  )}
                  {fieldErrorMessages.birthTime && (
                    <span className="text-xs text-red-600">{fieldErrorMessages.birthTime}</span>
                  )}
                </>
              )}
              {!birthTimeRequired && (
                <div className="rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
                  時刻は未入力（`null` 送信）です。422 が返った場合のみ入力欄を表示します。
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-3 border-t border-border/80 pt-4">
          <h4 className="text-sm font-semibold text-foreground">計算設定</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-sm font-medium">基準日（asOf）</span>
              <Input
                type="date"
                value={controls.asOf}
                onChange={(e) => onChangeControls({ ...controls, asOf: e.target.value })}
              />
              {fieldErrorMessages.asOf && <span className="text-xs text-red-600">{fieldErrorMessages.asOf}</span>}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-sm font-medium">タイムゾーン</span>
              <Select
                value={controls.timeZone}
                onChange={(e) => onChangeControls({ ...controls, timeZone: e.target.value })}
              >
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="UTC">UTC</option>
              </Select>
              {fieldErrorMessages.timeZone && <span className="text-xs text-red-600">{fieldErrorMessages.timeZone}</span>}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-sm font-medium">学派（sect）</span>
              <Select
                value={controls.sect}
                onChange={(e) => onChangeControls({ ...controls, sect: e.target.value })}
              >
                {sectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              {fieldErrorMessages.sect && <span className="text-xs text-red-600">{fieldErrorMessages.sect}</span>}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-sm font-medium">ルール版（rulesetVersion）</span>
              <Select
                value={controls.rulesetVersion}
                onChange={(e) => onChangeControls({ ...controls, rulesetVersion: e.target.value })}
              >
                {rulesetOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              {fieldErrorMessages.rulesetVersion && (
                <span className="text-xs text-red-600">{fieldErrorMessages.rulesetVersion}</span>
              )}
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            type="button"
            className="min-w-24"
            onClick={() => onRun()}
          >
            実行
          </Button>
          <div className="text-xs text-muted-foreground">
            学派・ルール版の切替は次回実行時に反映されます。
          </div>
        </div>
      </div>
    </Card>
  );
}

