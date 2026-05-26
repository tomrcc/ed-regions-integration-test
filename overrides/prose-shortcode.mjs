// Browser-compatible replacement for the prose paired shortcode. Server-side
// closes over a markdown-it instance, which isn't available in the browser bundle.
export default function prose(content) {
  const rendered = String(content || "")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
  return `<div class="prose">${rendered}</div>`;
}
