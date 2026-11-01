/** `true` if a click on `event.target` follows an in-app link to a different URL; `false` for new tabs, downloads, other origins and the current URL. */
export function isInternalNavigation(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }
  const anchor =
    event.target instanceof Element ? event.target.closest("a") : null;
  if (
    anchor === null ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  ) {
    return false;
  }
  const url = new URL(anchor.href, window.location.href);
  return (
    url.origin === window.location.origin &&
    url.pathname + url.search !==
      window.location.pathname + window.location.search
  );
}
