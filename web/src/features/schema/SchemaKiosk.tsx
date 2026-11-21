// Schema stanice na celu obrazovku (#/plan/<cislo>) - cele platno do okna, zivy stav zariadeni, bez ovladania.
import { useQuery } from "@tanstack/react-query";
import { errorText, getStationSchemasOptions, useConnection, useSimulatorState } from "@/api";
import { KioskControls } from "@/app/KioskControls";
import { toggleFullscreen, useKiosk } from "@/app/kiosk";
import { t, useLanguage } from "@/i18n";
import { cn } from "@/lib/utils";
import { SchemaCanvas } from "./SchemaCanvas";
import { backgroundOf } from "./schema";

export function SchemaKiosk({ id }: { id: number }) {
  useLanguage();
  const { connected } = useConnection();
  const state = useSimulatorState();
  const query = useQuery(getStationSchemasOptions());
  const schema = query.data?.find((s) => s.id === id);
  const active = useKiosk(`/plan/${id}`, schema?.name || t("kiosk.planName", { id }));
  const message = query.error ? errorText(query.error) : query.data && !schema ? t("error.schema.notFound") : null;

  return (
    <div className={cn("flex h-dvh items-center justify-center bg-background", !active && "cursor-none")} onDoubleClick={toggleFullscreen}>
      {schema && (
        // cele platno do okna so zachovanim pomeru stran
        <div style={{ width: `min(100vw, calc(100dvh * ${schema.width} / ${schema.height}))` }}>
          <SchemaCanvas
            schema={schema}
            live={{ lines: state.lines, boards: state.boards }}
            background={backgroundOf(schema, schema.backgroundOpacity)}
            className="rounded-none border-0"
          />
        </div>
      )}
      {message && <div className="bg-destructive/15 px-3 py-1 text-sm text-destructive">{message}</div>}
      {!connected && <div className="fixed bottom-3 left-3 text-[13px] text-amber-600">{t("server.offline")}</div>}
      <KioskControls visible={active} />
    </div>
  );
}
