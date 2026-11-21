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
