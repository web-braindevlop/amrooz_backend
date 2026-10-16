/**
 * Convert a string into a URL-safe slug.
 * "Silk-Blend Evening Dress" -> "silk-blend-evening-dress"
 */
export function slugify(value: string): string {
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
