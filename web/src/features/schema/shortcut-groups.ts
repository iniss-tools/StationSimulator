// Klavesy a mys v editore schemy stanice pre okno skratiek.
import type { ShortcutGroup } from "@/components/editor/ShortcutsDialog";

export const SCHEMA_SHORTCUTS: ShortcutGroup[] = [
  {
    title: "faces.keys.select",
    rows: [
      { keys: [["click"]], text: "faces.keys.select.one" },
      {
        keys: [
          ["Ctrl", "click"],
          ["Shift", "click"],
        ],
        text: "faces.keys.select.add",
      },
      { keys: [["drag", "empty"]], text: "faces.keys.select.marquee" },
      { keys: [["Ctrl", "A"]], text: "faces.keys.select.all" },
      { keys: [["Esc"]], text: "faces.keys.select.none" },
    ],
  },
  {
    title: "faces.keys.edit",
    rows: [
      { keys: [["arrows"]], text: "schema.keys.arrows" },
      {
        keys: [
          ["Shift", "arrows"],
          ["Alt", "arrows"],
        ],
        text: "schema.keys.arrowsMod",
      },
      { keys: [["Alt", "drag"]], text: "faces.keys.edit.noSnap" },
      { keys: [["drag", "label"]], text: "faces.keys.edit.scrub" },
      { keys: [["dblclick"]], text: "schema.keys.removePoint" },
      {
        keys: [
          ["Ctrl", "C"],
          ["Ctrl", "X"],
          ["Ctrl", "V"],
        ],
        text: "faces.keys.edit.clipboard",
      },
      { keys: [["Ctrl", "D"]], text: "faces.keys.edit.duplicate" },
      { keys: [["Del"]], text: "faces.keys.edit.remove" },
    ],
  },
  {
    title: "faces.keys.arrange",
    rows: [
      {
        keys: [
          ["Ctrl", "]"],
          ["Ctrl", "["],
        ],
        text: "faces.keys.arrange.step",
      },
      {
        keys: [
          ["Ctrl", "Shift", "]"],
          ["Ctrl", "Shift", "["],
        ],
        text: "faces.keys.arrange.end",
      },
    ],
  },
  {
    title: "faces.keys.view",
    rows: [{ keys: [["Alt", "hover"]], text: "schema.keys.measure" }],
  },
  {
    title: "faces.keys.history",
    rows: [
      { keys: [["Ctrl", "Z"]], text: "faces.keys.history.undo" },
      {
        keys: [
          ["Ctrl", "Y"],
          ["Ctrl", "Shift", "Z"],
        ],
        text: "faces.keys.history.redo",
      },
      { keys: [["Ctrl", "S"]], text: "faces.keys.history.save" },
    ],
  },
];
