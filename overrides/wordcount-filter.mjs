// Self-contained browser replacement for wordCount. The server-side version
// references module-local helpers (htmlToPlainText, plainTextMetadata) that
// don't survive auto-mirror serialization.
export default function wordCount(html) {
  const words = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}
