// Platno editora schemy: nad nakreslenou schemou vrstva na vyber (klik, Ctrl/Shift+klik, obdlznik po prazdnom mieste),
// posun vybranych prvkov a zmenu velkosti uchytmi. Vybrana kolaj alebo ciara ma uchyty v bodoch (tahanie hybe bodom,
// uchyt v strede useku prida bod, dvojklik bod odstrani). Pri tahani sa prvok prichytava k okrajom a stredom ostatnych prvkov
// a platna (ruzove vodiace ciary), s Alt bez prichytenia a po desatinach.
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { SchemaElementDto, StationSchemaDto } from "@/api";
import { intersecting, union } from "@/components/editor/align";
import { snapEdge, snapMove, targetsOf, type Guide, type SnapOptions, type SnapTargets } from "@/components/editor/snap";
import { FINE, snap } from "@/components/editor/step";
import { cn } from "@/lib/utils";
import type { Box } from "@/render/face";
import { SchemaCanvas } from "./SchemaCanvas";
import { isPolyline, type SchemaBackground, type SchemaLive } from "./schema";
import { boxOf, fitTo, HANDLES, insertPoint, moveBy, movePoint, removePoint, resizeBox, straighten, type Handle } from "./schema-edit";

interface Props {
  schema: Pick<StationSchemaDto, "width" | "height" | "elements">;
  live: SchemaLive;
  background: SchemaBackground | null;
  /** CSS px na jednotku platna. */
  scale: number;
  /** Indexy vybranych prvkov. */
  selection: number[];
  /** Prvky skryte v editore. */
  hidden: ReadonlySet<number>;
  onSelect: (selection: number[]) => void;
  /** Zmenene prvky podla indexu; transient = pokracovanie tahania (nie novy krok historie). */
  onChange: (changes: ReadonlyMap<number, SchemaElementDto>, transient: boolean) => void;
}

/** Posun mysi v CSS px, od ktoreho sa klik meni na tahanie. */
const DRAG_START = 3;
/** Dosah prichytenia v CSS px. */
const SNAP_REACH = 6;
/** Najdlhsi cas medzi dvoma klikmi dvojkliku [ms]. */
const DOUBLE_CLICK = 400;
/** Najmensia plocha na chytenie v CSS px. */
const MIN_HIT = 12;

interface Drag {
  pointer: number;
  x: number;
  y: number;
  started: boolean;
  /** Posun vyberu, alebo uchyt jedineho vybraneho prvku. */
  handle: Handle | null;
  /** Tahany bod lomenej ciary (originals ma jediny prvok, uz aj s pridanym bodom). */
  point: number | null;
  originals: Map<number, SchemaElementDto>;
  /** Plocha tahanych prvkov na zaciatku. */
  box: Box;
  targets: SnapTargets;
  changed: boolean;
}

interface Marquee {
  pointer: number;
  add: boolean;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const handleStyle = (h: Handle, b: Box, scale: number): CSSProperties => ({
  left: (h.left ? b.x : h.right ? b.x + b.w : b.x + b.w / 2) * scale - 4,
  top: (h.top ? b.y : h.bottom ? b.y + b.h : b.y + b.h / 2) * scale - 4,
  cursor:
    (h.left && h.top) || (h.right && h.bottom)
      ? "nwse-resize"
      : (h.right && h.top) || (h.left && h.bottom)
        ? "nesw-resize"
        : h.left || h.right
          ? "ew-resize"
          : "ns-resize",
});

export function SchemaEditCanvas({ schema, live, background, scale, selection, hidden, onSelect, onChange }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const lastPoint = useRef<{ element: number; point: number; time: number } | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);

  const elements = schema.elements;
  const boxes = elements.map((e, i) => (hidden.has(i) ? null : boxOf(e)));
  const shown = { ...schema, elements: elements.filter((_, i) => !hidden.has(i)) };
  const css = (b: Box): CSSProperties => ({ left: b.x * scale, top: b.y * scale, width: b.w * scale, height: b.h * scale });
  // tenku kolaj alebo maly prvok treba vediet chytit
  const hit = (b: Box): CSSProperties => {
    const w = Math.max(MIN_HIT, b.w * scale);
    const h = Math.max(MIN_HIT, b.h * scale);
    return { left: (b.x + b.w / 2) * scale - w / 2, top: (b.y + b.h / 2) * scale - h / 2, width: w, height: h };
  };
  const capture = (e: PointerEvent<HTMLElement>) => {
    // ukazovatel, ktory prehliadac nepozna (udalost zo skriptu), sa zachytit neda - tahanie funguje aj bez toho
    try {
      root.current?.setPointerCapture(e.pointerId);
    } catch {
      // bez zachytenia
    }
  };

  const begin = (e: PointerEvent<HTMLElement>, index: number, handle: Handle | null) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (!handle && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      onSelect(selection.includes(index) ? selection.filter((i) => i !== index) : [...selection, index]);
      return;
    }
    const moving = handle || !selection.includes(index) ? [index] : selection.filter((i) => !elements[i].locked && !hidden.has(i));
    if (!selection.includes(index)) onSelect([index]);
    const moved = new Set(moving);
    const others = boxes.flatMap((b, i) => (b && !moved.has(i) ? [b] : []));
    capture(e);
    drag.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      started: false,
      handle,
      point: null,
      originals: new Map(moving.map((i) => [i, elements[i]])),
      box: union(moving.map((i) => boxOf(elements[i]))),
      targets: targetsOf([...others, { x: 0, y: 0, w: schema.width, h: schema.height }]),
      changed: false,
    };
  };

  /** Tahanie bodu lomenej ciary; insert = bod sa najprv prida za bod point (uchyt v strede useku). */
  const beginPoint = (e: PointerEvent<HTMLElement>, index: number, point: number, insert: boolean) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const element = elements[index];
    // druhy klik na ten isty bod = odstranit ho (dvojklik by po zachyteni ukazovatela prisiel platnu, nie uchytu)
    const last = lastPoint.current;
    lastPoint.current = insert ? null : { element: element.id, point, time: e.timeStamp };
    if (!insert && last && last.element === element.id && last.point === point && e.timeStamp - last.time < DOUBLE_CLICK) {
      lastPoint.current = null;
      onChange(new Map([[index, removePoint(element, point)]]), false);
      return;
    }
    const a = element.points[point];
    const b = element.points[point + 1];
    const original = insert && b ? insertPoint(element, point, (a.x + b.x) / 2, (a.y + b.y) / 2) : element;
    const others = boxes.flatMap((box, i) => (box && i !== index ? [box] : []));
    capture(e);
    drag.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      started: false,
      handle: null,
      point: insert ? point + 1 : point,
      originals: new Map([[index, original]]),
      box: boxOf(original),
      targets: targetsOf([...others, { x: 0, y: 0, w: schema.width, h: schema.height }]),
      changed: false,
    };
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    if (marquee?.pointer === e.pointerId && root.current) {
      const rect = root.current.getBoundingClientRect();
      setMarquee({ ...marquee, x1: e.clientX - rect.left, y1: e.clientY - rect.top });
      return;
    }
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    if (!d.started && Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_START) return;
    d.started = true;
    let dx = (e.clientX - d.x) / scale;
    let dy = (e.clientY - d.y) / scale;
    const step = e.altKey ? FINE : 1;
    const options: SnapOptions = { threshold: SNAP_REACH / scale, grid: null, objects: !e.altKey };
    const lines: Guide[] = [];
    const changes = new Map<number, SchemaElementDto>();
    const h = d.handle;
    if (d.point !== null) {
      const [[index, original]] = [...d.originals];
      const start = original.points[d.point];
      const axis = (name: "x" | "y", value: number, delta: number) => {
        const r = snapEdge(name, value, delta, { x: start.x, y: start.y, w: 0, h: 0 }, d.targets, options);
        if (r.guide) lines.push(r.guide);
        return r.guide ? value + r.delta : snap(value + delta, step);
      };
      let x = axis("x", start.x, dx);
      let y = axis("y", start.y, dy);
      // do roviny so susednymi bodmi - useky ostavaju vodorovne a zvisle
      if (!e.altKey) {
        const neighbours = [original.points[d.point - 1], original.points[d.point + 1]].filter((p) => p !== undefined);
        ({ x, y } = straighten(x, y, neighbours, SNAP_REACH / scale));
      }
      changes.set(index, movePoint(original, d.point, x, y));
    } else if (!h) {
      const snapped = snapMove(d.box, dx, dy, d.targets, "left", "top", options);
      lines.push(...snapped.guides);
      // os bez prichytenia sa zaokruhli na krok
      dx = lines.some((g) => g.axis === "x") ? snapped.dx : snap(d.box.x + dx, step) - d.box.x;
      dy = lines.some((g) => g.axis === "y") ? snapped.dy : snap(d.box.y + dy, step) - d.box.y;
      for (const [i, original] of d.originals) changes.set(i, moveBy(original, dx, dy, 0.001));
    } else {
      const edge = (axis: "x" | "y", value: number, delta: number) => {
        const r = snapEdge(axis, value, delta, d.box, d.targets, options);
        if (r.guide) lines.push(r.guide);
        return r.guide ? r.delta : snap(value + delta, step) - value;
      };
      if (h.left || h.right) dx = edge("x", h.left ? d.box.x : d.box.x + d.box.w, dx);
      if (h.top || h.bottom) dy = edge("y", h.top ? d.box.y : d.box.y + d.box.h, dy);
      for (const [i, original] of d.originals) changes.set(i, fitTo(original, d.box, resizeBox(d.box, h, dx, dy), 0.001));
    }
    setGuides(lines);
    if ([...changes].every(([i, changed]) => JSON.stringify(changed) === JSON.stringify(elements[i]))) return;
    onChange(changes, d.changed);
    d.changed = true;
  };

  const end = (e: PointerEvent<HTMLElement>) => {
    const m = marquee;
    if (m?.pointer === e.pointerId) {
      setMarquee(null);
      // len klik na prazdne miesto = zrusit vyber
      if (Math.hypot(m.x1 - m.x0, m.y1 - m.y0) < DRAG_START) {
        if (!m.add) onSelect([]);
        return;
      }
      const rect = { x: Math.min(m.x0, m.x1) / scale, y: Math.min(m.y0, m.y1) / scale, w: Math.abs(m.x1 - m.x0) / scale, h: Math.abs(m.y1 - m.y0) / scale };
      const hits = intersecting(boxes, rect).filter((i) => !elements[i].locked);
      onSelect(m.add ? [...selection, ...hits.filter((i) => !selection.includes(i))] : hits);
      return;
    }
    if (drag.current?.pointer !== e.pointerId) return;
    drag.current = null;
    setGuides([]);
  };

  const single = selection.length === 1 && !elements[selection[0]]?.locked ? boxes[selection[0]] : null;
  // jedina vybrana lomena ciara ma uchyty v bodoch namiesto uchytov plochy
  const line = single && isPolyline(elements[selection[0]].kind) ? elements[selection[0]] : null;
  const dot = (x: number, y: number, size: number): CSSProperties => ({ left: x * scale - size / 2, top: y * scale - size / 2, width: size, height: size });

  return (
    <div
      ref={root}
      className="relative shrink-0 touch-none select-none"
      style={{ width: schema.width * scale, height: schema.height * scale }}
      onPointerDown={(e) => {
        if (e.button !== 0 || !root.current) return;
        capture(e);
        const rect = root.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMarquee({ pointer: e.pointerId, add: e.ctrlKey || e.metaKey || e.shiftKey, x0: x, y0: y, x1: x, y1: y });
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <SchemaCanvas schema={shown} live={live} background={background} className="pointer-events-none rounded-none" />
      {boxes.map((b, i) =>
        b && !elements[i].locked ? (
          <div key={elements[i].id} data-element={elements[i].id} className="absolute cursor-move" style={hit(b)} onPointerDown={(e) => begin(e, i, null)} />
        ) : null,
      )}
      {selection.map((i) => {
        const b = boxes[i];
        // jedina vybrana lomena ciara ma uchyty v bodoch - ram plochy by len zavadzal
        return b && !(line && i === selection[0]) ? (
          <div
            key={elements[i].id}
            className={cn("pointer-events-none absolute border-2", elements[i].locked ? "border-dashed border-muted-foreground" : "border-primary")}
            style={css(b)}
          />
        ) : null;
      })}
      {line?.points.slice(0, -1).map((p, k) => {
        const next = line.points[k + 1];
        return (
          <div
            key={`m${k}`}
            data-midpoint={k}
            className="absolute cursor-copy rounded-full border border-primary bg-background opacity-60 hover:opacity-100"
            style={dot((p.x + next.x) / 2, (p.y + next.y) / 2, 8)}
            onPointerDown={(e) => beginPoint(e, selection[0], k, true)}
          />
        );
      })}
      {line?.points.map((p, k) => (
        <div
          key={`p${k}`}
          data-point={k}
          className="absolute cursor-crosshair rounded-full border-2 border-primary bg-background"
          style={dot(p.x, p.y, 12)}
          onPointerDown={(e) => beginPoint(e, selection[0], k, false)}
        />
      ))}
      {single &&
        !line &&
        HANDLES.map((h, k) => (
          <div
            key={k}
            data-handle={k}
            className="absolute size-2 rounded-xs border border-primary bg-background"
            style={handleStyle(h, single, scale)}
            onPointerDown={(e) => begin(e, selection[0], h)}
          />
        ))}
      {guides.map((g, k) => (
        <div
          key={k}
          className="pointer-events-none absolute bg-pink-500"
          style={
            g.axis === "x"
              ? { left: g.at * scale, top: g.from * scale, width: 1, height: (g.to - g.from) * scale }
              : { top: g.at * scale, left: g.from * scale, height: 1, width: (g.to - g.from) * scale }
          }
        />
      ))}
      {marquee && (
        <div
          className="pointer-events-none absolute border border-primary bg-primary/10"
          style={{
            left: Math.min(marquee.x0, marquee.x1),
            top: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
          }}
        />
      )}
    </div>
  );
}
