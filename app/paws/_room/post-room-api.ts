/** Send `body` to the room route at `path` with the visitor's access token and return the parsed JSON answer, or `undefined` when the request fails. */
export async function postRoomApi(options: {
  path: "join" | "heartbeat" | "leave";
  accessToken: string;
  body: object;
  keepalive?: boolean;
}): Promise<unknown> {
  try {
    const response = await fetch(`/api/paws/rooms/${options.path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.body),
      keepalive: options.keepalive,
    });
    return await response.json();
  } catch {
    return undefined;
  }
}
