// Poradie kreslenia prvkov v editore platna: presun polozky a posun vybranych prvkov dopredu a dozadu. Ciste funkcie.

/** Polozka zoznamu presunuta na iny index. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const moved = [...items];
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);
  return moved;
}

/** Poradie kreslenia po posunuti vybranych prvkov o jedno miesto dopredu (+1) alebo dozadu (-1); vybrane prvky vedla seba idu spolu. */
export function stepOrder(count: number, selection: readonly number[], direction: 1 | -1): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  const chosen = new Set(selection);
  const swap = (i: number, j: number) => ([order[i], order[j]] = [order[j], order[i]]);
  if (direction > 0) {
    for (let i = count - 2; i >= 0; i--) if (chosen.has(order[i]) && !chosen.has(order[i + 1])) swap(i, i + 1);
  } else {
    for (let i = 1; i < count; i++) if (chosen.has(order[i]) && !chosen.has(order[i - 1])) swap(i, i - 1);
  }
  return order;
}

/** Poradie kreslenia s vybranymi prvkami navrchu (kreslia sa posledne) alebo naspodku; ich vzajomne poradie ostane. */
export function extremeOrder(count: number, selection: readonly number[], front: boolean): number[] {
  const chosen = new Set(selection);
  const all = Array.from({ length: count }, (_, i) => i);
  const picked = all.filter((i) => chosen.has(i));
  const rest = all.filter((i) => !chosen.has(i));
  return front ? [...rest, ...picked] : [...picked, ...rest];
}
