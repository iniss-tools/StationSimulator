// Uprava schemy stanice: plocha prvku, posun, zmena velkosti, nove prvky a zariadenia, ktore este na scheme nie su.
// Ciste funkcie - testy. Vsetko v jednotkach platna.
import type { SchemaElementDto, SchemaElementKind } from "@/api";
import { snap } from "@/components/editor/step";
import type { Box } from "@/render/face";
import { blankElement, deviceCandidates, deviceKey, isDevice, isPolyline, type DeviceCandidate, type SchemaLive } from "./schema";

/** Predvolena velkost pisma (ako pri kresleni). */
const FONT = 14;

/** Najmensi rozmer plochy. */
export const MIN_SIZE = 4;

/** Uchyt zmeny velkosti: ktore okraje plochy sa hybu. */
export interface Handle {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
}

/** Uchyty v rohoch a na stranach. */
export const HANDLES: Handle[] = [
  { left: true, top: true },
  { top: true },
  { right: true, top: true },
  { right: true },
  { right: true, bottom: true },
  { bottom: true },
  { left: true, bottom: true },
  { left: true },
];

/** Plocha, ktoru prvok zabera (bez otocenia): lomena ciara podla bodov, text odhadom podla dlzky a velkosti pisma. */
export function boxOf(element: SchemaElementDto): Box {
  if (isPolyline(element.kind) && element.points.length) {
    const xs = element.points.map((p) => p.x);
    const ys = element.points.map((p) => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }
  if (element.kind === "text") {
    const size = element.size || FONT;
    return { x: element.x, y: element.y, w: Math.max(size, element.text.length * size * 0.56), h: size * 1.2 };
  }
  return { x: element.x, y: element.y, w: element.width, h: element.height };
}

/** Prvok posunuty o (dx, dy); poloha sa zaokruhli na krok. */
export function moveBy(element: SchemaElementDto, dx: number, dy: number, step = 1): SchemaElementDto {
  if (isPolyline(element.kind)) {
    // lomena ciara sa hybe cela - zaokruhli sa posun, tvar ostane
    const box = boxOf(element);
    const sx = snap(box.x + dx, step) - box.x;
    const sy = snap(box.y + dy, step) - box.y;
    return { ...element, points: element.points.map((p) => ({ x: snap(p.x + sx, 0.001), y: snap(p.y + sy, 0.001) })) };
  }
  return { ...element, x: snap(element.x + dx, step), y: snap(element.y + dy, step) };
}

/** Plocha po potiahnuti uchytu o (dx, dy); neklesne pod najmensi rozmer a nepreklopi sa. */
export function resizeBox(box: Box, handle: Handle, dx: number, dy: number): Box {
  let { x, y, w, h } = box;
  if (handle.left) {
    const d = Math.min(dx, w - MIN_SIZE);
    x += d;
    w -= d;
  } else if (handle.right) w = Math.max(MIN_SIZE, w + dx);
  if (handle.top) {
    const d = Math.min(dy, h - MIN_SIZE);
    y += d;
    h -= d;
  } else if (handle.bottom) h = Math.max(MIN_SIZE, h + dy);
  return { x, y, w, h };
}

/** Prvok roztiahnuty z plochy from do plochy to: plocha meni rozmer, lomena ciara body, text velkost pisma. */
export function fitTo(element: SchemaElementDto, from: Box, to: Box, step = 1): SchemaElementDto {
  const round = (value: number) => snap(value, step);
  if (isPolyline(element.kind)) {
    const fx = from.w > 0 ? to.w / from.w : 1;
    const fy = from.h > 0 ? to.h / from.h : 1;
    return { ...element, points: element.points.map((p) => ({ x: round(to.x + (p.x - from.x) * fx), y: round(to.y + (p.y - from.y) * fy) })) };
  }
  if (element.kind === "text") {
    const size = element.size || FONT;
    return { ...element, x: round(to.x), y: round(to.y), size: Math.max(4, snap((size * to.h) / Math.max(1, from.h), 0.5)) };
  }
  return { ...element, x: round(to.x), y: round(to.y), width: Math.max(MIN_SIZE, round(to.w)), height: Math.max(MIN_SIZE, round(to.h)) };
}

/** Najmensie volne cislo prvku. */
export const nextId = (elements: readonly SchemaElementDto[]) => elements.reduce((max, e) => Math.max(max, e.id), 0) + 1;

/** Druhy kresby v poradi ponuky Pridat. */
export const DRAWING_KINDS: SchemaElementKind[] = ["track", "platform", "building", "area", "path", "text"];

const DRAWING_SIZES: Partial<Record<SchemaElementKind, [width: number, height: number]>> = {
  platform: [600, 28],
  building: [300, 80],
  area: [200, 120],
};

/** Nova kresba s lavym hornym rohom v bode (x, y); text dostane predvoleny napis. */
export function newDrawing(kind: SchemaElementKind, id: number, x: number, y: number, text = ""): SchemaElementDto {
  if (isPolyline(kind)) {
    return {
      ...blankElement(id, kind, 0, 0, 0, 0),
      points: [
        { x, y },
        { x: x + 600, y },
      ],
      text,
    };
  }
  const [width, height] = DRAWING_SIZES[kind] ?? [0, 0];
  return { ...blankElement(id, kind, x, y, width, height), text };
}

/** Novy prvok zariadenia podla kandidata s lavym hornym rohom v bode (x, y). */
export function newDevice(device: DeviceCandidate, id: number, x: number, y: number): SchemaElementDto {
  return { ...blankElement(id, device.kind, x, y, device.width, device.height), line: device.line, address: device.address, circuit: device.circuit };
}

/** Zariadenia simulatora, ktore na scheme este nie su. */
export function unplacedDevices(live: SchemaLive, elements: readonly SchemaElementDto[]): DeviceCandidate[] {
  const placed = new Set(elements.filter((e) => isDevice(e.kind)).map(deviceKey));
  return deviceCandidates(live).filter((d) => !placed.has(deviceKey(d)));
}

/** Kopie prvkov s novymi cislami, posunute o (dx, dy) a odomknute - vlozenie zo schranky a duplikat. */
export function cloneElements(source: readonly SchemaElementDto[], existing: readonly SchemaElementDto[], dx: number, dy: number): SchemaElementDto[] {
  let id = nextId(existing);
  return source.map((e) => ({ ...moveBy(e, dx, dy, 0.001), id: id++, locked: false }));
}

/** Spolocna hodnota vybranych prvkov; undefined = lisia sa (pole ukaze "Rozne"). */
export function common<T>(values: readonly T[]): T | undefined {
  return values.length > 0 && values.every((v) => v === values[0]) ? values[0] : undefined;
}

/** Lomena ciara s bodom index presunutym na (x, y). */
export function movePoint(element: SchemaElementDto, index: number, x: number, y: number): SchemaElementDto {
  return { ...element, points: element.points.map((p, i) => (i === index ? { x, y } : p)) };
}

/** Lomena ciara s novym bodom (x, y) za bodom after. */
export function insertPoint(element: SchemaElementDto, after: number, x: number, y: number): SchemaElementDto {
  return { ...element, points: [...element.points.slice(0, after + 1), { x, y }, ...element.points.slice(after + 1)] };
}

/** Lomena ciara bez bodu index; dva body ostanu vzdy. */
export function removePoint(element: SchemaElementDto, index: number): SchemaElementDto {
  return element.points.length <= 2 ? element : { ...element, points: element.points.filter((_, i) => i !== index) };
}

/**
 * Bod pritiahnuty do roviny so susedom: ak je od neho na osi blizsie nez reach, prevezme jeho suradnicu - useky
 * kolaje tak ostavaju vodorovne a zvisle.
 */
export function straighten(x: number, y: number, neighbours: readonly { x: number; y: number }[], reach: number): { x: number; y: number } {
  let nx = x;
  let ny = y;
  let bestX = reach;
  let bestY = reach;
  for (const n of neighbours) {
    if (Math.abs(n.x - x) <= bestX) {
      bestX = Math.abs(n.x - x);
      nx = n.x;
    }
    if (Math.abs(n.y - y) <= bestY) {
      bestY = Math.abs(n.y - y);
      ny = n.y;
    }
  }
  return { x: nx, y: ny };
}
