// Snimky clanku Schema stanice: schema ukazkovej stanice (budova, nastupistia, kolaje, tabule, zosilnovace a stav
// liniek), detail tabule a editor. Schemu si subor zalozi sam cez API a na konci ju odstrani - ostatne snimky sa nemenia.
import { join } from "node:path";
import { expect, request, test } from "@playwright/test";
import { API_HEADERS } from "../e2e/helpers";
import type { BoardDto, SchemaElementDto, SchemaElementKind, StateDto, StationSchemaDto, StationSchemaRequest } from "../src/api/generated/types.gen";
import { open, shot, THEMES } from "./shoot";
import { DOCSHOTS_SERVER } from "./server";

const NAME = "Dolné Mesto";
let nextId = 1;

const element = (kind: SchemaElementKind, x: number, y: number, width: number, height: number, patch: Partial<SchemaElementDto> = {}): SchemaElementDto => ({
  id: nextId++,
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
  ...patch,
});

const track = (number: string, y: number) =>
  element("track", 0, 0, 0, 0, {
    text: number,
    points: [
      { x: 40, y },
      { x: 1560, y },
    ],
  });

const device = (kind: SchemaElementKind, board: BoardDto, x: number, y: number, width: number, height: number) =>
  element(kind, x, y, width, height, { line: board.line, address: board.address });

/** Schema ukazkovej stanice: tabule podla liniek na svojich miestach v stanici. */
function demoSchema(boards: BoardDto[]): StationSchemaRequest {
  const on = (line: number) => boards.filter((b) => b.line === line).sort((a, b) => a.address - b.address);
  const [departures, arrivals] = on(1);
  const [platform1, platform2] = on(2);
  const [underpass] = on(3);
  const [flaps] = on(4);
  const [vestibule] = on(5);
  const amplifiers = on(6);
  nextId = 1;
  const elements: SchemaElementDto[] = [
    element("building", 440, 30, 720, 170, { locked: true }),
    element("platform", 100, 262, 1400, 34, { text: "1. nástupište" }),
    track("1", 318),
    track("2", 350),
    element("platform", 100, 372, 1400, 34, { text: "2. nástupište" }),
    track("3", 492),
    track("4", 524),
    element("area", 700, 560, 200, 150, { text: "Podchod" }),
    device("board", departures, 470, 70, 300, 96),
    device("board", arrivals, 830, 70, 300, 80),
    device("board", flaps, 60, 60, 340, 110),
    device("board", vestibule, 1200, 70, 340, 90),
    device("board", platform1, 640, 206, 320, 50),
    device("board", platform2, 640, 418, 320, 50),
    device("board", underpass, 930, 590, 360, 96),
    ...amplifiers.map((a, i) => device("amplifier", a, 60, 590 + i * 56, 240, 44)),
    ...[1, 2, 3, 4, 5, 6].map((line, i) => element("commLine", 60 + i * 250, 740, 236, 28, { line })),
    // napis budovy nad nou - v budove by ho prekryli tabule haly
    element("text", 440, 6, 0, 0, { text: "Prijímacia budova", size: 16 }),
  ];
  return { name: NAME, width: 1600, height: 800, elements, backgroundOpacity: 0.5, backgroundX: 0, backgroundY: 0, backgroundWidth: 0, backgroundHeight: 0 };
}

/** Cisla prvkov ukazkovej schemy, na ktore snimky ukazuju (poradie v demoSchema). */
const PLATFORM_1 = 2;
const PLATFORM_2_BOARD = 14;

let schemaId = 0;

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: DOCSHOTS_SERVER.url, extraHTTPHeaders: API_HEADERS });
  const state = (await (await api.get("/api/state")).json()) as StateDto;
  const response = await api.post("/api/schemas", { data: demoSchema(state.boards) });
  if (!response.ok()) throw new Error(`Schema: ${response.status()} ${await response.text()}`);
  schemaId = ((await response.json()) as StationSchemaDto).id;
  await api.dispose();
});

test.afterAll(async () => {
  const api = await request.newContext({ baseURL: DOCSHOTS_SERVER.url, extraHTTPHeaders: API_HEADERS });
  await api.delete(`/api/schemas/${schemaId}`);
  await api.dispose();
});

for (const theme of THEMES) {
  test(`schema stanice (${theme})`, async ({ page }) => {
    await open(page, "/schema", theme);
    const canvas = page.getByRole("group", { name: "Schéma stanice" });
    await expect(canvas.getByText("Prijímacia budova")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /Okruh Hala/ })).toBeVisible();
    // tabule sa kreslia po jednej - pockat na vsetky
    await expect(page.locator("main canvas")).toHaveCount(7);
    await page.waitForTimeout(800);
    await shot(page, "schema-stanice/stranka", theme);

    await canvas.getByRole("button", { name: /Nástupište 1 –/ }).click();
    const detail = page.getByRole("dialog");
    await expect(detail.getByText("Linka 2 – Nástupištia")).toBeVisible();
    await expect(detail.locator("canvas")).toHaveCount(1);
    await page.waitForTimeout(500);
    await shot(page, "schema-stanice/detail", theme);

    // tabule ako znacky s nazvom a stavom
    await page.keyboard.press("Escape");
    await expect(detail).toBeHidden();
    await page.getByRole("button", { name: "Značky" }).click();
    await expect(page.locator("main canvas")).toHaveCount(0);
    await shot(page, "schema-stanice/znacky", theme);
  });

  test(`editor schemy (${theme})`, async ({ page }) => {
    await open(page, "/schema", theme);
    await page.getByRole("button", { name: "Upraviť" }).click();
    const layers = page.getByRole("list", { name: "Vrstvy" });
    await layers.getByRole("button", { name: "1. nástupište" }).click();
    await expect(page.getByText("Nástupište", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main canvas")).toHaveCount(7);
    await page.waitForTimeout(800);
    await shot(page, "schema-stanice/editor", theme);

    // kolaj ma uchyty v bodoch
    await layers.getByRole("button", { name: "1", exact: true }).click();
    await expect(page.locator("[data-point]")).toHaveCount(2);
    await shot(page, "schema-stanice/kolaj", theme);
  });

  test(`nastroje editora (${theme})`, async ({ page }) => {
    await open(page, "/schema", theme);
    await page.getByRole("button", { name: "Upraviť" }).click();
    const layers = page.getByRole("list", { name: "Vrstvy" });
    const editor = page.locator("[data-schema-canvas]");
    await expect(page.locator("main canvas")).toHaveCount(7);

    // mriezka a meranie s Alt: vybrane nastupiste voci tabuli pod mysou
    await page.getByRole("checkbox", { name: "Mriežka" }).click();
    await page.getByRole("combobox", { name: "Krok mriežky" }).click();
    await page.getByRole("option", { name: "50", exact: true }).click();
    await layers.getByRole("button", { name: "1. nástupište" }).click();
    await page.keyboard.down("Alt");
    await editor.locator(`[data-element="${PLATFORM_2_BOARD}"]`).hover();
    await expect(page.locator("[data-gap]").first()).toBeVisible();
    await shot(page, "schema-stanice/meranie", theme, { target: editor });
    await page.keyboard.up("Alt");
    await page.getByRole("checkbox", { name: "Mriežka" }).click();

    // kontextova ponuka nad vybranym prvkom
    await editor.locator(`[data-element="${PLATFORM_1}"]`).click({ button: "right", position: { x: 40, y: 6 } });
    await expect(page.getByRole("menuitem", { name: "Duplikovať" })).toBeVisible();
    await shot(page, "schema-stanice/ponuka", theme);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);

    // obrazok pozadia a jeho plocha upravovana mysou (vlastnosti schemy su vidiet bez vyberu)
    await editor.click({ position: { x: 4, y: 4 } });
    await page.getByLabel("Nahrať obrázok").setInputFiles(join(import.meta.dirname, "schema-plan.png"));
    await expect(editor.locator("svg image")).toHaveCount(1);
    await page.getByRole("button", { name: "Upraviť myšou" }).click();
    await expect(page.locator("[data-picture]")).toBeVisible();
    await page.waitForTimeout(500);
    await shot(page, "schema-stanice/pozadie", theme);
  });
}
