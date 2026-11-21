import { describe, expect, test } from "bun:test";
import type { AnnouncementDto, BoardDto, LineDto, SchemaElementDto, SchemaElementKind } from "@/api";
import { autoLayout, backgroundAt, backgroundBox, boardOf, elementLabel, elementState, toRequest } from "./schema";

const element = (kind: SchemaElementKind, patch: Partial<SchemaElementDto> = {}): SchemaElementDto => ({
  id: 1,
  kind,
  x: 0,
  y: 0,
  width: 100,
  height: 30,
  rotation: 0,
  points: [],
  text: "",
  size: 0,
  color: "",
  fill: "",
  stroke: 0,
  line: 1,
  address: 5,
  circuit: "",
  view: "live",
  locked: false,
  ...patch,
});

const board = (patch: object = {}, display: object = {}, profile: object = {}): BoardDto =>
  ({
    id: "1-5",
    line: 1,
    address: 5,
    name: "Hala",
    manufacturer: "ELEN10",
    secondAddress: null,
    poweredOff: false,
    mismatch: null,
    fault: { kind: "none", delayMs: 0, status: 0 },
    profile: { width: 128, rows: 4, rowHeight: 8, akSignal: null, ...profile },
    display: { family: "elen", amplifier: null, akSignal: null, remoteAudio: null, ...display },
    ...patch,
  }) as unknown as BoardDto;

const line = (number: number, status: LineDto["status"] = "connected"): LineDto => ({ number, name: `L${number}`, status }) as unknown as LineDto;

const announcement = (channel: number, result: AnnouncementDto["result"] = "playing"): AnnouncementDto =>
  ({ id: channel, channel, sounds: ["a", "b"], result, title: null }) as unknown as AnnouncementDto;

const akSignal = (state: object, manufacturer = "AKSIGNALUH") =>
  board(
    { manufacturer, address: 0, name: "Ustredna" },
    { family: "aksignal", akSignal: { lightOn: false, announcements: [], conditions: { lightsFault: false }, ...state } },
    {
      akSignal: {
        lights: [{ name: "Nastupiste 1" }],
        audio: [
          { name: "Hala", channel: 1 },
          { name: "Peron", channel: 2 },
        ],
      },
    },
  );

describe("stav prvku", () => {
  test("kresba je vzdy v poriadku", () => {
    expect(elementState(element("platform", { line: null, address: null }), { lines: [], boards: [] }).tone).toBe("ok");
  });

  test("tabula: chyba v simulatore, porucha, vypnute napajanie", () => {
    const e = element("board");
    expect(elementState(e, { lines: [], boards: [] }).reason).toBe("missing");
    expect(elementState(e, { lines: [], boards: [board()] }).reason).toBe("ok");
    expect(elementState(e, { lines: [], boards: [board({ fault: { kind: "nak" } })] })).toEqual({ tone: "bad", reason: "fault" });
    expect(elementState(e, { lines: [], boards: [board({ poweredOff: true })] })).toEqual({ tone: "off", reason: "poweredOff" });
  });

  test("tabula sa najde aj podla druhej adresy panelu", () => {
    expect(boardOf(element("board", { address: 6 }), [board({ secondAddress: 6 })])?.id).toBe("1-5");
  });

  test("osvetlenie svieti podla ustredne, neznamy okruh chyba", () => {
    const e = element("light", { address: 0, circuit: "Nastupiste 1" });
    expect(elementState(e, { lines: [], boards: [akSignal({ lightOn: true })] })).toEqual({ tone: "active", reason: "lit" });
    expect(elementState(e, { lines: [], boards: [akSignal({})] }).reason).toBe("dark");
    expect(elementState(e, { lines: [], boards: [akSignal({ lightOn: true, conditions: { lightsFault: true } })] }).reason).toBe("lightsFault");
    expect(elementState({ ...e, circuit: "Ine" }, { lines: [], boards: [akSignal({ lightOn: true })] }).reason).toBe("missing");
  });

  test("audio linka AKSIGNALUH hra len na svojom kanali", () => {
    const boards = [akSignal({ announcements: [announcement(2), announcement(1, "completed")] })];
    expect(elementState(element("audio", { address: 0, circuit: "Hala" }), { lines: [], boards }).reason).toBe("silent");
    const peron = elementState(element("audio", { address: 0, circuit: "Peron" }), { lines: [], boards });
    expect(peron.reason).toBe("playing");
    expect(peron.playing?.channel).toBe(2);
    expect(elementState(element("audio", { address: 0 }), { lines: [], boards }).reason).toBe("playing");
  });

  test("AKSIGNAL ma jediny rozhlas pre vsetky audio linky", () => {
    const boards = [akSignal({ announcements: [announcement(0)] }, "AKSIGNAL")];
    expect(elementState(element("audio", { address: 0, circuit: "Hala" }), { lines: [], boards }).reason).toBe("playing");
  });

  test("fronta vzdialeneho INISSu: hra, vypnuta, neznama", () => {
    const queues = [
      { name: "A", off: false, playing: announcement(1) },
      { name: "B", off: true, playing: null },
    ];
    const boards = [board({ address: 0 }, { family: "remoteaudio", remoteAudio: { queues, announcements: [] } })];
    expect(elementState(element("audio", { address: 0, circuit: "A" }), { lines: [], boards }).reason).toBe("playing");
    expect(elementState(element("audio", { address: 0, circuit: "B" }), { lines: [], boards })).toEqual({ tone: "off", reason: "queueOff" });
    expect(elementState(element("audio", { address: 0, circuit: "C" }), { lines: [], boards }).reason).toBe("missing");
  });

  test("zosilnovac a linka", () => {
    const amp = (band: number) => [board({}, { family: "amplifier", amplifier: { band } })];
    expect(elementState(element("amplifier"), { lines: [], boards: amp(1) })).toEqual({ tone: "active", reason: "switched" });
    expect(elementState(element("amplifier"), { lines: [], boards: amp(0) }).reason).toBe("idle");
    const e = element("commLine", { address: null });
    expect(elementState(e, { lines: [line(1)], boards: [] }).reason).toBe("connected");
    expect(elementState(e, { lines: [line(1, "lost")], boards: [] })).toEqual({ tone: "bad", reason: "outage" });
    expect(elementState(e, { lines: [line(1, "stopped")], boards: [] }).tone).toBe("off");
    expect(elementState(e, { lines: [], boards: [] }).reason).toBe("missing");
  });
});

describe("popis prvku", () => {
  test("vlastny text, okruh, nazov zariadenia, adresa", () => {
    const live = { lines: [line(1)], boards: [board()] };
    expect(elementLabel(element("board", { text: "Vlastny" }), live)).toBe("Vlastny");
    expect(elementLabel(element("light", { circuit: "Okruh" }), live)).toBe("Okruh");
    expect(elementLabel(element("board"), live)).toBe("Hala");
    expect(elementLabel(element("board", { address: 9 }), live)).toBe("1-9");
    expect(elementLabel(element("commLine"), live)).toBe("L1");
  });
});

describe("navrh rozmiestnenia", () => {
  test("kazda linka ma stav a svoje zariadenia, cisla prvkov su jedinecne", () => {
    const live = { lines: [line(2), line(1)], boards: [board(), board({ id: "1-6", address: 6 }), { ...akSignal({}), line: 2 }] };
    const schema = autoLayout("Stanica", live);
    const kinds = schema.elements.map((e) => `${e.kind}:${e.line}:${e.address ?? ""}:${e.circuit}`);
    expect(kinds).toEqual(["commLine:1::", "board:1:5:", "board:1:6:", "commLine:2::", "light:2:0:Nastupiste 1", "audio:2:0:Hala", "audio:2:0:Peron"]);
    expect(new Set(schema.elements.map((e) => e.id)).size).toBe(schema.elements.length);
    expect(schema.elements.every((e) => e.x >= 0 && e.x + e.width <= schema.width && e.y + e.height <= schema.height)).toBe(true);
  });

  test("dlhy rad sa zalomi do sirky platna", () => {
    const boards = Array.from({ length: 12 }, (_, i) => board({ id: `1-${i}`, address: i }));
    const schema = autoLayout("Stanica", { lines: [line(1)], boards }, 800);
    expect(schema.elements.every((e) => e.x + e.width <= 800)).toBe(true);
    expect(new Set(schema.elements.filter((e) => e.kind === "board").map((e) => e.y)).size).toBeGreaterThan(1);
  });
});

describe("obrazok pozadia", () => {
  const placement = { width: 1600, height: 800, backgroundOpacity: 0.4, backgroundX: 0, backgroundY: 0, backgroundWidth: 0, backgroundHeight: 0 };

  test("bez vlastnej plochy zabera cele platno", () => {
    expect(backgroundBox(placement)).toEqual({ x: 0, y: 0, width: 1600, height: 800 });
    expect(backgroundBox({ ...placement, backgroundX: 50, backgroundWidth: 300 })).toEqual({ x: 0, y: 0, width: 1600, height: 800 });
  });

  test("vlastna plocha ma polohu aj rozmer", () => {
    const placed = { ...placement, backgroundX: -20, backgroundY: 30, backgroundWidth: 900, backgroundHeight: 450 };
    expect(backgroundBox(placed)).toEqual({ x: -20, y: 30, width: 900, height: 450 });
    expect(backgroundAt("/obrazok", placed)).toEqual({ href: "/obrazok", opacity: 0.4, x: -20, y: 30, width: 900, height: 450 });
    expect(backgroundAt(null, placed)).toBeNull();
  });

  test("definicia schemy je bez pracovnych udajov editora", () => {
    const draft = { name: "S", elements: [], ...placement, image: "remove", id: 5, background: "abc" };
    expect(Object.keys(toRequest(draft)).sort()).toEqual(
      ["backgroundHeight", "backgroundOpacity", "backgroundWidth", "backgroundX", "backgroundY", "elements", "height", "name", "width"].sort(),
    );
  });
});
