// Platno schemy stanice: kresba a znacky zariadeni v SVG, zivy obsah tabul ako vrstva nad nim. Rozmery v jednotkach
// platna, na stranke sa cele platno prisposobi sirke miesta.
import type { KeyboardEvent } from "react";
import { Cable, Lightbulb, Monitor, Speaker, Volume2, type LucideIcon } from "lucide-react";
import type { SchemaElementDto, StationSchemaDto } from "@/api";
import { BoardView } from "@/features/boards/BoardView";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import {
  boardOf,
  elementLabel,
  elementState,
  isDevice,
  isPolyline,
  type ElementState,
  type ElementTone,
  type SchemaBackground,
  type SchemaLive,
} from "./schema";

interface Props {
  schema: Pick<StationSchemaDto, "width" | "height" | "elements">;
  live: SchemaLive;
  /** Obrazok pozadia pod kresbou (cely do svojej plochy so zachovanim pomeru stran). */
  background?: SchemaBackground | null;
  /** Tabule ako male indikatory (bodka stavu, ikona, nazov) namiesto ziveho obsahu. */
  symbols?: boolean;
  /** Vybrany prvok (otvoreny detail). */
  selected?: number | null;
  /** Kliknutie na zariadenie; bez obsluhy sa prvky nedaju vybrat. */
  onSelect?: (element: SchemaElementDto) => void;
  className?: string;
}

/** Predvolena velkost pisma v jednotkach platna. */
const FONT = 14;

// vypln a obrys znacky zariadenia podla stavu
const TONES: Record<ElementTone, string> = {
  ok: "fill-card stroke-border",
  active: "fill-emerald-500/20 stroke-emerald-500",
  bad: "fill-red-500/15 stroke-red-500",
  off: "fill-muted stroke-border",
  missing: "fill-transparent stroke-muted-foreground/60 [stroke-dasharray:6_4]",
};

const ICONS: Partial<Record<SchemaElementDto["kind"], LucideIcon>> = { board: Monitor, audio: Volume2, light: Lightbulb, amplifier: Speaker, commLine: Cable };

// farba textu stavu pod nazvom zariadenia
const STATE_TEXT: Record<ElementTone, string> = {
  ok: "fill-muted-foreground",
  active: "fill-emerald-600 dark:fill-emerald-400",
  bad: "fill-red-600 dark:fill-red-400",
  off: "fill-muted-foreground",
  missing: "fill-muted-foreground",
};

const points = (element: SchemaElementDto) => element.points.map((p) => `${p.x},${p.y}`).join(" ");

const rotation = (e: SchemaElementDto) => (e.rotation ? `rotate(${e.rotation} ${e.x + e.width / 2} ${e.y + e.height / 2})` : undefined);

/** Kresba stanice - kolaj, nastupiste, budova, plocha, ciara, text. */
function Drawing({ element: e }: { element: SchemaElementDto }) {
  const size = e.size || FONT;
  if (isPolyline(e.kind)) {
    const first = e.points[0];
    return (
      <g>
        <polyline
          points={points(e)}
          fill="none"
          className={e.kind === "track" ? "stroke-foreground/70" : "stroke-muted-foreground"}
          style={{ stroke: e.color || undefined }}
          strokeWidth={e.stroke || (e.kind === "track" ? 4 : 2)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {e.text && first && (
          <text x={first.x + 6} y={first.y - 6} fontSize={size} className="fill-muted-foreground" style={{ fill: e.color || undefined }}>
            {e.text}
          </text>
        )}
      </g>
    );
  }
  if (e.kind === "text")
    return (
      <text
        x={e.x}
        y={e.y}
        fontSize={size}
        dominantBaseline="hanging"
        transform={rotation(e)}
        className="fill-foreground"
        style={{ fill: e.color || undefined }}
      >
        {e.text}
      </text>
    );
  const centered = e.kind !== "platform";
  return (
    <g transform={rotation(e)}>
      <rect
        x={e.x}
        y={e.y}
        width={e.width}
        height={e.height}
        rx={e.kind === "building" ? 2 : 4}
        className={e.kind === "building" ? "fill-muted-foreground/30 stroke-muted-foreground/70" : "fill-muted-foreground/12 stroke-muted-foreground/45"}
        style={{ fill: e.fill || undefined, stroke: e.color || undefined }}
        strokeWidth={e.stroke || 1}
      />
      {e.text && (
        <text
          x={centered ? e.x + e.width / 2 : e.x + 8}
          y={e.y + e.height / 2}
          fontSize={size}
          textAnchor={centered ? "middle" : "start"}
          dominantBaseline="central"
          className="fill-muted-foreground"
        >
          {e.text}
        </text>
      )}
    </g>
  );
}

interface DeviceProps {
  element: SchemaElementDto;
  state: ElementState;
  label: string;
  selected: boolean;
  /** Tabula so zivym obsahom - znacka je len ram, obsah kresli vrstva nad platnom. */
  live: boolean;
  /** Tabula ako maly indikator namiesto znacky cez celu plochu. */
  compact: boolean;
  onSelect?: (element: SchemaElementDto) => void;
}

// bodka stavu na indikatore tabule
const DOTS: Record<ElementTone, string> = {
  ok: "fill-emerald-500",
  active: "fill-emerald-500",
  bad: "fill-red-500",
  off: "fill-muted-foreground/50",
  missing: "fill-transparent stroke-muted-foreground",
};

/**
 * Tabula ako maly indikator v strede svojej plochy: bodka stavu, ikona a nazov. Stav hovori farba bodky a popis po
 * prejdeni mysou; velkost urcuje pismo prvku, nie jeho plocha.
 */
function Indicator({ element: e, state, label, selected, onSelect }: Omit<DeviceProps, "live" | "compact">) {
  const size = e.size || FONT;
  const height = size * 1.7;
  const dot = size * 0.32;
  const icon = size * 1.05;
  const width = 8 + dot * 2 + 5 + icon + 5 + label.length * size * 0.56 + 10;
  const x = e.x + e.width / 2 - width / 2;
  const y = e.y + e.height / 2 - height / 2;
  const middle = y + height / 2;
  const title = `${label} – ${t(`schema.state.${state.reason}`)}`;
  const keyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect?.(e);
  };
  return (
    <g
      transform={rotation(e)}
      role={onSelect ? "button" : "img"}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={title}
      data-indicator
      className={cn("outline-none", onSelect && "cursor-pointer focus-visible:[&>rect]:stroke-ring")}
      onClick={onSelect && (() => onSelect(e))}
      onKeyDown={onSelect && keyDown}
    >
      <title>{title}</title>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        strokeWidth={selected || state.tone === "bad" ? 2 : 1}
        className={cn("fill-card", state.tone === "bad" ? "stroke-red-500" : "stroke-border", selected && "stroke-primary")}
      />
      <circle cx={x + 8 + dot} cy={middle} r={dot} strokeWidth={1} className={DOTS[state.tone]} />
      <Monitor x={x + 8 + dot * 2 + 5} y={middle - icon / 2} width={icon} height={icon} className="text-muted-foreground" />
      <text
        x={x + 8 + dot * 2 + 5 + icon + 5}
        y={middle}
        fontSize={size}
        dominantBaseline="central"
        className={state.tone === "off" || state.tone === "missing" ? "fill-muted-foreground" : "fill-foreground"}
      >
        {label}
      </text>
    </g>
  );
}

/** Znacka zariadenia so stavom; da sa vybrat mysou aj klavesnicou. */
function Device(props: DeviceProps) {
  const { element: e, state, label, selected, live, compact, onSelect } = props;
  if (compact) return <Indicator element={e} state={state} label={label} selected={selected} onSelect={onSelect} />;
  const Icon = ICONS[e.kind];
  const size = e.size || FONT;
  const icon = Math.max(0, Math.min(e.height - 8, size * 1.3));
  const lit = e.kind === "light" && state.tone === "active";
  // vyssia znacka ma pod nazvom aj stav
  const twoLines = !live && e.height >= size * 2.4;
  const title = `${label} – ${t(`schema.state.${state.reason}`)}`;
  const keyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect?.(e);
  };
  return (
    <g
      transform={rotation(e)}
      role={onSelect ? "button" : "img"}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={title}
      className={cn("outline-none", onSelect && "cursor-pointer focus-visible:[&>rect]:stroke-ring")}
      onClick={onSelect && (() => onSelect(e))}
      onKeyDown={onSelect && keyDown}
    >
      <title>{title}</title>
      <rect
        x={e.x}
        y={e.y}
        width={e.width}
        height={e.height}
        rx={e.kind === "board" ? 3 : 6}
        strokeWidth={selected || state.tone === "bad" ? 2.5 : 1.25}
        className={cn(
          live && state.tone !== "missing" ? "fill-transparent" : "",
          lit ? "fill-amber-400/35 stroke-amber-500" : TONES[state.tone],
          live && state.tone === "ok" && "stroke-transparent",
          selected && "stroke-primary",
          state.tone === "active" && e.kind === "audio" && "animate-pulse",
        )}
      />
      {live && (
        <text x={e.x + 2} y={e.y - 4} fontSize={size * 0.8} className="fill-muted-foreground">
          {label}
        </text>
      )}
      {!live && (
        <>
          {Icon && e.height >= 16 && (
            <Icon x={e.x + 6} y={e.y + (e.height - icon) / 2} width={icon} height={icon} className={lit ? "text-amber-600" : "text-muted-foreground"} />
          )}
          <text
            x={e.x + (Icon ? icon + 12 : 8)}
            y={e.y + e.height / 2 - (twoLines ? size * 0.5 : 0)}
            fontSize={size}
            dominantBaseline="central"
            className={state.tone === "off" || state.tone === "missing" ? "fill-muted-foreground" : "fill-foreground"}
          >
            {label}
          </text>
          {twoLines && (
            <text
              x={e.x + (Icon ? icon + 12 : 8)}
              y={e.y + e.height / 2 + size * 0.65}
              fontSize={size * 0.8}
              dominantBaseline="central"
              className={lit ? "fill-amber-600 dark:fill-amber-400" : STATE_TEXT[state.tone]}
            >
              {t(`schema.state.${state.reason}`)}
            </text>
          )}
        </>
      )}
    </g>
  );
}

export function SchemaCanvas({ schema, live, background, symbols = false, selected, onSelect, className }: Props) {
  const percent = (value: number, of: number) => `${(value / of) * 100}%`;
  const devices = schema.elements.filter((e) => isDevice(e.kind)).map((e) => ({ element: e, state: elementState(e, live), board: boardOf(e, live.boards) }));
  // zivy obsah maju tabule, ktore v simulatore su a nie su vypnute
  const liveBoards = symbols ? [] : devices.filter((d) => d.element.kind === "board" && d.element.view === "live" && d.board && d.state.tone !== "off");
  const isLive = (id: number) => liveBoards.some((d) => d.element.id === id);

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-lg border bg-background", className)}
      style={{ aspectRatio: `${schema.width} / ${schema.height}` }}
    >
      <svg viewBox={`0 0 ${schema.width} ${schema.height}`} className="absolute inset-0 size-full font-sans" role="group" aria-label={t("schema.canvas")}>
        {background && (
          <image
            href={background.href}
            x={background.x}
            y={background.y}
            width={background.width}
            height={background.height}
            opacity={background.opacity}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {schema.elements.map((e) => {
          if (!isDevice(e.kind))
            return (
              // kresba polozena nad zariadenim mu neberie kliknutia
              <g key={e.id} className="pointer-events-none">
                <Drawing element={e} />
              </g>
            );
          const state = elementState(e, live);
          return (
            <Device
              key={e.id}
              element={e}
              state={state}
              label={elementLabel(e, live)}
              selected={selected === e.id}
              live={isLive(e.id)}
              compact={e.kind === "board" && (symbols || e.view === "symbol")}
              onSelect={onSelect}
            />
          );
        })}
      </svg>
      {liveBoards.map(({ element: e, board }) => (
        <div
          key={e.id}
          className="pointer-events-none absolute"
          style={{
            left: percent(e.x, schema.width),
            top: percent(e.y, schema.height),
            width: percent(e.width, schema.width),
            height: percent(e.height, schema.height),
            rotate: e.rotation ? `${e.rotation}deg` : undefined,
          }}
        >
          {board && <BoardView board={board} fit="contain" className="h-full" />}
        </div>
      ))}
    </div>
  );
}
