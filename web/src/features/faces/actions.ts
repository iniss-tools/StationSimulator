// Prikazy editora ciel spolocne pre klavesy a kontextovu ponuku a schranka prvkov. Schranka plati pre vsetky predlohy,
// kym je aplikacia otvorena - prvky sa tak daju preniest aj zo vstavanej predlohy do vlastnej.
import type { FaceElementDto } from "@/api";
import { createClipboard } from "@/components/editor/clipboard";
import type { EditorAction } from "@/components/editor/shortcuts";

export { shortcutAction } from "@/components/editor/shortcuts";

export type FaceAction = EditorAction;

const clipboard = createClipboard<FaceElementDto>();

/** Prvky do schranky - vlozia sa odomknute. */
export const copyElements = (elements: readonly FaceElementDto[]) => clipboard.copy(elements.map((e) => ({ ...e, locked: false })));

/** Prvky v schranke (stranka sa prekresli po kopirovani). */
export const useClipboard = clipboard.use;
