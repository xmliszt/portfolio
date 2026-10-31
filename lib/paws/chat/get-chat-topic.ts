/** Return the Realtime topic the server sends room `roomId`'s chat lines on. */
export function getChatTopic(roomId: string) {
  return `paws:chat:${roomId}`;
}
