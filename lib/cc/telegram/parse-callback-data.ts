const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Return the action a button's `callback_data` asks for, such as `{ kind: "skip", postId }` for "skip:<postId>", or `undefined` when it is not one CC sends. */
export function parseCallbackData(data: string) {
  const [action, postId = ""] = data.split(":");
  return action === "skip" && UUID.test(postId)
    ? { kind: "skip" as const, postId }
    : undefined;
}
