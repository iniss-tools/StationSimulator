// Prirodzeny rozmer obrazka na adrese (obrazok pozadia schemy).

/** Sirka a vyska obrazka v bodoch; null = neda sa nacitat. */
export function imageSize(href: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0 ? { width: image.naturalWidth, height: image.naturalHeight } : null);
    image.onerror = () => resolve(null);
    image.src = href;
  });
}
