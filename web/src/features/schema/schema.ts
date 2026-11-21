// Schema stanice: ciste funkcie - zariadenie prvku v stave simulatora, jeho stav na scheme a navrh rozmiestnenia.
import type { AnnouncementDto, BoardDto, LineDto, RemoteQueueDto, SchemaElementDto, SchemaElementKind, StationSchemaDto, StationSchemaRequest } from "@/api";
import { accessKey } from "@/api/auth";

/** Predvolene krytie obrazka pozadia. */
export const DEFAULT_OPACITY = 0.5;

/** Obrazok pozadia na platne: adresa (s verziou kvoli vyrovnavacej pamati), krytie a plocha, do ktorej sa kresli. */
export interface SchemaBackground {
  href: string;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Umiestnenie obrazka pozadia v scheme (cast definicie schemy). */
export type BackgroundPlacement = Pick<
  StationSchemaRequest,
  "width" | "height" | "backgroundOpacity" | "backgroundX" | "backgroundY" | "backgroundWidth" | "backgroundHeight"
>;

/** Plocha obrazka pozadia: nulovy rozmer = cele platno. */
export function backgroundBox(p: BackgroundPlacement): { x: number; y: number; width: number; height: number } {
  return p.backgroundWidth > 0 && p.backgroundHeight > 0
    ? { x: p.backgroundX, y: p.backgroundY, width: p.backgroundWidth, height: p.backgroundHeight }
    : { x: 0, y: 0, width: p.width, height: p.height };
}

/** Adresa obrazka pozadia ulozenej schemy; null = schema ho nema. */
export function backgroundHref(schema: Pick<StationSchemaDto, "id" | "background">): string | null {
  if (!schema.background) return null;
  // obrazok nacita prehliadac bez hlavicky - zariadenie s klucom ho posle v adrese
  const key = accessKey();
  const query = new URLSearchParams({ v: schema.background, ...(key ? { access_token: key } : {}) });
  return `/api/schemas/${schema.id}/background?${query.toString()}`;
}

/** Obrazok pozadia na adrese href s umiestnenim podla schemy; null = bez obrazka. */
export function backgroundAt(href: string | null, placement: BackgroundPlacement): SchemaBackground | null {
  return href ? { href, opacity: placement.backgroundOpacity, ...backgroundBox(placement) } : null;
}

/** Obrazok pozadia ulozenej schemy; null = schema ho nema. */
export const backgroundOf = (schema: StationSchemaDto) => backgroundAt(backgroundHref(schema), schema);

/** Definicia schemy (telo ulozenia, subor exportu) - len jej vlastnosti, bez cisla, verzie obrazka a pracovnych udajov editora. */
export function toRequest(schema: StationSchemaRequest): StationSchemaRequest {
  return {
    name: schema.name,
    width: schema.width,
    height: schema.height,
    elements: schema.elements,
    backgroundOpacity: schema.backgroundOpacity,
    backgroundX: schema.backgroundX,
    backgroundY: schema.backgroundY,
    backgroundWidth: schema.backgroundWidth,
    backgroundHeight: schema.backgroundHeight,
  };
}

/** Predvolene umiestnenie obrazka: cele platno. */
export const DEFAULT_BACKGROUND = { backgroundOpacity: DEFAULT_OPACITY, backgroundX: 0, backgroundY: 0, backgroundWidth: 0, backgroundHeight: 0 };

/** Druhy prvkov, ktore su zariadenia simulatora. */
export const DEVICE_KINDS: readonly SchemaElementKind[] = ["board", "audio", "light", "amplifier", "commLine"];

export const isDevice = (kind: SchemaElementKind) => DEVICE_KINDS.includes(kind);

/** Lomena ciara urcena bodmi. */
export const isPolyline = (kind: SchemaElementKind) => kind === "track" || kind === "path";

/**
 * Stav prvku na scheme: ok = v poriadku a v pokoji, active = prave pracuje (hra, svieti, zopnuty), bad = porucha
 * alebo vypadok, off = vypnute, missing = zariadenie v simulatore nie je.
 */
export type ElementTone = "ok" | "active" | "bad" | "off" | "missing";

/** Preco je prvok v danom stave - kluc textu rozhrania je `schema.state.<reason>`. */
export type ElementReason =
  | "ok"
  | "missing"
  | "poweredOff"
  | "fault"
  | "mismatch"
  | "lit"
  | "dark"
  | "lightsFault"
  | "playing"
  | "silent"
  | "queueOff"
  | "switched"
  | "idle"
  | "connected"
  | "listening"
  | "outage"
  | "stopped";

export interface ElementState {
  tone: ElementTone;
  reason: ElementReason;
  /** Hlasenie, ktore okruh prave hra. */
  playing?: AnnouncementDto;
}

export interface SchemaLive {
  lines: LineDto[];
  boards: BoardDto[];
}

/** Zariadenie prvku - tabula, ustredna alebo zosilnovac na linke a adrese (aj druha adresa panelu). */
export function boardOf(element: SchemaElementDto, boards: BoardDto[]): BoardDto | undefined {
  if (element.line === null || element.address === null) return undefined;
  return boards.find((b) => b.line === element.line && (b.address === element.address || b.secondAddress === element.address));
}

export const lineOf = (element: SchemaElementDto, lines: LineDto[]) => lines.find((l) => l.number === element.line);

const MISSING: ElementState = { tone: "missing", reason: "missing" };

function boardState(board: BoardDto): ElementState {
  if (board.poweredOff) return { tone: "off", reason: "poweredOff" };
  if (board.fault.kind !== "none") return { tone: "bad", reason: "fault" };
  return board.mismatch ? { tone: "bad", reason: "mismatch" } : { tone: "ok", reason: "ok" };
}

function lightState(element: SchemaElementDto, board: BoardDto): ElementState {
  const state = board.display.akSignal;
  if (!state) return MISSING;
  const lights = board.profile.akSignal?.lights ?? [];
  if (element.circuit && !lights.some((l) => l.name === element.circuit)) return MISSING;
  if (state.conditions.lightsFault) return { tone: "bad", reason: "lightsFault" };
  // ustredna spina vsetky svetla naraz - okruhy sa lisia len nazvom
  return state.lightOn ? { tone: "active", reason: "lit" } : { tone: "ok", reason: "dark" };
}

function audioState(element: SchemaElementDto, board: BoardDto): ElementState {
  const idle: ElementState = { tone: "ok", reason: "silent" };
  const remote = board.display.remoteAudio;
  if (remote) {
    const queues = element.circuit ? remote.queues.filter((q) => q.name === element.circuit) : remote.queues;
    if (element.circuit && !queues.length) return MISSING;
    const playing = queues.find((q) => q.playing)?.playing;
    if (playing) return { tone: "active", reason: "playing", playing };
    return queues.length > 0 && queues.every((q) => q.off) ? { tone: "off", reason: "queueOff" } : idle;
  }
  const state = board.display.akSignal;
  if (!state) return MISSING;
  const now = state.announcements.filter((a) => a.result === "playing");
  if (!element.circuit) return now.length ? { tone: "active", reason: "playing", playing: now[0] } : idle;
  const audio = board.profile.akSignal?.audio.find((a) => a.name === element.circuit);
  if (!audio) return MISSING;
  // AKSIGNAL ma jediny rozhlas, AKSIGNALUH kanaly 1 a 2 - audio linka hra, ked hra jej kanal
  const uh = board.manufacturer.toUpperCase() === "AKSIGNALUH";
  const playing = now.find((a) => !uh || a.channel === audio.channel);
  return playing ? { tone: "active", reason: "playing", playing } : idle;
}

/** Fronty rozhlasu vzdialeneho INISSu, ktore prvok ukazuje a prave hraju (da sa v nich prerusit hlasenie). */
export function playingQueues(element: SchemaElementDto, board: BoardDto): RemoteQueueDto[] {
  const queues = board.display.remoteAudio?.queues ?? [];
  return queues.filter((q) => q.playing && (!element.circuit || q.name === element.circuit));
}

function lineState(line: LineDto): ElementState {
  if (line.status === "connected") return { tone: "ok", reason: "connected" };
  if (line.status === "listening") return { tone: "ok", reason: "listening" };
  // vypadok INISSu (odpojil sa, linka nebezi) aj vypadok zo scenara
  return line.status === "stopped" ? { tone: "off", reason: "stopped" } : { tone: "bad", reason: "outage" };
}

/** Stav zariadenia prvku podla ziveho stavu simulatora; kresba je vzdy v poriadku. */
export function elementState(element: SchemaElementDto, live: SchemaLive): ElementState {
  if (!isDevice(element.kind)) return { tone: "ok", reason: "ok" };
  if (element.kind === "commLine") {
    const line = lineOf(element, live.lines);
    return line ? lineState(line) : MISSING;
  }
  const board = boardOf(element, live.boards);
  if (!board) return MISSING;
  if (board.poweredOff) return { tone: "off", reason: "poweredOff" };
  switch (element.kind) {
    case "light":
      return lightState(element, board);
    case "audio":
      return audioState(element, board);
    case "amplifier":
      if (!board.display.amplifier) return MISSING;
      return board.display.amplifier.band > 0 ? { tone: "active", reason: "switched" } : { tone: "ok", reason: "idle" };
    default:
      return boardState(board);
  }
}

/** Popis prvku: vlastny text, inak okruh alebo nazov zariadenia. */
export function elementLabel(element: SchemaElementDto, live: SchemaLive): string {
  if (element.text) return element.text;
  if (element.kind === "commLine") return lineOf(element, live.lines)?.name || String(element.line ?? "");
  if (element.circuit) return element.circuit;
  const board = boardOf(element, live.boards);
  return board?.name || (element.line !== null && element.address !== null ? `${element.line}-${element.address}` : "");
}

/** Co hlasenie hlasi - titulok, inak nahravky. */
export const announcementText = (a: AnnouncementDto) => a.title || a.sounds.join(" · ");

/** Prvok s predvolenymi hodnotami. */
export const blankElement = (id: number, kind: SchemaElementKind, x: number, y: number, width: number, height: number): SchemaElementDto => ({
  id,
  kind,
  x,
  y,
  width,
  height,
  rotation: 0,
  points: [],
  text: "",
  size: 0,
  color: "",
  fill: "",
  stroke: 0,
  line: null,
  address: null,
  circuit: "",
  view: "live",
  locked: false,
});

const MARGIN = 40;
const GAP = 16;
const LABEL = 28;
const CIRCUIT = 44;

/** Velkost tabule na scheme: sirka podla bodov tabule v rozumnych medziach, vyska podla pomeru stran. */
function boardSize(board: BoardDto): [width: number, height: number] {
  const width = Math.min(360, Math.max(160, board.profile.width * 1.5));
  const ratio = (board.profile.rows * board.profile.rowHeight) / Math.max(1, board.profile.width);
  return [width, Math.min(160, Math.max(36, width * ratio + 12))];
}

/** Zariadenie, ktore sa da dat na schemu: druh prvku, vazba a navrhovana velkost. */
export interface DeviceCandidate {
  kind: SchemaElementKind;
  line: number;
  address: number | null;
  circuit: string;
  width: number;
  height: number;
}

/** Kluc vazby prvku na zariadenie - rovnaky maju prvok schemy a jeho kandidat. */
export const deviceKey = (e: Pick<SchemaElementDto, "kind" | "line" | "address" | "circuit">) => `${e.kind}|${e.line ?? ""}|${e.address ?? ""}|${e.circuit}`;

/** Zariadenia jednej linky zlava doprava: tabule, zosilnovace, okruhy osvetlenia a rozhlasu ustredni (bez stavu linky). */
function lineDevices(line: number, boards: BoardDto[]): DeviceCandidate[] {
  const found: DeviceCandidate[] = [];
  const add = (kind: SchemaElementKind, board: BoardDto, width: number, height: number, circuit = "") =>
    found.push({ kind, line: board.line, address: board.address, circuit, width, height });
  for (const board of boards.filter((b) => b.line === line).sort((a, b) => a.address - b.address)) {
    const display = board.display;
    if (display.amplifier) add("amplifier", board, 120, CIRCUIT);
    else if (display.remoteAudio) {
      if (display.remoteAudio.queues.length) for (const queue of display.remoteAudio.queues) add("audio", board, 160, CIRCUIT, queue.name);
      else add("audio", board, 160, CIRCUIT);
    } else if (display.akSignal) {
      const profile = board.profile.akSignal;
      if (profile?.lights.length) for (const light of profile.lights) add("light", board, 200, CIRCUIT, light.name);
      else add("light", board, 200, CIRCUIT);
      if (profile?.audio.length) for (const audio of profile.audio) add("audio", board, 160, CIRCUIT, audio.name);
      else add("audio", board, 160, CIRCUIT);
    } else add("board", board, ...boardSize(board));
  }
  return found;
}

/** Vsetky zariadenia, ktore simulator pozna, v poradi liniek: stav linky a za nim jej zariadenia. */
export function deviceCandidates(live: SchemaLive): DeviceCandidate[] {
  return [...live.lines]
    .sort((a, b) => a.number - b.number)
    .flatMap((line) => [
      { kind: "commLine" as const, line: line.number, address: null, circuit: "", width: 220, height: LABEL },
      ...lineDevices(line.number, live.boards),
    ]);
}

/**
 * Navrh schemy zo stanice v simulatore: kazda linka ma riadok so stavom linky a svojimi zariadeniami zlava doprava
 * (tabule, zosilnovace, okruhy osvetlenia a rozhlasu ustredni), riadok sa pri sirke platna zalomi.
 */
export function autoLayout(name: string, live: SchemaLive, width = 1600): StationSchemaRequest {
  const elements: SchemaElementDto[] = [];
  let id = 1;
  let y = MARGIN;
  let x = MARGIN;
  let rowHeight = 0;
  for (const device of deviceCandidates(live)) {
    const { kind, line, address, circuit, width: w, height: h } = device;
    if (kind === "commLine") {
      // nova linka zacina novy blok: stav linky a pod nim rad zariadeni
      if (elements.length) y += rowHeight + GAP * 2;
      elements.push({ ...blankElement(id++, kind, MARGIN, y, w, h), line });
      y += h + GAP;
      x = MARGIN;
      rowHeight = 0;
      continue;
    }
    if (x > MARGIN && x + w > width - MARGIN) {
      x = MARGIN;
      y += rowHeight + GAP;
      rowHeight = 0;
    }
    elements.push({ ...blankElement(id++, kind, x, y, w, h), line, address, circuit });
    x += w + GAP;
    rowHeight = Math.max(rowHeight, h);
  }
  return { name, width, height: Math.min(20000, Math.max(400, y + rowHeight + MARGIN)), elements, ...DEFAULT_BACKGROUND };
}
