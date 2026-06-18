// Browser override for the `fileSize` filter. The server-side version calls
// fs.statSync to read a file size from disk — `node:fs` is stubbed in the
// browser bundle, so calling it there would throw. This placeholder renders in
// live editing instead, which is the legitimate reason to supply an override:
// the helper invokes a Node/build-time API that can't run in the browser.
export default function fileSize() {
  return "— (server-only)";
}
