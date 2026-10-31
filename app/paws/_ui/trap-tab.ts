const FOCUSABLE =
  "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex='0']";

/** Keep Tab and Shift+Tab inside `event.currentTarget`, moving from its last focusable element to its first and back, and from the container itself to its first or last. */
export function trapTab(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const focusable = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
  ];
  const index = focusable.findIndex(
    (element) => element === document.activeElement
  );
  const target = (() => {
    if (event.shiftKey) return index <= 0 ? focusable.at(-1) : undefined;
    const isLast = index === focusable.length - 1;
    return index === -1 || isLast ? focusable.at(0) : undefined;
  })();
  if (target === undefined) return;
  event.preventDefault();
  target.focus();
}
