// Schranka prvkov schemy - plati pre vsetky schemy, kym je aplikacia otvorena.
import type { SchemaElementDto } from "@/api";
import { createClipboard } from "@/components/editor/clipboard";

const clipboard = createClipboard<SchemaElementDto>();

export const copyElements = clipboard.copy;

/** Prvky v schranke (stranka sa prekresli po kopirovani). */
export const useClipboard = clipboard.use;
