const SOUTHERN_ZONES = [
  "Australia/",
  "Pacific/Auckland",
  "America/Argentina",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Montevideo",
  "Africa/Johannesburg",
];

const TROPICAL_ZONES = [
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Jakarta",
  "Asia/Bangkok",
  "Asia/Manila",
  "Asia/Ho_Chi_Minh",
  "Asia/Colombo",
  "America/Bogota",
  "America/Lima",
  "America/Caracas",
  "Africa/Lagos",
  "Africa/Nairobi",
];

/** Return a rough latitude for IANA `timeZone`: 5 for a tropical zone, -34 for a southern one, and 40 otherwise. */
export function guessLatitude(timeZone: string) {
  if (TROPICAL_ZONES.some((zone) => timeZone.startsWith(zone))) return 5;
  if (SOUTHERN_ZONES.some((zone) => timeZone.startsWith(zone))) return -34;
  return 40;
}
