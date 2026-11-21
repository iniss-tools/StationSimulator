// Naposledy zobrazena schema stanice - pamatana v prehliadaci.

const KEY = "stationsimulator.schema.choice";

/** Cislo naposledy zobrazenej schemy; null = ziadna (ukaze sa prva). */
export function loadSchemaChoice(): number | null {
  try {
    const id = Number(localStorage.getItem(KEY));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function saveSchemaChoice(id: number) {
  try {
    localStorage.setItem(KEY, String(id));
  } catch {
    // bez uloziska sa len nepamata
  }
}

const SYMBOLS_KEY = "stationsimulator.schema.symbols";

/** Tabule na scheme ako znacky s nazvom a stavom (true), alebo so zivym obsahom. */
export function loadSymbols(): boolean {
  try {
    return localStorage.getItem(SYMBOLS_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveSymbols(symbols: boolean) {
  try {
    localStorage.setItem(SYMBOLS_KEY, symbols ? "1" : "0");
  } catch {
    // bez uloziska sa len nepamata
  }
}

/** Volby zobrazenia editora schemy - pamatane v prehliadaci. */
export interface SchemaEditorView {
  /** Mriezka na platne. */
  grid: boolean;
  /** Krok mriezky v jednotkach platna. */
  gridStep: number;
  /** Prichytavanie k mriezke. */
  snapGrid: boolean;
  /** Vodiace ciary a prichytavanie k prvkom a platnu. */
  guides: boolean;
}

export const DEFAULT_EDITOR_VIEW: SchemaEditorView = { grid: false, gridStep: 20, snapGrid: false, guides: true };

/** Kroky mriezky v ponuke. */
export const GRID_STEPS = [5, 10, 20, 25, 50, 100];

const EDITOR_KEY = "stationsimulator.schema.editor";

/** Ulozene volby; chybajuce alebo nepouzitelne = predvolene. */
export function loadEditorView(): SchemaEditorView {
  try {
    const stored = JSON.parse(localStorage.getItem(EDITOR_KEY) ?? "null") as Partial<SchemaEditorView> | null;
    const view = { ...DEFAULT_EDITOR_VIEW, ...stored };
    return { ...view, gridStep: GRID_STEPS.includes(view.gridStep) ? view.gridStep : DEFAULT_EDITOR_VIEW.gridStep };
  } catch {
    return DEFAULT_EDITOR_VIEW;
  }
}

export function saveEditorView(view: SchemaEditorView) {
  try {
    localStorage.setItem(EDITOR_KEY, JSON.stringify(view));
  } catch {
    // bez uloziska sa len nepamata
  }
}
