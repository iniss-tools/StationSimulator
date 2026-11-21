// Schema stanice: nova schema s rozmiestnenymi zariadeniami, editor (pridanie nastupista, ulozenie), zivy stav tabule
// na scheme (porucha), detail zariadenia, kiosk a odstranenie.
import { expect, test } from "@playwright/test";
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
  await expect(dialog.getByRole("checkbox", { name: "Rozmiestniť zariadenia stanice" })).toBeChecked();
  await dialog.getByRole("button", { name: "Vytvoriť" }).click();
  await expect(dialog).toBeHidden();

  // nova schema sa otvori v editore: linka a jej tabula su vo vrstvach, mimo schemy nie je nic
  const layers = page.getByRole("list", { name: "Vrstvy" });
  await expect(layers.getByRole("button", { name: `${LINE}-5` })).toBeVisible();
  await expect(page.getByText("Všetky zariadenia stanice sú na schéme.")).toBeVisible();

  await page.getByRole("button", { name: "Pridať" }).click();
  await page.getByRole("menuitem", { name: "Nástupište" }).click();
  await expect(layers.getByRole("button", { name: "Nástupište" })).toBeVisible();
  await page.getByLabel("Text").fill("Nástupište 1");
  await expect(page.getByText("Neuložené zmeny")).toBeVisible();
  // krok spat vrati text, znova ho zopakuje
  await page.getByRole("button", { name: "Späť (Ctrl+Z)" }).click();
  await page.getByRole("button", { name: "Znova (Ctrl+Y)" }).click();
  await page.getByRole("button", { name: "Uložiť" }).click();
  await expect(page.getByText("Schéma je uložená.")).toBeVisible();
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

  // detail zariadenia
  await broken.click();
  const detail = page.getByRole("dialog");
  await expect(detail.getByText("porucha", { exact: true })).toBeVisible();
  await expect(detail.getByText(`Linka ${LINE} – E2E schéma`)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).toBeHidden();

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
