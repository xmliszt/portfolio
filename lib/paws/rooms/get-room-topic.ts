/** Return the Realtime topic of the room `roomId`. */
export function getRoomTopic(roomId: string) {
  return `paws:room:${roomId}`;
}
