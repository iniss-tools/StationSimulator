// Obrazok pozadia vybrany v editore schemy: zmena cakajuca na ulozenie a kontrola suboru pred nahratim.
import type { TextKey } from "@/i18n";

/** Zmena obrazka pozadia: null = bez zmeny, "remove" = odstranit ulozeny, inak novy subor a jeho docasna adresa. */
export type ImageChange = null | "remove" | { file: File; url: string };

/** Najvacsi obrazok pozadia (ako na serveri). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

/** Preco sa subor neda pouzit ako obrazok pozadia (kluc textu chyby); null = v poriadku. */
export function imageProblem(file: Pick<File, "name" | "size">): TextKey | null {
  const name = file.name.toLowerCase();
  if (!EXTENSIONS.some((extension) => name.endsWith(extension))) return "error.schema.backgroundType";
  if (file.size === 0) return "error.schema.backgroundEmpty";
  return file.size > MAX_IMAGE_BYTES ? "error.schema.backgroundTooLarge" : null;
}
