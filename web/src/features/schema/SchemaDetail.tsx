// Detail zariadenia vybraneho na scheme: stav, hrajuce hlasenie a zariadenie v plnej velkosti.
import type { SchemaElementDto } from "@/api";
import { StatusBadge, type Tone } from "@/components/common/status-badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BoardView } from "@/features/boards/BoardView";
import { lineLabel, lineStatusTime } from "@/features/lines/line-status";
import { useNow } from "@/hooks/use-now";
import { t } from "@/i18n";
import { announcementText, boardOf, elementLabel, elementState, lineOf, type ElementTone, type SchemaLive } from "./schema";

const TONES: Record<ElementTone, Tone> = { ok: "ok", active: "wait", bad: "bad", off: "off", missing: "off" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

export function SchemaDetail({ element, live, onClose }: { element: SchemaElementDto; live: SchemaLive; onClose: () => void }) {
  const now = useNow(1000);
  const state = elementState(element, live);
  const board = boardOf(element, live.boards);
  const line = lineOf(element, live.lines);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{elementLabel(element, live) || t(`schema.kind.${element.kind}`)}</SheetTitle>
          <SheetDescription>{t(`schema.kind.${element.kind}`)}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div>
            <StatusBadge tone={TONES[state.tone]}>{t(`schema.state.${state.reason}`)}</StatusBadge>
          </div>
          {state.playing && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3">
              <div className="text-xs text-muted-foreground">{t("schema.detail.playing")}</div>
              <div>{announcementText(state.playing)}</div>
            </div>
          )}
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
            {line && <Row label={t("field.line")}>{lineLabel(line)}</Row>}
            {!line && element.line !== null && <Row label={t("field.line")}>{element.line}</Row>}
            {element.kind === "commLine" && line && (
              <>
                <Row label={t("schema.detail.status")}>
                  {t(`line.status.${line.status}`)}
                  {lineStatusTime(line, now) && ` · ${lineStatusTime(line, now)}`}
                </Row>
                <Row label={t("schema.detail.endpoint")}>{line.endpoint}</Row>
              </>
            )}
            {element.address !== null && <Row label={t("field.address")}>{element.address}</Row>}
            {board && <Row label={t("schema.detail.device")}>{board.name || board.manufacturer}</Row>}
            {element.circuit && <Row label={t("schema.detail.circuit")}>{element.circuit}</Row>}
          </dl>
          {board && element.kind !== "commLine" && <BoardView board={board} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
