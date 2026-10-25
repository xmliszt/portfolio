export function getToyBoxWindow(now: Date) {
  const start = new Date(now);
  start.setHours(19, 55, 0, 0);
  const end = new Date(now);
  end.setHours(20, 55, 0, 0);
  return {
    startMs: start.getTime(),
    endMs: end.getTime(),
    active: now.getTime() >= start.getTime() && now.getTime() < end.getTime(),
  };
}
