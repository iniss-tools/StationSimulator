import { describe, expect, test } from "bun:test";
import type { StationSchemaRequest } from "@/api";
import { backgroundFileName, fromBase64, parseSchemaFile, schemaFileName, toBase64, toSchemaFile } from "./schema-file";

const schema: StationSchemaRequest = {
  name: "Nástupištia",
  width: 800,
  height: 400,
  elements: [],
  backgroundOpacity: 0.4,
  backgroundX: 0,
  backgroundY: 0,
  backgroundWidth: 0,
  backgroundHeight: 0,
};

describe("subor so schemou", () => {
  test("export a import vratia rovnaku schemu aj obrazok", () => {
    const bytes = new Uint8Array([0, 255, 137, 80, 78, 71]);
    const text = JSON.stringify(toSchemaFile(schema, { name: "background.png", data: toBase64(bytes) }));
    const file = parseSchemaFile(text);
    expect(file?.schema).toEqual(schema);
    expect(Array.from(fromBase64(file!.background!.data))).toEqual(Array.from(bytes));
  });

  test("iny subor sa odmietne", () => {
    expect(parseSchemaFile("nie je json")).toBeNull();
    expect(parseSchemaFile("[]")).toBeNull();
    expect(parseSchemaFile(JSON.stringify({ format: "Ine", version: 1, schema }))).toBeNull();
    expect(parseSchemaFile(JSON.stringify({ format: "StationSimulator.Schema", version: 2, schema }))).toBeNull();
    expect(parseSchemaFile(JSON.stringify({ format: "StationSimulator.Schema", version: 1, schema: { name: "x" } }))).toBeNull();
  });

  test("obrazok bez udajov sa vynecha", () => {
    const file = parseSchemaFile(JSON.stringify({ format: "StationSimulator.Schema", version: 1, schema, background: { name: "a.png" } }));
    expect(file?.background).toBeNull();
  });

  test("mena suborov", () => {
    expect(schemaFileName("Nástupištia – hala")).toBe("schema-nastupistia-hala.json");
    expect(schemaFileName("  ")).toBe("schema-stanice.json");
    expect(backgroundFileName("image/jpeg")).toBe("background.jpg");
    expect(backgroundFileName("image/webp; charset=x")).toBe("background.webp");
    expect(backgroundFileName("text/plain")).toBe("background.png");
  });

  test("velky obsah sa prevedie po castiach", () => {
    const bytes = new Uint8Array(100_000).map((_, i) => i % 251);
    expect(Array.from(fromBase64(toBase64(bytes)))).toEqual(Array.from(bytes));
  });
});
