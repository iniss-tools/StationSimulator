// Prikazy editora platna (cela tabul, schema stanice) spolocne pre klavesy a kontextovu ponuku.

export type EditorAction =
  "undo" | "redo" | "selectAll" | "copy" | "cut" | "paste" | "duplicate" | "remove" | "forward" | "backward" | "front" | "back" | "lock" | "hide";

/**
 * Prikaz pre klavesovu skratku s Ctrl (Cmd); null = ziadny. Poradie kreslenia podla polohy klaves ] a [ (vpravo od P,
 * na slovenskej klavesnici a a u), nie podla znaku - ten by bez AltGr nesiel napisat.
 */
export function shortcutAction(e: Pick<KeyboardEvent, "key" | "code" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): EditorAction | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  if (e.code === "BracketRight") return e.shiftKey ? "front" : "forward";
  if (e.code === "BracketLeft") return e.shiftKey ? "back" : "backward";
  switch (e.key.toLowerCase()) {
    case "z":
      return e.shiftKey ? "redo" : "undo";
    case "y":
      return "redo";
    case "a":
      return "selectAll";
    case "c":
      return "copy";
    case "x":
      return "cut";
    case "v":
      return "paste";
    case "d":
      return "duplicate";
    default:
      return null;
  }
}
