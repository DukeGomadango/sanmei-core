import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CalculateResult } from "@sanmei/sanmei-core";
import { calculateApi, type CalculateRequestError } from "./lib/api/calculateApi";
import { buildPayload } from "./lib/normalization";
import { Dict } from "./lib/dictionaries";
import { BentoGrid } from "./widgets/BentoGrid";
import { ControlPanel } from "./widgets/ControlPanel";
import { InsenWidget } from "./widgets/InsenWidget";
import { YousenWidget } from "./widgets/YousenWidget";
import { EnergyActionAreaWidget } from "./widgets/EnergyActionAreaWidget";
import { IsouhouWidget } from "./widgets/IsouhouWidget";
import { TimelineWidget } from "./widgets/TimelineWidget";
import { TenchuSatsuStatusWidget } from "./widgets/TenchuSatsuStatusWidget";
import { ErrorBanner } from "./widgets/ErrorBanner";
import { pushToast, ToastHost } from "./widgets/ToastHost";

const rulesetOptions = ["mock-v1", "mock-internal-v2"] as const;

export default function App() {
  const [controls, setControls] = useState(() => Dict.initialControls());
  const [birthTimeRequired, setBirthTimeRequired] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const payloadAndKey = useMemo(() => {
    const payload = buildPayload(controls);
    return {
      payload,
      // queryKey は Payload 構成要素をすべて含める（birthTime は null 正規化済み）
      queryKey: [
        "calculate",
        payload.user.birthDate,
        payload.user.birthTime,
        payload.user.gender,
        payload.context.timeZone,
        payload.context.asOf,
        payload.systemConfig.sect,
        payload.systemConfig.rulesetVersion,
      ] as const,
    };
  }, [controls]);

  const query = useQuery<CalculateResult, CalculateRequestError>({
    queryKey: payloadAndKey.queryKey,
    enabled: false,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      return calculateApi(payloadAndKey.payload);
    },
  });

  const resultError = query.error;
  useEffect(() => {
    if (!hasRun) return;
    let cancelled = false;
    (async () => {
      setBirthTimeRequired(false);
      const out = await query.refetch();
      if (cancelled) return;
      if (out.error?.code === "TIME_REQUIRED_FOR_SOLAR_TERM") {
        setBirthTimeRequired(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.sect, controls.rulesetVersion]);

  useEffect(() => {
    if (!resultError) return;
    if (resultError.status < 500) return;
    console.error("[sanmei-playground]", {
      code: resultError.code,
      message: resultError.message,
      details: resultError.details,
    });
    pushToast("計算エンジン内部エラーが発生しました");
  }, [resultError]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ToastHost />
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-semibold">sanmei-playground</h1>
        <ErrorBanner error={resultError} />
        <ControlPanel
          controls={controls}
          birthTimeRequired={birthTimeRequired}
          onChangeControls={setControls}
          onRun={async () => {
            setHasRun(true);
            setBirthTimeRequired(false);
            const out = await query.refetch();
            if (out.error?.code === "TIME_REQUIRED_FOR_SOLAR_TERM") {
              setBirthTimeRequired(true);
            }
          }}
          sectOptions={["takao", "shugakuin"]}
          rulesetOptions={[...rulesetOptions]}
          error={resultError}
        />
        <BentoGrid>
          <InsenWidget insen={query.data?.baseProfile.insen ?? null} />
          <YousenWidget yousen={query.data?.baseProfile.yousen ?? null} kyoki={query.data?.interactionRules.kyoki ?? null} />
          <EnergyActionAreaWidget energy={query.data?.baseProfile.energyData ?? null} />
          <IsouhouWidget isouhou={query.data?.interactionRules.isouhou ?? null} />
          <TimelineWidget daiun={query.data?.dynamicTimeline.daiun ?? null} />
          <TenchuSatsuStatusWidget tenchu={query.data?.dynamicTimeline.tenchuSatsuStatus ?? null} />
        </BentoGrid>
      </div>
    </div>
  );
}

// sect/rulesetVersion の切替時は再計算したい（Playground 用）
// enabled:false のため、ここで refetch を走らせる


