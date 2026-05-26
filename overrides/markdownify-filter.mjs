// Lightweight browser-compatible Markdown renderer covering the inline
// patterns this site uses. markdown-it is not available in the browser bundle.
export default function markdownify(markdown) {
  if (!markdown) return "";
  return String(markdown)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}
