// Schema stanice so zariadeniami, ktore nie su tabule: svetlo a rozhlas ustredni AK Signal, rozhlas vzdialeneho INISSu
// a zosilnovac ELSVO podla sprav, ake posiela INISS; prerusenie hlasenia a vypadok linky z detailu. Kiosk schemy
// s klucom zariadenia na serveri s prihlasovanim (ako na inom pocitaci - bez prihlasenia, kluc len v adrese).
import { expect, test, type Page } from "@playwright/test";
import { elsvoFrame } from "../docshots/frames";
import { akSignalFrame, API_HEADERS, collectErrors, createBoard, createLine, deleteLine, openLine, openPage, remoteQueueMessage } from "./helpers";
import { E2E_SERVERS } from "./servers";

const LIGHT_LINE = 74;
const UH_LINE = 75;
const REMOTE_LINE = 76;
const AMPLIFIER_LINE = 77;
const NAME = "E2E zariadenia";

/** Obrazok 1 x 1 bod. */
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const text = (value: string) => Array.from(value, (ch) => ch.charCodeAt(0));

const device = (id: number, kind: string, line: number, address: number | null, y: number) => ({
  id,
  kind,
  x: 60,
  y,
  width: 320,
  height: 44,
  line,
  address,
});

async function createSchema(page: Page, elements: object[]): Promise<number> {
  const response = await page.request.post("/api/schemas", { headers: API_HEADERS, data: { name: NAME, width: 900, height: 420, elements } });
  expect(response.ok(), await response.text()).toBe(true);
  return ((await response.json()) as { id: number }).id;
}

test("schema: stavy zariadeni podla sprav INISSu a ovladanie v detaile", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/#/");
  await createLine(page, LIGHT_LINE, "E2E svetlá", 131, "AKSIGNAL");
  await createBoard(page, LIGHT_LINE, 5, "AKSIGNAL", "Svetlá E2E");
  await createLine(page, UH_LINE, "E2E rozhlas", 132, "AKSIGNALUH");
  await createBoard(page, UH_LINE, 0, "AKSIGNALUH", "Rozhlas E2E");
  await createLine(page, REMOTE_LINE, "E2E vzdialený", 128);
  await createLine(page, AMPLIFIER_LINE, "E2E zosilňovače", 129, "ELSVO");
  await createBoard(page, AMPLIFIER_LINE, 5, "ELSVO", "Zosilňovač E2E");
  // spojenia ostavaju otvorene - odpojenie by vyvolalo upozornenie na vypadok, ktore prekryje tlacidla stranky
  const lights = await openLine(47000 + LIGHT_LINE);
  const uh = await openLine(47000 + UH_LINE);
  const remote = await openLine(47000 + REMOTE_LINE);
  const amplifier = await openLine(47000 + AMPLIFIER_LINE);
  // rozhlas vzdialeneho INISSu vznikne prvou spravou s frontami
  await remote.ask(remoteQueueMessage(1, 1));

  const id = await createSchema(page, [
    device(1, "light", LIGHT_LINE, 5, 20),
    device(2, "audio", UH_LINE, 0, 80),
    device(3, "audio", REMOTE_LINE, 0, 140),
    device(4, "amplifier", AMPLIFIER_LINE, 5, 200),
    device(5, "commLine", AMPLIFIER_LINE, null, 260),
  ]);
  await openPage(page, "Schéma stanice");
  await page.getByRole("combobox", { name: "Schéma" }).click();
  await page.getByRole("option", { name: NAME }).click();
  const canvas = page.getByRole("group", { name: "Schéma stanice" });
  const element = (name: string) => canvas.getByRole("button", { name });

  // svetlo: snimac hlasi tmu a server zapne automatiku
  await expect(element("Svetlá E2E – zhasnuté")).toBeVisible();
  const dark = await page.request.put(`/api/boards/${LIGHT_LINE}-5/aksignal`, {
    headers: API_HEADERS,
    data: {
      sensor: { mode: "dark", offsetMinutes: 0 },
      conditions: { lightsFault: false, highPriority: false, outputPowerError: false, ampSupplyMissing: false, ampCommError: false, bankNotSynced: false },
    },
  });
  expect(dark.ok(), await dark.text()).toBe(true);
  await lights.ask(akSignalFrame(5, 0x22));
  await expect(element("Svetlá E2E – svieti")).toBeVisible();

  // rozhlas ustredne UH: hlasenie na kanali 1
  await expect(element("Rozhlas E2E – ticho")).toBeVisible();
  await uh.ask(text(`<aud|ch=1|${["SK/Gong/gong1", ...Array.from({ length: 40 }, () => "SK/Vlak/pozor")].join("*")}>`));
  await expect(element("Rozhlas E2E – hrá hlásenie")).toBeVisible();

  // zosilnovac: zopnutie pasma 1
  await expect(element("Zosilňovač E2E – vypnutý")).toBeVisible();
  await amplifier.ask(elsvoFrame(5, 0x1f));
  await expect(element("Zosilňovač E2E – zopnutý")).toBeVisible();

  // rozhlas vzdialeneho INISSu: hlasenie s dlhou pauzou hra, kym ho obsluha neprerusi v detaile
  await remote.ask(remoteQueueMessage(2, 0, "SK/R1/9900100,0,600000", "Os 3412 Lipovec"));
  await remote.ask(remoteQueueMessage(3, 1));
  const playing = element(`${REMOTE_LINE}-0 – hrá hlásenie`);
  await expect(playing).toBeVisible();
  await expect(page.getByText("Os 3412 Lipovec").first()).toBeVisible();
  await playing.click();
  const detail = page.getByRole("dialog");
  await expect(detail.getByText("Práve hrá")).toBeVisible();
  await detail.getByRole("button", { name: "Prerušiť" }).click();
  await expect(detail.getByText("ticho", { exact: true })).toBeVisible();
  await expect(detail.getByRole("button", { name: "Prerušiť" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(detail).toBeHidden();

  // vypadok linky z detailu a jeho koniec
  await element("E2E zosilňovače – INISS pripojený").click();
  await detail.getByRole("button", { name: "Výpadok linky" }).click();
  await expect(detail.getByText("výpadok", { exact: true })).toBeVisible();
  const state = async () => ((await (await page.request.get("/api/state")).json()) as { lines: { number: number; status: string }[] }).lines;
  expect((await state()).find((l) => l.number === AMPLIFIER_LINE)?.status).toBe("outage");
  await detail.getByRole("button", { name: "Ukončiť výpadok" }).click();
  await expect(detail.getByText("výpadok", { exact: true })).toHaveCount(0);
  expect((await state()).find((l) => l.number === AMPLIFIER_LINE)?.status).not.toBe("outage");
  await page.keyboard.press("Escape");

  for (const connection of [lights, uh, remote, amplifier]) connection.close();
  const removed = await page.request.delete(`/api/schemas/${id}`, { headers: API_HEADERS });
  expect(removed.ok()).toBe(true);
  for (const line of [LIGHT_LINE, UH_LINE, REMOTE_LINE, AMPLIFIER_LINE]) await deleteLine(page, line);
  expect(errors).toEqual([]);
});

test.describe("kiosk schemy s klucom zariadenia", () => {
  test.use({ baseURL: E2E_SERVERS.login.url });

  test("schema aj obrazok pozadia sa nacitaju len s klucom v adrese", async ({ page, browser }) => {
    // spravca zo suboru auth.e2e.ts pripravi schemu s obrazkom a kluc zariadenia
    const login = await page.request.post("/api/auth/login", { headers: API_HEADERS, data: { userName: "spravca", password: "heslo-e2e-1", remember: false } });
    expect(login.ok(), await login.text()).toBe(true);
    const id = await createSchema(page, [{ id: 1, kind: "text", x: 40, y: 40, text: "Kiosk E2E" }]);
    const image = await page.request.put(`/api/schemas/${id}/background?name=plan.png`, {
      headers: { ...API_HEADERS, "Content-Type": "application/octet-stream" },
      data: Buffer.from(PNG, "base64"),
    });
    expect(image.ok(), await image.text()).toBe(true);
    const key = await page.request.post("/api/keys", { headers: API_HEADERS, data: { name: "Kiosk schémy E2E", kind: "device", role: "viewer" } });
    expect(key.ok(), await key.text()).toBe(true);
    const { secret } = (await key.json()) as { secret: string };

    // zariadenie: cisty prehliadac bez prihlasenia
    const context = await browser.newContext({ baseURL: E2E_SERVERS.login.url });
    const kiosk = await context.newPage();
    const errors = collectErrors(kiosk);
    const pictures: number[] = [];
    kiosk.on("response", (response) => {
      if (response.url().includes(`/api/schemas/${id}/background`)) pictures.push(response.status());
    });
    await kiosk.goto(`/?key=${encodeURIComponent(secret)}#/plan/${id}`);
    await expect(kiosk.getByRole("group", { name: "Schéma stanice" }).getByText("Kiosk E2E")).toBeVisible();
    await expect(kiosk.locator("svg image")).toHaveCount(1);
    await expect.poll(() => pictures).toEqual([200]);
    await expect(kiosk.getByText("Prihlásenie", { exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);

    // bez kluca zariadenie schemu nevidi
    const stranger = await context.browser()!.newContext({ baseURL: E2E_SERVERS.login.url });
    const other = await stranger.newPage();
    await other.goto(`/#/plan/${id}`);
    await expect(other.getByText("Prihlásenie", { exact: true })).toBeVisible();
    expect((await other.request.get(`/api/schemas/${id}/background`)).status()).toBe(401);
    await stranger.close();
    await context.close();

    expect((await page.request.delete(`/api/schemas/${id}`, { headers: API_HEADERS })).ok()).toBe(true);
  });
});
