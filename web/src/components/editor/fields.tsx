// Polia panelov editora platna (cela tabul, schema stanice): sekcia panelu a cislo. Pri viacerych vybranych prvkoch
// s roznou hodnotou pole ukaze "Rozne" (hodnota undefined) a zmena plati pre vsetky. Cislo sa da menit aj tahanim za
// popis pola doprava a dolava (ako vo Figme): krok pola, so Shift desatnasobok, s Alt desatina.
import { useRef, type PointerEvent, type ReactNode } from "react";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import { FINE } from "./step";

/** Sekcia panelu s nadpisom; polia v dvoch stlpcoch. */
export function PanelSection({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0", className)}>
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {/* pole s dlhsim popisom na dva riadky: popis sused a polia ostanu v jednom riadku (popis rastie, text dole) */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 [&>[data-slot=field]>[data-slot=field-label]]:flex-1 [&>[data-slot=field]>[data-slot=field-label]]:items-end">
        {children}
      </div>
    </section>
  );
}

/** Posun mysi v CSS px, od ktoreho sa tahanie za popis meni na zmenu hodnoty. */
const SCRUB_START = 3;
/** CSS px na jeden krok pri tahani za popis. */
const SCRUB_PX = 2;

const round = (value: number) => Math.round(value * 100) / 100;

interface Scrub {
  pointer: number;
  x: number;
  start: number | undefined;
  moved: boolean;
  /** Posledny posun - rovnaky sa neposiela znova. */
  last: number | null;
}

export function NumberField({
  label,
  value,
  onChange,
  onScrubStart,
  onScrub,
  disabled,
  step = 0.5,
  min,
  hint,
  className,
}: {
  label: string;
  /** undefined = vybrane prvky maju rozne hodnoty. */
  value: number | undefined;
  /** Nova hodnota; transient = pokracovanie tahania za popis (nie novy krok historie). */
  onChange: (value: number, transient?: boolean) => void;
  /** Vlastne tahanie za popis (napr. kazdy prvok od svojej hodnoty): zaciatok a posun od zaciatku. Bez neho sa meni hodnota pola. */
  onScrubStart?: () => void;
  onScrub?: (delta: number, transient: boolean) => void;
  disabled: boolean;
  step?: number;
  min?: number;
  hint?: ReactNode;
  className?: string;
}) {
  const scrub = useRef<Scrub | null>(null);
  // klik po tahani nema presunut kurzor do pola
  const dragged = useRef(false);
  const canScrub = !disabled && (onScrub !== undefined || value !== undefined);

  const down = (e: PointerEvent<HTMLSpanElement>) => {
    if (!canScrub || e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez zachytenia
    }
    scrub.current = { pointer: e.pointerId, x: e.clientX, start: value, moved: false, last: null };
  };
  const move = (e: PointerEvent<HTMLSpanElement>) => {
    const s = scrub.current;
    if (!s || s.pointer !== e.pointerId) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) < SCRUB_START) return;
    if (!s.moved) {
      s.moved = true;
      onScrubStart?.();
    }
    const increment = e.altKey ? FINE : e.shiftKey ? step * 10 : step;
    const delta = round(Math.trunc(dx / SCRUB_PX) * increment);
    if (delta === s.last) return;
    const transient = s.last !== null;
    s.last = delta;
    if (onScrub) onScrub(delta, transient);
    else if (s.start !== undefined) onChange(Math.max(min ?? -Infinity, round(s.start + delta)), transient);
  };
  const up = (e: PointerEvent<HTMLSpanElement>) => {
    if (scrub.current?.pointer !== e.pointerId) return;
    dragged.current = scrub.current.moved;
    scrub.current = null;
  };

  const caption = (
    <span
      className={cn("touch-none select-none", canScrub && "cursor-ew-resize")}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClick={(e) => {
        if (!dragged.current) return;
        dragged.current = false;
        e.preventDefault();
      }}
    >
      {label}
    </span>
  );

  return (
    <FormField label={caption} hint={hint} className={className}>
      <Input
        type="number"
        step={step}
        min={min}
        value={value ?? ""}
        placeholder={value === undefined ? t("faces.mixed") : undefined}
        disabled={disabled}
        onChange={(e) => {
          if (value === undefined && e.target.value === "") return;
          const parsed = Number.parseFloat(e.target.value);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
      />
    </FormField>
  );
}
