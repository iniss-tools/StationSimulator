// Kroky uprav v editore platna (cela tabul, schema stanice) a zaokruhlenie hodnoty na krok.

/** Krok prichytenia v bodoch: predvolene pol bodu, s Alt desatina, s Shift pri sipkach 5 bodov. */
export const SNAP = 0.5;
export const FINE = 0.1;
export const COARSE = 5;

/** Hodnota prichytena na krok (bez chyb desatinnych miest). */
export function snap(value: number, step: number): number {
  const snapped = Math.round(value / step) * step;
  return Math.round(snapped * 1000) / 1000;
}
