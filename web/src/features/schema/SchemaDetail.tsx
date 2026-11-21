// Detail zariadenia vybraneho na scheme: stav, hrajuce hlasenie, ovladanie (porucha, zmazanie obsahu, prerusenie
// hlasenia) a zariadenie v plnej velkosti.
import { Eraser, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { breakBoardAnnouncement, clearBoard, errorText, type BoardDto, type SchemaElementDto } from "@/api";
import { StatusBadge, type Tone } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { queueLabel } from "@/features/aksignal/queue-label";
import { BoardView } from "@/features/boards/BoardView";
import { FaultControl } from "@/features/boards/FaultControl";
import { lineLabel, lineStatusTime } from "@/features/lines/line-status";
import { useNow } from "@/hooks/use-now";
import { t } from "@/i18n";
import { announcementText, boardOf, elementLabel, elementState, lineOf, playingQueues, type ElementTone, type SchemaLive } from "./schema";

const TONES: Record<ElementTone, Tone> = { ok: "ok", active: "wait", bad: "bad", off: "off", missing: "off" };

/** Stranka, na ktorej sa zariadenie nastavuje podrobne. */
const PAGES = { board: "/devices", amplifier: "/devices", audio: "/lights", light: "/lights", commLine: "/lines" } as const;

const failed = (e: unknown) => toast.error(errorText(e));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

/** Ovladanie zariadenia: predstierana porucha, pri tabuli zmazanie obsahu, pri rozhlase vzdialeneho INISSu prerusenie hlasenia. */
function Controls({ element, board, control }: { element: SchemaElementDto; board: BoardDto; control: boolean }) {
  const queues = element.kind === "audio" ? playingQueues(element, board) : [];
  return (
    <section className="flex flex-col gap-2 rounded-md border p-3" aria-label={t("schema.detail.controls")}>
      <h3 className="text-xs font-medium text-muted-foreground">{t("schema.detail.controls")}</h3>
      <FaultControl board={board} edit={control} />
      {queues.map((queue) => (
        <div key={queue.name} className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate">{queueLabel(queue.name)}</span>
          <Button
            variant="outline"
            size="sm"
            title={t("remoteaudio.break.hint")}
            disabled={!control}
            onClick={() => void breakBoardAnnouncement({ path: { id: board.id }, query: { queue: queue.name }, throwOnError: true }).catch(failed)}
          >
            {t("remoteaudio.break")}
          </Button>
        </div>
      ))}
      {element.kind === "board" && (
        <div>
          <Button variant="outline" size="sm" disabled={!control} onClick={() => void clearBoard({ path: { id: board.id }, throwOnError: true }).catch(failed)}>
            <Eraser />
            {t("board.clear")}
          </Button>
        </div>
      )}
    </section>
  );
}

interface Props {
  element: SchemaElementDto;
  live: SchemaLive;
  /** Pouzivatel smie ovladat zariadenia (poruchy, zmazanie obsahu, prerusenie hlasenia). */
  control: boolean;
  onClose: () => void;
}

export function SchemaDetail({ element, live, control, onClose }: Props) {
  const now = useNow(1000);
  const state = elementState(element, live);
  const board = boardOf(element, live.boards);
  const line = lineOf(element, live.lines);
  const page = PAGES[element.kind as keyof typeof PAGES];

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
          {board && element.kind !== "commLine" && <Controls element={element} board={board} control={control} />}
          {board && element.kind !== "commLine" && <BoardView board={board} />}
          {page && (
            <div>
              <Button variant="ghost" size="sm" render={<a href={`#${page}`} />}>
                <ExternalLink />
                {t(`schema.detail.open.${element.kind as keyof typeof PAGES}`)}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
