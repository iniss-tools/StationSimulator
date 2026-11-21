// Predstierana porucha zariadenia: druh a pri oneskoreni cas, pri stavovej odpovedi stavove bity (hex). Pouziva ju
// karta zariadenia aj detail zariadenia na scheme stanice.
import { toast } from "sonner";
import { errorText, setBoardFault, type BoardDto, type BoardFaultDto, type FaultKind } from "@/api";
import { OptionSelect } from "@/components/common/option-select";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n";

const FAULTS: FaultKind[] = ["none", "noReply", "nak", "delay", "garbage", "status"];

/** Poruchy, ktore tabula danej rodiny vie predstierat - stav hlasia len tabule so stavovou odpovedou. */
// stav (kod odpovede) maju len tabule s odpovedou na kazdu spravu - Elektrocas, listove, APEL, jednotky ELSVO a ustredne AK Signal
const STATUS_FAMILIES = ["chars", "flaps", "amplifier", "aksignal"];

/** Predvoleny stav pri poruche so stavovou odpovedou: zosilnovac "pripravena, ale nezopnuta", ustredna "svetla v poriadku", inak chybna sprava. */
const DEFAULT_STATUS: Record<string, number> = { amplifier: 0x80, aksignal: 0x08 };
const faultsFor = (board: BoardDto) => FAULTS.filter((f) => f !== "status" || STATUS_FAMILIES.includes(board.display.family));

const failed = (e: unknown) => toast.error(errorText(e));

export function FaultControl({ board, edit }: { board: BoardDto; edit: boolean }) {
  const fault = (body: BoardFaultDto) => setBoardFault({ path: { id: board.id }, body, throwOnError: true }).catch(failed);
  const setKind = (kind: FaultKind) =>
    fault({
      kind,
      delayMs: kind === "delay" ? Math.max(board.fault.delayMs, 500) : 0,
      status: kind === "status" ? board.fault.status || (DEFAULT_STATUS[board.display.family] ?? 0x01) : 0,
    });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{t("fault.label")}</span>
      <OptionSelect<FaultKind>
        value={board.fault.kind}
        onValueChange={setKind}
        disabled={!edit}
        size="sm"
        ariaLabel={t("fault.label")}
        options={faultsFor(board).map((f) => ({ value: f, label: t(`fault.${f}`) }))}
      />
      {board.fault.kind === "delay" && (
        <Input
          type="number"
          className="h-7 w-24"
          min={0}
          step={100}
          disabled={!edit}
          value={board.fault.delayMs}
          title={t("fault.delayMs")}
          aria-label={t("fault.delayMs")}
          onChange={(e) => fault({ kind: "delay", delayMs: Number.parseInt(e.target.value, 10) || 0, status: 0 })}
        />
      )}
      {board.fault.kind === "status" && (
        <Input
          className="h-7 w-16 font-mono"
          disabled={!edit}
          defaultValue={board.fault.status.toString(16).toUpperCase().padStart(2, "0")}
          title={t("fault.statusBits")}
          aria-label={t("fault.statusBits")}
          onBlur={(e) => {
            const status = Number.parseInt(e.target.value, 16);
            if (!Number.isNaN(status)) void fault({ kind: "status", delayMs: 0, status: status & 0xff });
          }}
        />
      )}
    </div>
  );
}
