// Subor so schemou stanice na prenos medzi simulatormi: definicia schemy a volitelne obrazok pozadia (base64).
import type { StationSchemaRequest } from "@/api";

export const SCHEMA_FILE_FORMAT = "StationSimulator.Schema";

export interface SchemaFileBackground {
  /** Meno suboru s priponou - podla nej server urci typ obrazka. */
  name: string;
  /** Obsah suboru v base64. */
  data: string;
}

export interface SchemaFile {
  format: typeof SCHEMA_FILE_FORMAT;
  version: 1;
  schema: StationSchemaRequest;
  background: SchemaFileBackground | null;
}

const EXTENSIONS: Record<string, string> = { "image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif", "image/webp": ".webp" };

/** Meno suboru obrazka pozadia podla typu obsahu. */
export const backgroundFileName = (contentType: string) => `background${EXTENSIONS[contentType.split(";")[0].trim().toLowerCase()] ?? ".png"}`;

export function toSchemaFile(schema: StationSchemaRequest, background: SchemaFileBackground | null): SchemaFile {
  return { format: SCHEMA_FILE_FORMAT, version: 1, schema, background };
}

/** Meno suboru exportu z nazvu schemy (bez znakov, ktore v menach suborov vadia). */
export function schemaFileName(name: string): string {
  const safe = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `schema-${safe || "stanice"}.json`;
}

/** Subor so schemou z textu; null = nie je to subor so schemou (obsah overi az server). */
export function parseSchemaFile(text: string): SchemaFile | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const file = value as Partial<SchemaFile>;
  const schema = file.schema as Partial<StationSchemaRequest> | undefined;
  if (file.format !== SCHEMA_FILE_FORMAT || file.version !== 1 || typeof schema !== "object" || schema === null) return null;
  if (typeof schema.name !== "string" || !Array.isArray(schema.elements)) return null;
  const background = file.background;
  const valid = background && typeof background.name === "string" && typeof background.data === "string" ? background : null;
  return { format: SCHEMA_FILE_FORMAT, version: 1, schema: schema as StationSchemaRequest, background: valid };
}

/** Bajty na base64 (po castiach - velky obrazok by naraz preplnil zasobnik). */
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
