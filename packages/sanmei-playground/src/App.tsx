import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CalculateResult } from "@sanmei/sanmei-core";
import { calculateApi, type CalculateRequestError } from "./lib/api/calculateApi";
import { buildPayload } from "./lib/normalization";
import { Dict } from "./lib/dictionaries";
import { ControlPanel } from "./widgets/ControlPanel";
import { SaasBentoDashboard } from "./widgets/SaasBentoDashboard";
import { ErrorBanner } from "./widgets/ErrorBanner";
import { pushToast, ToastHost } from "./widgets/ToastHost";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";

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
        payload.systemConfig.allowGohouInKaku,
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

  const handleRun = async () => {
    setHasRun(true);
    setBirthTimeRequired(false);
    const out = await query.refetch();
    if (out.error?.code === "TIME_REQUIRED_FOR_SOLAR_TERM") {
      setBirthTimeRequired(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ToastHost />
      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 border-b border-border/80 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">sanmei-playground</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            左側で条件を入力して実行すると、右側に陽占・陰占・行動領域などの結果が表示されます。
          </p>
        </header>

        <div className="mb-4 md:hidden">
          <ErrorBanner error={resultError} />
          <Accordion type="single" collapsible defaultValue="api">
            <AccordionItem value="api">
              <AccordionTrigger value="api">API入力</AccordionTrigger>
              <AccordionContent value="api">
                <div className="mt-1">
                  <ControlPanel
                    showHeader={false}
                    controls={controls}
                    birthTimeRequired={birthTimeRequired}
                    onChangeControls={setControls}
                    onRun={handleRun}
                    sectOptions={["takao", "shugakuin"]}
                    error={resultError}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-12 md:items-start">
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-4 space-y-4">
              <ControlPanel
                controls={controls}
                birthTimeRequired={birthTimeRequired}
                onChangeControls={setControls}
                onRun={handleRun}
                sectOptions={["takao", "shugakuin"]}
                error={resultError}
              />
              <ErrorBanner error={resultError} />
            </div>
          </aside>

          <main className="md:col-span-8 lg:col-span-9">
            <SaasBentoDashboard data={query.data} />
          </main>
        </div>

        <div className="space-y-4 md:hidden">
          <SaasBentoDashboard data={query.data} />
        </div>
      </div>
    </div>
  );
}

// sect/rulesetVersion の切替時は再計算したい（Playground 用）
// enabled:false のため、ここで refetch を走らせる


