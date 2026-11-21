// Platno editora schemy: nad nakreslenou schemou vrstva na vyber (klik, Ctrl/Shift+klik, obdlznik po prazdnom mieste),
// posun vybranych prvkov a zmenu velkosti uchytmi. Vybrana kolaj alebo ciara ma uchyty v bodoch (tahanie hybe bodom,
// uchyt v strede useku prida bod, dvojklik bod odstrani). Pri tahani sa prvok prichytava k okrajom a stredom ostatnych
// prvkov a platna (ruzove vodiace ciary) alebo k mriezke, s Alt bez prichytenia a po desatinach. Drzany Alt bez
// tahania meria vzdialenost vyberu od prvku pod mysou (inak od platna). Otoceny prvok sa vybera a prichytava podla
// obdlznika okolo otocenej plochy, jeho uchyty su otocene s nim a menia rozmer v jeho osiach (pri otoceni o stvrtiny
// kruhu s prichytavanim ako neotoceny prvok, pri sikmom na mriezku alebo cely krok). V rezime uprav pozadia
// sa namiesto prvkov taha a meni plocha obrazka pozadia.
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { SchemaElementDto, StationSchemaDto } from "@/api";
import { intersecting, union } from "@/components/editor/align";
import { measure } from "@/components/editor/measure";
import { snapEdge, snapMove, targetsOf, type Gap, type Guide, type SnapOptions, type SnapTargets } from "@/components/editor/snap";
import { FINE, snap } from "@/components/editor/step";
import { cn } from "@/lib/utils";
import type { Box } from "@/render/face";
import { SchemaCanvas } from "./SchemaCanvas";
import { isPolyline, type SchemaBackground, type SchemaLive } from "./schema";
import {
  boundsOf,
  boxOf,
  DEVICE_DRAG_TYPE,
  fitTo,
  HANDLES,
  insertPoint,
  moveBy,
  movePoint,
  removePoint,
  resizeBox,
  quarterTurns,
  resizeRotated,
  rotatePoint,
  rotationCenter,
  straighten,
  turnBox,
  turnHandle,
  type Handle,
} from "./schema-edit";
import type { SchemaEditorView } from "./view";

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
  /** Mriezka, prichytavanie a vodiace ciary. */
  view: SchemaEditorView;
  /** Uprava plochy obrazka pozadia mysou - prvky sa vtedy nedaju vybrat. */
  backgroundEdit: boolean;
  /** Nova plocha obrazka pozadia; transient = pokracovanie tahania. */
  onBackground: (box: Box, transient: boolean) => void;
  onSelect: (selection: number[]) => void;
  /** Zariadenie zo zoznamu pustene na bod platna (kluc zariadenia, suradnice v jednotkach platna). */
  onDropDevice: (key: string, x: number, y: number) => void;
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
/** Hustejsia mriezka nez tolkoto CSS px sa nekresli. */
const MIN_GRID = 4;

interface Drag {
  pointer: number;
  x: number;
  y: number;
  started: boolean;
  /** Posun vyberu, alebo uchyt jedineho vybraneho prvku. */
  handle: Handle | null;
  /** Tahany bod lomenej ciary (originals ma jediny prvok, uz aj s pridanym bodom). */
  point: number | null;
  /** Taha sa plocha obrazka pozadia (originals je prazdne). */
  picture: boolean;
  /** Otocenie prvku, ktoreho uchyt sa taha (stupne). */
  rotation: number;
  /** Uchyt patri textu (otaca sa okolo svojho zaciatku a meni velkost pisma). */
  text: boolean;
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

/** Dlzka v jednotkach platna na stitok (bez zbytocnych desatin). */
const number = (value: number) => String(Math.round(value * 10) / 10);

export function SchemaEditCanvas(props: Props) {
  const { schema, live, background, scale, selection, hidden, view, backgroundEdit, onSelect, onDropDevice, onBackground, onChange } = props;
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const lastPoint = useRef<{ element: number; point: number; time: number } | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [lines, setLines] = useState<{ guides: Guide[]; gaps: Gap[] } | null>(null);
  // mys nad prvkom (index); null = nad prazdnym miestom platna, undefined = mimo platna
  const [hover, setHover] = useState<number | null | undefined>(undefined);
  const [alt, setAlt] = useState(false);
  // prave sa taha (meranie s Alt sa vtedy neukazuje)
  const [dragging, setDragging] = useState(false);

  // drzany Alt = meranie (kym sa netaha)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAlt(e.type === "keydown");
    };
    const blur = () => setAlt(false);
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
      window.removeEventListener("blur", blur);
    };
  }, []);

  const elements = schema.elements;
  const canvas: Box = { x: 0, y: 0, w: schema.width, h: schema.height };
  // plochy aj s otocenim - vyber obdlznikom, prichytavanie a meranie
  const bounds = elements.map((e, i) => (hidden.has(i) ? null : boundsOf(e)));
  const shown = { ...schema, elements: elements.filter((_, i) => !hidden.has(i)) };
  const css = (b: Box): CSSProperties => ({ left: b.x * scale, top: b.y * scale, width: b.w * scale, height: b.h * scale });
  /** Otocenie plochy prvku okolo jeho stredu otocenia. */
  const rotated = (e: SchemaElementDto, style: CSSProperties): CSSProperties => {
    if (!e.rotation || isPolyline(e.kind)) return style;
    const center = rotationCenter(e);
    return {
      ...style,
      rotate: `${e.rotation}deg`,
      transformOrigin: `${center.x * scale - Number(style.left)}px ${center.y * scale - Number(style.top)}px`,
    };
  };
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
  const snapOptions = (e: { altKey: boolean }): SnapOptions => ({
    threshold: SNAP_REACH / scale,
    grid: view.snapGrid && !e.altKey ? { step: view.gridStep, originX: 0, originY: 0 } : null,
    objects: view.guides && !e.altKey,
  });
  const targetsWithout = (moved: ReadonlySet<number>) => targetsOf([...bounds.flatMap((b, i) => (b && !moved.has(i) ? [b] : [])), canvas]);

  const begin = (e: PointerEvent<HTMLElement>, index: number, handle: Handle | null) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (!handle && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      onSelect(selection.includes(index) ? selection.filter((i) => i !== index) : [...selection, index]);
      return;
    }
    const moving = handle || !selection.includes(index) ? [index] : selection.filter((i) => !elements[i].locked && !hidden.has(i));
    if (!selection.includes(index)) onSelect([index]);
    capture(e);
    drag.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      started: false,
      handle,
      point: null,
      picture: false,
      rotation: handle && !isPolyline(elements[index].kind) ? elements[index].rotation : 0,
      text: elements[index].kind === "text",
      originals: new Map(moving.map((i) => [i, elements[i]])),
      // uchyt meni neotocenu plochu, posun sa prichytava podla plochy s otocenim
      box: handle ? boxOf(elements[index]) : union(moving.map((i) => boundsOf(elements[i]))),
      targets: targetsWithout(new Set(moving)),
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
    capture(e);
    drag.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      started: false,
      handle: null,
      picture: false,
      rotation: 0,
      text: false,
      point: insert ? point + 1 : point,
      originals: new Map([[index, original]]),
      box: boxOf(original),
      targets: targetsWithout(new Set([index])),
      changed: false,
    };
  };

  /** Tahanie plochy obrazka pozadia (handle = uchyt, inak posun). */
  const beginPicture = (e: PointerEvent<HTMLElement>, handle: Handle | null) => {
    if (e.button !== 0 || !background) return;
    e.stopPropagation();
    capture(e);
    drag.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      started: false,
      handle,
      point: null,
      picture: true,
      rotation: 0,
      text: false,
      originals: new Map(),
      box: { x: background.x, y: background.y, w: background.width, h: background.height },
      targets: targetsWithout(new Set()),
      changed: false,
    };
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    if (e.altKey !== alt) setAlt(e.altKey);
    if (marquee?.pointer === e.pointerId && root.current) {
      const rect = root.current.getBoundingClientRect();
      setMarquee({ ...marquee, x1: e.clientX - rect.left, y1: e.clientY - rect.top });
      return;
    }
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    if (!d.started && Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_START) return;
    if (!d.started) setDragging(true);
    d.started = true;
    let dx = (e.clientX - d.x) / scale;
    let dy = (e.clientY - d.y) / scale;
    const step = e.altKey ? FINE : 1;
    const options = snapOptions(e);
    const guides: Guide[] = [];
    let gaps: Gap[] = [];
    const changes = new Map<number, SchemaElementDto>();
    const h = d.handle;
    /** Okraj alebo bod na osi: k prvku, inak k mriezke, inak na cely krok. */
    const edge = (axis: "x" | "y", value: number, delta: number, box: Box) => {
      const r = snapEdge(axis, value, delta, box, d.targets, options);
      if (r.guide) guides.push(r.guide);
      return r.guide || options.grid ? r.delta : snap(value + delta, step) - value;
    };
    if (d.picture) {
      // plocha obrazka: posun sa prichytava ako prvok, uchyt meni jej okraje
      let box: Box;
      if (!h) {
        const snapped = snapMove(d.box, dx, dy, d.targets, "left", "top", options);
        guides.push(...snapped.guides);
        dx = guides.some((g) => g.axis === "x") || options.grid ? snapped.dx : snap(d.box.x + dx, step) - d.box.x;
        dy = guides.some((g) => g.axis === "y") || options.grid ? snapped.dy : snap(d.box.y + dy, step) - d.box.y;
        box = { ...d.box, x: d.box.x + dx, y: d.box.y + dy };
      } else {
        if (h.left || h.right) dx = edge("x", h.left ? d.box.x : d.box.x + d.box.w, dx, d.box);
        if (h.top || h.bottom) dy = edge("y", h.top ? d.box.y : d.box.y + d.box.h, dy, d.box);
        box = resizeBox(d.box, h, dx, dy);
      }
      setLines(guides.length ? { guides, gaps: [] } : null);
      onBackground(box, d.changed);
      d.changed = true;
      return;
    }
    if (d.point !== null) {
      const [[index, original]] = [...d.originals];
      const start = original.points[d.point];
      const at = { x: start.x, y: start.y, w: 0, h: 0 };
      let x = start.x + edge("x", start.x, dx, at);
      let y = start.y + edge("y", start.y, dy, at);
      // do roviny so susednymi bodmi - useky ostavaju vodorovne a zvisle
      if (!e.altKey) {
        const neighbours = [original.points[d.point - 1], original.points[d.point + 1]].filter((p) => p !== undefined);
        ({ x, y } = straighten(x, y, neighbours, SNAP_REACH / scale));
      }
      changes.set(index, movePoint(original, d.point, x, y));
    } else if (!h) {
      const snapped = snapMove(d.box, dx, dy, d.targets, "left", "top", options);
      guides.push(...snapped.guides);
      gaps = snapped.gaps;
      // os bez prichytenia k prvku ide na mriezku, bez nej sa zaokruhli na krok
      dx = guides.some((g) => g.axis === "x") || options.grid ? snapped.dx : snap(d.box.x + dx, step) - d.box.x;
      dy = guides.some((g) => g.axis === "y") || options.grid ? snapped.dy : snap(d.box.y + dy, step) - d.box.y;
      for (const [i, original] of d.originals) changes.set(i, moveBy(original, dx, dy, 0.001));
    } else if (d.rotation) {
      const turns = quarterTurns(d.rotation);
      let resized: Box;
      if (d.text) {
        // otoceny text sa otaca okolo svojho zaciatku: meni sa vyska (velkost pisma), zaciatok ostava na mieste
        const local = rotatePoint(dx, dy, 0, 0, -d.rotation);
        const next = resizeBox(d.box, h, local.x, local.y);
        resized = { x: d.box.x, y: d.box.y, w: next.w, h: snap(next.h, step) };
      } else if (turns !== null) {
        // otocenie o stvrtiny kruhu: okraje su rovnobezne s obrazovkou, prichytavaju sa ako pri neotocenom prvku
        const screen = turnBox(d.box, turns);
        const turned = turnHandle(h, turns);
        if (turned.left || turned.right) dx = edge("x", turned.left ? screen.x : screen.x + screen.w, dx, screen);
        if (turned.top || turned.bottom) dy = edge("y", turned.top ? screen.y : screen.y + screen.h, dy, screen);
        resized = turnBox(resizeBox(screen, turned, dx, dy), turns);
      } else {
        // sikme otocenie: rozmer v osiach prvku, protilahly okraj ostava na mieste; rozmer ide na mriezku alebo cely krok
        const free = resizeRotated(d.box, d.rotation, h, dx, dy);
        const unit = options.grid ? options.grid.step : step;
        const sized = { ...d.box, w: Math.max(unit, snap(free.w, unit)), h: Math.max(unit, snap(free.h, unit)) };
        // posun, ktory da presne zaokruhleny rozmer - protilahly okraj tak ostane na mieste
        const local = rotatePoint(dx, dy, 0, 0, -d.rotation);
        const exact = rotatePoint(
          h.left ? d.box.w - sized.w : h.right ? sized.w - d.box.w : local.x,
          h.top ? d.box.h - sized.h : h.bottom ? sized.h - d.box.h : local.y,
          0,
          0,
          d.rotation,
        );
        resized = resizeRotated(d.box, d.rotation, h, exact.x, exact.y);
      }
      for (const [i, original] of d.originals) changes.set(i, fitTo(original, d.box, resized, 0.001));
    } else {
      if (h.left || h.right) dx = edge("x", h.left ? d.box.x : d.box.x + d.box.w, dx, d.box);
      if (h.top || h.bottom) dy = edge("y", h.top ? d.box.y : d.box.y + d.box.h, dy, d.box);
      for (const [i, original] of d.originals) changes.set(i, fitTo(original, d.box, resizeBox(d.box, h, dx, dy), 0.001));
    }
    setLines(guides.length || gaps.length ? { guides, gaps } : null);
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
      const hits = intersecting(bounds, rect).filter((i) => !elements[i].locked);
      onSelect(m.add ? [...selection, ...hits.filter((i) => !selection.includes(i))] : hits);
      return;
    }
    if (drag.current?.pointer !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    setLines(null);
  };

  const only = selection.length === 1 && !elements[selection[0]]?.locked && bounds[selection[0]] ? elements[selection[0]] : null;
  // jedina vybrana lomena ciara ma uchyty v bodoch namiesto uchytov plochy
  const line = only && isPolyline(only.kind) ? only : null;
  const resizable = only && !line ? boxOf(only) : null;
  /** Poloha uchytu aj s otocenim prvku okolo jeho stredu otocenia (text okolo svojho zaciatku). */
  const handleAt = (h: Handle, b: Box, element: SchemaElementDto): CSSProperties => {
    const style = handleStyle(h, b, scale);
    if (!element.rotation) return style;
    const pivot = rotationCenter(element);
    const turned = rotatePoint(Number(style.left) + 4, Number(style.top) + 4, pivot.x * scale, pivot.y * scale, element.rotation);
    return { ...style, left: turned.x - 4, top: turned.y - 4, cursor: "crosshair" };
  };
  const picture: Box | null = backgroundEdit && background ? { x: background.x, y: background.y, w: background.width, h: background.height } : null;
  const dot = (x: number, y: number, size: number): CSSProperties => ({ left: x * scale - size / 2, top: y * scale - size / 2, width: size, height: size });

  // meranie s Alt: vyber voci prvku pod mysou, inak voci platnu
  const selected = selection.flatMap((i) => (bounds[i] ? [bounds[i]] : []));
  const reach = hover !== undefined && hover !== null && !selection.includes(hover) ? bounds[hover] : hover === undefined ? null : canvas;
  const measured = alt && !dragging && !marquee && selected.length > 0 && reach ? measure(union(selected), reach) : null;
  const gaps = lines?.gaps ?? measured ?? [];
  const grid = view.grid && view.gridStep * scale >= MIN_GRID ? view.gridStep * scale : 0;

  return (
    <div
      ref={root}
      data-schema-canvas
      className="relative shrink-0 touch-none select-none"
      style={{ width: schema.width * scale, height: schema.height * scale }}
      onPointerDown={(e) => {
        if (e.button !== 0 || !root.current || picture) return;
        capture(e);
        const rect = root.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMarquee({ pointer: e.pointerId, add: e.ctrlKey || e.metaKey || e.shiftKey, x0: x, y0: y, x1: x, y1: y });
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerEnter={() => setHover(null)}
      onPointerLeave={() => setHover(undefined)}
      onContextMenu={(e) => {
        // prave tlacidlo na prvok mimo vyberu vyberie len ten prvok, na prazdne miesto vyber zrusi
        const id = e.target instanceof HTMLElement ? e.target.dataset.element : undefined;
        const index = id === undefined ? -1 : elements.findIndex((el) => el.id === Number(id));
        if (index < 0) onSelect([]);
        else if (!selection.includes(index)) onSelect([index]);
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DEVICE_DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        const key = e.dataTransfer.getData(DEVICE_DRAG_TYPE);
        if (!key || !root.current) return;
        e.preventDefault();
        const rect = root.current.getBoundingClientRect();
        onDropDevice(key, (e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
      }}
    >
      <SchemaCanvas schema={shown} live={live} background={background} className="pointer-events-none rounded-none" />
      {grid > 0 && (
        <div
          aria-hidden
          data-grid
          className="pointer-events-none absolute inset-0 text-foreground/15"
          style={{
            backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: `${grid}px ${grid}px`,
          }}
        />
      )}
      {elements.map((element, i) => {
        if (hidden.has(i) || element.locked || picture) return null;
        return (
          <div
            key={element.id}
            data-element={element.id}
            className="absolute cursor-move"
            style={rotated(element, hit(boxOf(element)))}
            onPointerDown={(e) => begin(e, i, null)}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          />
        );
      })}
      {selection.map((i) => {
        const element = elements[i];
        // jedina vybrana lomena ciara ma uchyty v bodoch - ram plochy by len zavadzal
        return bounds[i] && !(line && i === selection[0]) ? (
          <div
            key={element.id}
            className={cn("pointer-events-none absolute border-2", element.locked ? "border-dashed border-muted-foreground" : "border-primary")}
            style={rotated(element, css(boxOf(element)))}
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
      {resizable &&
        HANDLES.map((h, k) => (
          <div
            key={k}
            data-handle={k}
            className="absolute size-2 rounded-xs border border-primary bg-background"
            style={handleAt(h, resizable, only!)}
            onPointerDown={(e) => begin(e, selection[0], h)}
          />
        ))}
      {picture && (
        <>
          <div
            data-picture
            className="absolute cursor-move border-2 border-dashed border-primary"
            style={css(picture)}
            onPointerDown={(e) => beginPicture(e, null)}
          />
          {HANDLES.map((h, k) => (
            <div
              key={k}
              data-picture-handle={k}
              className="absolute size-2 rounded-xs border border-primary bg-background"
              style={handleStyle(h, picture, scale)}
              onPointerDown={(e) => beginPicture(e, h)}
            />
          ))}
        </>
      )}
      {lines?.guides.map((g, k) => (
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
      {measured && reach && <div aria-hidden className="pointer-events-none absolute border border-pink-500" style={css(reach)} />}
      {gaps.map((gap, k) => {
        const start = gap.from * scale;
        const length = (gap.to - gap.from) * scale;
        const at = gap.at * scale;
        return (
          <div
            key={`g${k}`}
            aria-hidden
            data-gap
            className={cn(
              "pointer-events-none absolute flex items-center justify-center border-pink-500",
              gap.axis === "y" ? "border-l border-dashed" : "border-t border-dashed",
            )}
            style={gap.axis === "y" ? { left: at, top: start, height: length, width: 0 } : { left: start, top: at, width: length, height: 0 }}
          >
            <span className="rounded bg-pink-500 px-1 text-[10px] leading-4 font-medium whitespace-nowrap text-white">{number(gap.to - gap.from)}</span>
          </div>
        );
      })}
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
