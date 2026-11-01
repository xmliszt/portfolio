const PREFIX = "toy:";

/** Return the finger id a toy with `toyId` takes in the room's fingers, which cannot clash with a player id. */
export function getToyFingerId(toyId: string) {
  return `${PREFIX}${toyId}`;
}
