// Export a import schemy stanice cez API: subor so schemou a obrazkom pozadia.
import { authHeaders, createStationSchema, setSchemaBackground, type StationSchemaDto } from "@/api";
import { saveFile } from "@/lib/download";
import { backgroundHref, toRequest } from "./schema";
import { backgroundFileName, fromBase64, parseSchemaFile, schemaFileName, toBase64, toSchemaFile, type SchemaFileBackground } from "./schema-file";

/** Obrazok pozadia schemy zo servera; null = schema ho nema. */
async function loadBackground(schema: StationSchemaDto): Promise<SchemaFileBackground | null> {
  const href = backgroundHref(schema);
  if (!href) return null;
  const response = await fetch(href, { headers: authHeaders() });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { name: backgroundFileName(response.headers.get("content-type") ?? ""), data: toBase64(bytes) };
}

/** Ulozi schemu aj s obrazkom pozadia do suboru. */
export async function exportSchema(schema: StationSchemaDto): Promise<void> {
  const file = toSchemaFile(toRequest(schema), await loadBackground(schema));
  saveFile(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }), schemaFileName(schema.name));
}

/** Zalozi novu schemu zo suboru; null = subor nie je subor so schemou. Chyby servera vyhadzuje. */
export async function importSchema(source: File): Promise<StationSchemaDto | null> {
  const file = parseSchemaFile(await source.text());
  if (!file) return null;
  const created = (await createStationSchema({ body: file.schema, throwOnError: true })).data;
  if (file.background) {
    const body = new Blob([fromBase64(file.background.data)]);
    await setSchemaBackground({ path: { id: created.id }, query: { name: file.background.name }, body, throwOnError: true });
  }
  return created;
}
