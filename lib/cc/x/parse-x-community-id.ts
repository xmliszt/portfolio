/** Return the community id from a raw id or an X community link (`…/i/communities/<id>`), or `undefined` when `input` holds neither. */
export function parseXCommunityId(input: string) {
  const trimmed = input.trim();
  if (/^\d{1,19}$/.test(trimmed)) return trimmed;
  return /\/i\/communities\/(\d{1,19})/.exec(trimmed)?.at(1);
}
