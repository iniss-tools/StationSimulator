import { describe, expect, test } from "bun:test";
import type { BoardDto, LineDto } from "@/api";
import { blankElement } from "./schema";
import {
  boundsOf,
  boxOf,
  cloneElements,
  common,
  dropPosition,
  fitTo,
  insertPoint,
  moveBy,
  movePoint,
  newDevice,
  newDrawing,
  nextId,
  removePoint,
  resizeBox,
  straighten,
  unplacedDevices,
} from "./schema-edit";

const area = blankElement(1, "area", 10, 20, 100, 50);
const track = {
  ...blankElement(2, "track", 0, 0, 0, 0),
  points: [
    { x: 10, y: 40 },
    { x: 110, y: 60 },
  ],
};

describe("plocha a posun", () => {
  test("plocha prvku: obdlznik, lomena ciara, text", () => {
    expect(boxOf(area)).toEqual({ x: 10, y: 20, w: 100, h: 50 });
    expect(boxOf(track)).toEqual({ x: 10, y: 40, w: 100, h: 20 });
    const text = { ...blankElement(3, "text", 5, 5, 0, 0), text: "Hala", size: 20 };
    expect(boxOf(text).h).toBe(24);
    expect(boxOf(text).w).toBeGreaterThan(20);
  });

  test("posun zaokruhli polohu na krok, lomena ciara si drzi tvar", () => {
    expect(moveBy(area, 3.4, -2.6, 1)).toMatchObject({ x: 13, y: 17 });
    expect(moveBy(area, 3.4, 0, 10)).toMatchObject({ x: 10, y: 20 });
    expect(moveBy(track, 4.6, 1.2, 1).points).toEqual([
      { x: 15, y: 41 },
      { x: 115, y: 61 },
    ]);
  });
});

describe("zmena velkosti", () => {
  const box = { x: 10, y: 20, w: 100, h: 50 };

  test("uchyt hybe len svojimi okrajmi", () => {
    expect(resizeBox(box, { right: true, bottom: true }, 20, 10)).toEqual({ x: 10, y: 20, w: 120, h: 60 });
    expect(resizeBox(box, { left: true, top: true }, 20, 10)).toEqual({ x: 30, y: 30, w: 80, h: 40 });
    expect(resizeBox(box, { top: true }, 30, 10)).toEqual({ x: 10, y: 30, w: 100, h: 40 });
  });

  test("plocha sa nepreklopi a neklesne pod najmensi rozmer", () => {
    expect(resizeBox(box, { left: true }, 500, 0)).toEqual({ x: 106, y: 20, w: 4, h: 50 });
    expect(resizeBox(box, { bottom: true }, 0, -500).h).toBe(4);
  });

  test("lomena ciara sa roztiahne s plochou, text meni velkost pisma", () => {
    const from = boxOf(track);
    expect(fitTo(track, from, { ...from, w: 200, h: 40 }).points).toEqual([
      { x: 10, y: 40 },
      { x: 210, y: 80 },
    ]);
    const text = { ...blankElement(3, "text", 0, 0, 0, 0), text: "Hala", size: 10 };
    expect(fitTo(text, boxOf(text), { ...boxOf(text), h: 24 }).size).toBe(20);
    expect(fitTo(area, boxOf(area), { x: 0, y: 0, w: 55.4, h: 1 })).toMatchObject({ x: 0, y: 0, width: 55, height: 4 });
  });
});

describe("nove prvky", () => {
  test("cisla prvkov pokracuju za najvyssim", () => {
    expect(nextId([])).toBe(1);
    expect(nextId([area, { ...area, id: 7 }])).toBe(8);
    expect(cloneElements([area, track], [area, track], 10, 10).map((e) => e.id)).toEqual([3, 4]);
    expect(cloneElements([{ ...area, locked: true }], [area], 10, 10)[0]).toMatchObject({ x: 20, y: 30, locked: false });
  });

  test("kolaj ma dva body, plocha predvoleny rozmer", () => {
    expect(newDrawing("track", 1, 50, 60, "1").points).toEqual([
      { x: 50, y: 60 },
      { x: 650, y: 60 },
    ]);
    expect(newDrawing("platform", 1, 0, 0)).toMatchObject({ width: 600, height: 28 });
  });

  test("neumiestnene su zariadenia, ktore na scheme nie su", () => {
    const board = (address: number) =>
      ({
        line: 1,
        address,
        profile: { width: 128, rows: 2, rowHeight: 8, akSignal: null },
        display: { amplifier: null, akSignal: null, remoteAudio: null },
      }) as unknown as BoardDto;
    const live = { lines: [{ number: 1 } as LineDto], boards: [board(5), board(6)] };
    const all = unplacedDevices(live, []);
    expect(all.map((d) => `${d.kind}:${d.address ?? ""}`)).toEqual(["commLine:", "board:5", "board:6"]);
    const placed = [newDevice(all[1], 1, 0, 0)];
    expect(unplacedDevices(live, placed).map((d) => `${d.kind}:${d.address ?? ""}`)).toEqual(["commLine:", "board:6"]);
  });

  test("spolocna hodnota vyberu", () => {
    expect(common([1, 1])).toBe(1);
    expect(common([1, 2])).toBeUndefined();
    expect(common([])).toBeUndefined();
  });
});

describe("body lomenej ciary", () => {
  test("presun, vlozenie a odstranenie bodu", () => {
    expect(movePoint(track, 1, 200, 40).points[1]).toEqual({ x: 200, y: 40 });
    const bent = insertPoint(track, 0, 60, 90);
    expect(bent.points.map((p) => p.x)).toEqual([10, 60, 110]);
    expect(removePoint(bent, 1).points).toEqual(track.points);
    expect(removePoint(track, 0)).toBe(track);
  });

  test("bod sa pritiahne do roviny s najblizsim susedom", () => {
    const neighbours = [
      { x: 10, y: 40 },
      { x: 300, y: 200 },
    ];
    expect(straighten(150, 43, neighbours, 5)).toEqual({ x: 150, y: 40 });
    expect(straighten(297, 100, neighbours, 5)).toEqual({ x: 300, y: 100 });
    expect(straighten(150, 100, neighbours, 5)).toEqual({ x: 150, y: 100 });
  });
});

describe("pustenie zariadenia na platno", () => {
  const device = { width: 100, height: 40 };

  test("stred zariadenia je pod kurzorom", () => {
    expect(dropPosition(device, 500.4, 300, 1600, 900)).toEqual([450, 280]);
  });

  test("zariadenie ostane cele na platne", () => {
    expect(dropPosition(device, 10, 5, 1600, 900)).toEqual([0, 0]);
    expect(dropPosition(device, 1590, 895, 1600, 900)).toEqual([1500, 860]);
    expect(dropPosition({ width: 2000, height: 40 }, 800, 100, 1600, 900)).toEqual([0, 80]);
  });
});

describe("otoceny prvok", () => {
  test("bez otocenia je plocha rovnaka, lomena ciara sa neotaca", () => {
    expect(boundsOf(area)).toEqual(boxOf(area));
    expect(boundsOf({ ...track, rotation: 45 })).toEqual(boxOf(track));
  });

  test("otocenie o 90 stupnov vymeni sirku a vysku okolo stredu", () => {
    // plocha 100 x 50 so stredom (60, 45)
    expect(boundsOf({ ...area, rotation: 90 })).toEqual({ x: 35, y: -5, w: 50, h: 100 });
  });

  test("sikme otocenie zvacsi plochu na obe strany rovnako", () => {
    const bounds = boundsOf({ ...area, rotation: 45 });
    expect(bounds.w).toBeCloseTo(106.066, 2);
    expect(bounds.h).toBeCloseTo(106.066, 2);
    expect(bounds.x + bounds.w / 2).toBeCloseTo(60, 2);
    expect(bounds.y + bounds.h / 2).toBeCloseTo(45, 2);
  });
});
