// Schema stanice: nova prazdna schema, editor (zariadenie pretiahnute zo zoznamu na platno, pridanie nastupista,
// ulozenie), zivy stav tabule na scheme (porucha), detail zariadenia s ovladanim poruchy, kiosk a odstranenie.
import { expect, test, type Page } from "@playwright/test";
import { API_HEADERS, collectErrors, createLine, deleteLine, elenRow, openLine, openPage } from "./helpers";

const LINE = 73;
const NAME = "E2E schéma";

interface Board {
  id: string;
  line: number;
  address: number;
  manufacturer: string;
  name: string;
  profile: unknown;
  design: string | null;
  secondAddress: number | null;
}

/** Obrazok 1 x 1 bod. */
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** Ulozena schema testu, ak ma obrazok pozadia; inak null. */
async function schemaBackground(page: Page) {
  const schemas = (await (await page.request.get("/api/schemas")).json()) as { name: string; background: string | null; backgroundWidth: number }[];
  const schema = schemas.find((s) => s.name === NAME);
  return schema?.background ? schema : null;
}

/** Porucha tabule cez API (kiosk ju potom ukaze bez ovladania). */
async function detailFault(page: Page, id: string) {
  const response = await page.request.post(`/api/boards/${id}/fault`, { headers: API_HEADERS, data: { kind: "noReply", delayMs: 0, status: 0 } });
  expect(response.ok(), await response.text()).toBe(true);
}

test("schema stanice: editor, zivy stav a kiosk", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/#/");
  await createLine(page, LINE, "E2E schéma");
  // spojenie ostava otvorene - odpojenie by vyvolalo upozornenie na vypadok, ktore prekryje tlacidla stranky
  const iniss = await openLine(47000 + LINE);
  await iniss.ask(elenRow(5, 1, "SCHEMA"));

  await openPage(page, "Schéma stanice");
  await page.getByRole("button", { name: "Nová schéma" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Názov").fill(NAME);
  const arrange = dialog.getByRole("checkbox", { name: "Rozmiestniť zariadenia stanice" });
  await expect(arrange).toBeChecked();
  await arrange.click();
  await dialog.getByRole("button", { name: "Vytvoriť" }).click();
  await expect(dialog).toBeHidden();

  // nova schema sa otvori v editore prazdna: tabula je v zozname mimo schemy a na platno sa da pretiahnut
  const outside = page.getByRole("list", { name: "Zariadenia mimo schémy" });
  const layers = page.getByRole("list", { name: "Vrstvy" });
  await expect(page.getByText("Schéma zatiaľ nemá prvky.")).toBeVisible();
  await outside.getByRole("button", { name: `${LINE}-5` }).dragTo(page.locator("[data-schema-canvas]"), { targetPosition: { x: 200, y: 120 } });
  await expect(layers.getByRole("button", { name: `${LINE}-5` })).toBeVisible();
  await expect(outside.getByRole("button", { name: `${LINE}-5` })).toHaveCount(0);
  // tabula je tam, kde bola pustena, nie v strede platna ako po kliknuti
  await expect(page.getByLabel("X", { exact: true })).not.toHaveValue("656");
  await expect(page.getByLabel("X", { exact: true })).not.toHaveValue("");

  await page.getByRole("button", { name: "Pridať" }).click();
  await page.getByRole("menuitem", { name: "Nástupište" }).click();
  await expect(layers.getByRole("button", { name: "Nástupište" })).toBeVisible();
  await page.getByLabel("Text").fill("Nástupište 1");
  await expect(page.getByText("Neuložené zmeny")).toBeVisible();
  // krok spat vrati text, znova ho zopakuje
  await page.getByRole("button", { name: "Späť (Ctrl+Z)" }).click();
  await page.getByRole("button", { name: "Znova (Ctrl+Y)" }).click();

  // mriezka, okno skratiek a kontextova ponuka
  await page.getByRole("checkbox", { name: "Mriežka" }).click();
  await expect(page.locator("[data-grid]")).toBeVisible();
  await page.getByRole("checkbox", { name: "Mriežka" }).click();
  await page.getByRole("button", { name: "Klávesové skratky" }).click();
  await expect(page.getByRole("dialog").getByText("Odstrániť bod koľaje alebo čiary")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator(`[data-schema-canvas] [data-element]`).last().click({ button: "right" });
  await page.getByRole("menuitem", { name: "Duplikovať" }).click();
  await expect(layers.getByRole("button", { name: "Nástupište 1" })).toHaveCount(2);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.keyboard.press("Delete");
  await expect(layers.getByRole("button", { name: "Nástupište 1" })).toHaveCount(1);

  // obrazok pozadia je krok historie a na server ide az pri ulozeni
  await page.keyboard.press("Escape");
  await page.getByLabel("Nahrať obrázok").setInputFiles({ name: "plan.png", mimeType: "image/png", buffer: Buffer.from(PNG, "base64") });
  const picture = page.locator("[data-schema-canvas] svg image");
  await expect(picture).toHaveCount(1);
  expect(await schemaBackground(page)).toBeNull();
  await page.getByRole("button", { name: "Späť (Ctrl+Z)" }).click();
  await expect(picture).toHaveCount(0);
  await page.getByRole("button", { name: "Znova (Ctrl+Y)" }).click();
  await expect(picture).toHaveCount(1);
  await page.getByLabel("Šírka").last().fill("400");
  // plocha obrazka sa da tahat mysou na platne
  await page.getByRole("button", { name: "Upraviť myšou" }).click();
  const frame = page.locator("[data-picture]");
  const before = await frame.boundingBox();
  await page.mouse.move(before!.x + 20, before!.y + 20);
  await page.mouse.down();
  await page.mouse.move(before!.x + 60, before!.y + 50, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByLabel("X", { exact: true })).not.toHaveValue("0");
  await page.keyboard.press("Escape");
  await expect(frame).toHaveCount(0);
  await page.getByRole("button", { name: "Uložiť" }).click();
  await expect(page.getByText("Schéma je uložená.")).toBeVisible();
  expect(await schemaBackground(page)).toMatchObject({ backgroundWidth: 400 });
  await expect(picture).toHaveAttribute("width", "400");
  await page.getByRole("button", { name: "Späť na schému" }).click();

  // zobrazenie: tabula v poriadku, po poruche cez API cerveny stav bez nacitania stranky
  const canvas = page.getByRole("group", { name: "Schéma stanice" });
  await expect(canvas.getByText("Nástupište 1")).toBeVisible();
  await expect(canvas.getByRole("button", { name: `${LINE}-5 – v poriadku` })).toBeVisible();
  const state = (await (await page.request.get("/api/state")).json()) as { boards: Board[] };
  const board = state.boards.find((b) => b.id === `${LINE}-5`)!;
  const fault = await page.request.put(`/api/boards/${LINE}/5`, {
    headers: API_HEADERS,
    data: {
      line: board.line,
      address: board.address,
      manufacturer: board.manufacturer,
      name: board.name,
      profile: board.profile,
      design: board.design,
      fault: { kind: "noReply", delayMs: 0, status: 0 },
      secondAddress: board.secondAddress,
    },
  });
  expect(fault.ok(), await fault.text()).toBe(true);
  const broken = canvas.getByRole("button", { name: `${LINE}-5 – porucha` });
  await expect(broken).toBeVisible();

  // znacky namiesto ziveho obsahu tabul
  await expect(page.locator("main canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Značky" }).click();
  await expect(page.locator("main canvas")).toHaveCount(0);
  await expect(page.locator("[data-indicator]")).toHaveCount(1);
  await expect(broken).toBeVisible();
  await page.getByRole("button", { name: "Značky" }).click();
  await expect(page.locator("main canvas")).toHaveCount(1);

  // detail zariadenia
  await broken.click();
  const detail = page.getByRole("dialog");
  await expect(detail.getByText("porucha", { exact: true })).toBeVisible();
  await expect(detail.getByText(`Linka ${LINE} – E2E schéma`)).toBeVisible();
  // vypadok napajania a spat
  await detail.getByRole("button", { name: "Vypnúť napájanie" }).click();
  await expect(detail.getByText("bez napájania", { exact: true })).toBeVisible();
  await detail.getByRole("button", { name: "Zapnúť napájanie" }).click();
  await expect(detail.getByText("porucha", { exact: true })).toBeVisible();
  // poruchu ide zrusit priamo v detaile
  await detail.getByRole("combobox", { name: "Porucha" }).click();
  await page.getByRole("option", { name: "Bez poruchy" }).click();
  await expect(detail.getByText("v poriadku", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).toBeHidden();
  await expect(canvas.getByRole("button", { name: `${LINE}-5 – v poriadku` })).toBeVisible();
  await detailFault(page, `${LINE}-5`);
  await expect(canvas.getByRole("button", { name: `${LINE}-5 – porucha` })).toBeVisible();

  // kiosk tej istej schemy
  const schemas = (await (await page.request.get("/api/schemas")).json()) as { id: number; name: string }[];
  const id = schemas.find((s) => s.name === NAME)!.id;
  await page.goto(`/#/plan/${id}`);
  await expect(page.getByRole("group", { name: "Schéma stanice" }).getByRole("img", { name: `${LINE}-5 – porucha` })).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);

  // odstranenie
  await page.goto("/#/schema");
  await page.getByRole("button", { name: "Odstrániť" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Odstrániť" }).click();
  await expect(page.getByText("Zatiaľ žiadna schéma")).toBeVisible();

  iniss.close();
  await deleteLine(page, LINE);
  expect(errors).toEqual([]);
  const left = (await (await page.request.get("/api/schemas", { headers: API_HEADERS })).json()) as { name: string }[];
  expect(left.filter((s) => s.name === NAME)).toEqual([]);
});
