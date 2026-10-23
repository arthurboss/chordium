/** Capitalizes the first letter of each word, e.g. "worship songs" -> "Worship Songs". */
export default function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
