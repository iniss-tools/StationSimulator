// Formulare GitHub Issues v repozitari simulatora. Nazvy formularov a identifikatory poli su v repozitari iniss-tools/.github
// (ISSUE_TEMPLATE/chyba.yml, navrh.yml).
const NEW_ISSUE = "https://github.com/iniss-tools/StationSimulator/issues/new";

/** Formular na nahlasenie chyby s predvyplnenou verziou servera, ak je znama. */
export function bugReportUrl(version?: string): string {
  const query = new URLSearchParams({ template: "chyba.yml" });
  if (version) query.set("verzia", version);
  return `${NEW_ISSUE}?${query}`;
}

/** Formular na navrh funkcie. */
export const FEATURE_REQUEST_URL = `${NEW_ISSUE}?template=navrh.yml`;
