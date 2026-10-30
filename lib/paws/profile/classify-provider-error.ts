const REFUSAL_PATTERN =
  /moderat|policy|policies|prohibit|unsafe|violat|inappropriate|not allowed|harmful|content filter|safety|flagged|blocked|restricted|invalid_content/i;

/** Return `"refusedByProvider"` for a 400 or 422 response whose body reads like a content refusal, and `"failed"` for every other error status. */
export function classifyProviderError(options: { status: number; body: string }) {
  const isContentStatus = options.status === 400 || options.status === 422;
  return isContentStatus && REFUSAL_PATTERN.test(options.body) ? "refusedByProvider" : "failed";
}
