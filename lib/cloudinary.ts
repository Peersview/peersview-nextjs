/**
 * Cloudinary + display helpers.
 *
 * Some legacy company.logo / user.profilePicture values stored in MongoDB are
 * raw Cloudinary public IDs (e.g. "iIpx22g3JPA5rx7HdclnJyglde9N4D2S/kxmi0ukfmzsihwkqvmjj")
 * rather than full URLs. When such values are passed to <img src> directly,
 * the browser treats them as relative paths and gets a 404 from the Next.js
 * server. This helper normalises the value into a full delivery URL.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "peersview";

/**
 * Returns a full Cloudinary delivery URL for the given stored value.
 * Accepts a full URL (http/https), a value already starting with `/`, or
 * a bare Cloudinary public_id (with or without folder prefix).
 */
export function cloudinaryUrl(
  value: string | null | undefined,
  opts: { width?: number; height?: number; crop?: string } = {},
): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Already a full URL - use as-is.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Defensive: protocol-relative URL.
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  // Strip any leading slashes - Cloudinary public_ids don't start with /.
  const publicId = trimmed.replace(/^\/+/, "");

  const transformations: string[] = [];
  if (opts.width) transformations.push(`w_${opts.width}`);
  if (opts.height) transformations.push(`h_${opts.height}`);
  if (opts.crop) transformations.push(`c_${opts.crop}`);
  // Sensible default: deliver as-is, auto format/quality for performance.
  transformations.push("f_auto", "q_auto");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations.join(",")}/${publicId}`;
}

/**
 * Title-case a possibly all-uppercase / all-lowercase / mixed-case location string.
 * Examples:
 *   "TORONTO"         -> "Toronto"
 *   "new york, ny"    -> "New York, NY"   (common 2-3 letter codes left uppercase)
 *   "B.C"             -> "B.C"
 */
export function formatLocation(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/(\s*,\s*)/)
    .map((part) => {
      if (/^\s*,\s*$/.test(part)) return part;
      return part
        .split(/\s+/)
        .map((word) => titleCaseWord(word))
        .join(" ");
    })
    .join("");
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * Format a date as "Apr-27-2026".
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const month = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}-${day}-${d.getFullYear()}`;
}

function titleCaseWord(word: string): string {
  if (!word) return word;
  // Keep short codes (2-3 letters, all-caps when input was all caps) uppercase.
  if (/^[A-Z]{2,3}$/.test(word)) return word;
  // Word containing dots like "B.C." or "U.S." - upper-case it.
  if (/^[A-Za-z](\.[A-Za-z])+\.?$/.test(word)) return word.toUpperCase();
  const lower = word.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
