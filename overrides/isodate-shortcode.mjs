// Browser-compatible replacement for isoDate. Server-side closes over Luxon's
// DateTime, which isn't available in the browser bundle.
export default function isoDate() {
  return new Date().toISOString();
}
